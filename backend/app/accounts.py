import base64
import contextvars
import hashlib
import hmac
import json
import logging
import os
import re
import secrets
import string
import threading
import time
import uuid
from collections import defaultdict, deque
from datetime import datetime, timedelta
from typing import Callable, List, Optional

import jwt
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from sqlalchemy import event, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, with_loader_criteria

from app.database import (
    OWNED_MODELS,
    AccountDB,
    AccountSessionDB,
    AdminAuditLogDB,
    get_db,
)

logger = logging.getLogger("lexcloud.accounts")

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
SESSION_HOURS = int(os.getenv("SESSION_HOURS", "24"))
TEMP_PASSWORD_HOURS = int(os.getenv("TEMP_PASSWORD_HOURS", "48"))
LAST_SEEN_THROTTLE = timedelta(seconds=60)
GENERIC_LOGIN_ERROR = "Kullanıcı No veya şifre hatalı"

current_owner_id: contextvars.ContextVar[Optional[str]] = contextvars.ContextVar("current_owner_id", default=None)
sessions_ended_hooks: List[Callable[[List[str]], None]] = []

router = APIRouter()
bearer = HTTPBearer()


# ─── Per-account data scoping ───

@event.listens_for(Session, "do_orm_execute")
def _scope_to_owner(state):
    owner = state.session.info.get("owner_id")
    if owner is None or state.is_column_load or state.is_relationship_load:
        return
    if state.is_select or state.is_update or state.is_delete:
        state.statement = state.statement.options(
            *[with_loader_criteria(model, model.owner_id == owner, include_aliases=True) for model in OWNED_MODELS]
        )


@event.listens_for(Session, "before_flush")
def _assign_owner(session, flush_context, instances):
    owner = session.info.get("owner_id")
    if owner is None:
        return
    for obj in session.new:
        if isinstance(obj, OWNED_MODELS) and obj.owner_id is None:
            obj.owner_id = owner


# ─── Passwords and identifiers ───

_SCRYPT_N, _SCRYPT_R, _SCRYPT_P = 2 ** 14, 8, 1


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=_SCRYPT_N, r=_SCRYPT_R, p=_SCRYPT_P, dklen=32)
    return "scrypt${}${}${}${}${}".format(
        _SCRYPT_N, _SCRYPT_R, _SCRYPT_P,
        base64.b64encode(salt).decode(), base64.b64encode(digest).decode(),
    )


def verify_password(password: str, stored: Optional[str]) -> bool:
    try:
        _, n, r, p, salt_b64, digest_b64 = (stored or "").split("$")
        expected = base64.b64decode(digest_b64)
        digest = hashlib.scrypt(password.encode(), salt=base64.b64decode(salt_b64), n=int(n), r=int(r), p=int(p), dklen=len(expected))
        return hmac.compare_digest(digest, expected)
    except Exception:
        return False


_DUMMY_HASH = hash_password(secrets.token_urlsafe(16))


def generate_user_no() -> str:
    """11-digit number shaped like a national ID that deliberately fails the
    TC Kimlik checksum, so it can never be a real person's number."""
    digits = [secrets.randbelow(9) + 1] + [secrets.randbelow(10) for _ in range(8)]
    tc_d10 = ((sum(digits[0:9:2]) * 7) - sum(digits[1:8:2])) % 10
    d10 = (tc_d10 + 1 + secrets.randbelow(9)) % 10
    digits.append(d10)
    digits.append(secrets.randbelow(10))
    return "".join(map(str, digits))


def generate_temp_password(length: int = 16) -> str:
    alphabet = "".join(c for c in string.ascii_letters + string.digits if c not in "O0Il1")
    symbols = "!@#$%*-_?"
    while True:
        pw = "".join(secrets.choice(alphabet + symbols) for _ in range(length))
        if (any(c.islower() for c in pw) and any(c.isupper() for c in pw)
                and any(c.isdigit() for c in pw) and any(c in symbols for c in pw)):
            return pw


def password_problem(password: str) -> Optional[str]:
    if len(password) < 8:
        return "Yeni şifre en az 8 karakter olmalıdır."
    if not re.search(r"[A-Za-zÇĞİÖŞÜçğıöşü]", password) or not re.search(r"\d", password):
        return "Yeni şifre en az bir harf ve bir rakam içermelidir."
    return None


def _create_account(db: Session, **fields) -> AccountDB:
    for _ in range(20):
        account = AccountDB(id=str(uuid.uuid4()), user_no=generate_user_no(), created_at=datetime.utcnow(), **fields)
        db.add(account)
        try:
            db.flush()
            return account
        except IntegrityError as e:
            db.rollback()
            if "user_no" not in str(e.orig):
                raise
    raise RuntimeError("Could not allocate a unique Kullanıcı No")


# ─── Startup migration and setup ───

_MIGRATION_LOCK_KEY = 74193201


def run_account_migration(engine, legacy_password: str) -> None:
    owned_tables = ["clients", "cases", "compensation_letters", "executions", "important_reminders", "settings_options"]
    with engine.begin() as conn:
        conn.execute(text("SELECT pg_advisory_xact_lock(:k)"), {"k": _MIGRATION_LOCK_KEY})
        conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS uq_accounts_single_admin ON accounts (is_admin) WHERE is_admin"))
        conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS uq_accounts_single_legacy ON accounts (is_legacy) WHERE is_legacy"))
        for table in owned_tables:
            conn.execute(text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS owner_id VARCHAR"))
            conn.execute(text(f"CREATE INDEX IF NOT EXISTS ix_{table}_owner_id ON {table} (owner_id)"))
        legacy_id = conn.execute(text("SELECT id FROM accounts WHERE is_legacy")).scalar()
        if legacy_id is None:
            for _ in range(20):
                user_no = generate_user_no()
                if conn.execute(text("SELECT 1 FROM accounts WHERE user_no = :u"), {"u": user_no}).scalar() is None:
                    break
            legacy_id = str(uuid.uuid4())
            conn.execute(
                text("INSERT INTO accounts (id, user_no, password_hash, is_admin, is_legacy, label, must_change_password, created_at) "
                     "VALUES (:id, :u, :h, false, true, :label, false, :now)"),
                {"id": legacy_id, "u": user_no, "h": hash_password(legacy_password), "label": "Mevcut LexCloud hesabı", "now": datetime.utcnow()},
            )
            logger.info("Created the existing LexCloud account record")
        for table in owned_tables:
            moved = conn.execute(text(f"UPDATE {table} SET owner_id = :o WHERE owner_id IS NULL"), {"o": legacy_id}).rowcount
            if moved:
                logger.info(f"Attached {moved} {table} rows to the existing LexCloud account")
        conn.execute(text("ALTER TABLE settings_options DROP CONSTRAINT IF EXISTS uq_settings_category_value"))
        conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS uq_settings_owner_category_value ON settings_options (owner_id, category, value)"))


def ensure_admin_account(db: Session):
    """Create the single admin account once. Returns (user_no, temp_password);
    temp_password is None when the admin already existed."""
    db.execute(text("SELECT pg_advisory_xact_lock(:k)"), {"k": _MIGRATION_LOCK_KEY})
    existing = db.query(AccountDB).filter(AccountDB.is_admin == True).first()
    if existing:
        user_no = existing.user_no
        db.rollback()
        return user_no, None
    temp = generate_temp_password()
    account = _create_account(
        db, password_hash=hash_password(temp), is_admin=True, is_legacy=False, label="Yönetici",
        must_change_password=True, temp_password_expires_at=datetime.utcnow() + timedelta(hours=TEMP_PASSWORD_HOURS),
    )
    user_no = account.user_no
    db.commit()
    return user_no, temp


# ─── Login rate limiting ───

class _RateLimiter:
    def __init__(self):
        self._hits = defaultdict(deque)
        self._lock = threading.Lock()

    def blocked(self, key: str, limit: int, window: int) -> bool:
        now = time.monotonic()
        with self._lock:
            q = self._hits[key]
            while q and now - q[0] > window:
                q.popleft()
            return len(q) >= limit

    def hit(self, key: str):
        with self._lock:
            self._hits[key].append(time.monotonic())

    def clear(self, key: str):
        with self._lock:
            self._hits.pop(key, None)


login_limiter = _RateLimiter()
IP_LIMIT, USER_LIMIT, WINDOW = 20, 5, 15 * 60


def client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def describe_user_agent(ua: Optional[str]) -> str:
    ua = ua or ""
    browser = next((name for pat, name in [
        ("Edg/", "Edge"), ("OPR/", "Opera"), ("SamsungBrowser", "Samsung Internet"), ("Firefox/", "Firefox"),
        ("CriOS", "Chrome"), ("Chrome/", "Chrome"), ("Safari/", "Safari"),
    ] if pat in ua), "Bilinmeyen tarayıcı")
    os_name = next((name for pat, name in [
        ("Windows", "Windows"), ("Android", "Android"), ("iPhone", "iOS"), ("iPad", "iPadOS"),
        ("Mac OS X", "macOS"), ("CrOS", "ChromeOS"), ("Linux", "Linux"),
    ] if pat in ua), "Bilinmeyen sistem")
    kind = "Tablet" if ("iPad" in ua or "Tablet" in ua) else "Mobil" if ("Mobi" in ua or "iPhone" in ua) else "Masaüstü"
    return f"{browser} · {os_name} · {kind}"


# ─── Sessions ───

class AuthContext:
    def __init__(self, account: AccountDB, session: AccountSessionDB):
        self.account = account
        self.session = session


def _active_filter(query, now):
    return query.filter(AccountSessionDB.ended_at.is_(None), AccountSessionDB.expires_at > now)


def end_sessions(db: Session, sessions: List[AccountSessionDB], reason: str) -> List[str]:
    now = datetime.utcnow()
    ended = []
    for s in sessions:
        if s.ended_at is None:
            s.ended_at = now
            s.end_reason = reason
            ended.append(s.id)
    return ended


def notify_sessions_ended(session_ids: List[str]):
    if not session_ids:
        return
    for hook in sessions_ended_hooks:
        try:
            hook(session_ids)
        except Exception as e:
            logger.warning(f"sessions_ended hook failed: {e}")


def _issue_token(session: AccountSessionDB) -> str:
    return jwt.encode({"sid": session.id, "exp": int(session.expires_at.timestamp())}, JWT_SECRET, algorithm=JWT_ALGORITHM)


def resolve_session(db: Session, token: str) -> AuthContext:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    sid = payload.get("sid")
    if not sid:
        raise HTTPException(status_code=401, detail="Invalid token")
    now = datetime.utcnow()
    row = (
        db.query(AccountSessionDB, AccountDB)
        .join(AccountDB, AccountDB.id == AccountSessionDB.account_id)
        .filter(AccountSessionDB.id == sid)
        .first()
    )
    if not row:
        raise HTTPException(status_code=401, detail="Invalid token")
    session, account = row
    if session.ended_at is not None or session.expires_at <= now:
        raise HTTPException(status_code=401, detail="Session ended")
    if now - session.last_seen_at > LAST_SEEN_THROTTLE:
        session.last_seen_at = now
        db.commit()
    return AuthContext(account, session)


async def get_auth(creds: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(get_db)) -> AuthContext:
    return resolve_session(db, creds.credentials)


async def verify_token(ctx: AuthContext = Depends(get_auth), db: Session = Depends(get_db)):
    """Standard LexCloud data access: scoped to the signed-in account."""
    if ctx.account.must_change_password:
        raise HTTPException(status_code=403, detail="password_change_required")
    if ctx.account.is_admin:
        raise HTTPException(status_code=403, detail="Bu işlem için yetkiniz yok")
    db.info["owner_id"] = ctx.account.id
    current_owner_id.set(ctx.account.id)
    return {"sid": ctx.session.id, "account_id": ctx.account.id}


async def require_admin(ctx: AuthContext = Depends(get_auth)) -> AuthContext:
    if not ctx.account.is_admin:
        raise HTTPException(status_code=403, detail="Bu işlem için yetkiniz yok")
    if ctx.account.must_change_password:
        raise HTTPException(status_code=403, detail="password_change_required")
    return ctx


def audit(db: Session, admin: AccountDB, action: str, target: Optional[AccountDB] = None, **details):
    db.add(AdminAuditLogDB(
        id=str(uuid.uuid4()), admin_account_id=admin.id, action=action,
        target_account_id=target.id if target else None,
        details=json.dumps({**({"user_no": target.user_no} if target else {}), **details}, ensure_ascii=False),
        created_at=datetime.utcnow(),
    ))


def account_type(account: AccountDB) -> str:
    return "admin" if account.is_admin else "standard"


# ─── Auth endpoints ───

class LoginRequest(BaseModel):
    password: str
    user_no: Optional[str] = None
    device_id: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/api/login")
async def login(body: LoginRequest, request: Request, db: Session = Depends(get_db)):
    ip = client_ip(request)
    user_no = re.sub(r"\D", "", body.user_no or "")
    ip_key, user_key = f"ip:{ip}", f"user:{user_no or 'legacy'}"
    if login_limiter.blocked(ip_key, IP_LIMIT, WINDOW) or login_limiter.blocked(user_key, USER_LIMIT, WINDOW):
        raise HTTPException(status_code=429, detail="Çok fazla hatalı deneme. Lütfen 15 dakika sonra tekrar deneyin.")

    if user_no:
        account = db.query(AccountDB).filter(AccountDB.user_no == user_no).first()
    elif body.user_no is None or body.user_no.strip() == "":
        account = db.query(AccountDB).filter(AccountDB.is_legacy == True).first()
    else:
        account = None
    now = datetime.utcnow()
    ok = verify_password(body.password, account.password_hash if account else _DUMMY_HASH) and account is not None
    if ok and account.must_change_password and account.temp_password_expires_at and account.temp_password_expires_at <= now:
        ok = False
    if not ok:
        login_limiter.hit(ip_key)
        login_limiter.hit(user_key)
        raise HTTPException(status_code=401, detail=GENERIC_LOGIN_ERROR)
    login_limiter.clear(user_key)

    device_id = (body.device_id or "")[:64] or str(uuid.uuid4())
    same_device = _active_filter(db.query(AccountSessionDB), now).filter(
        AccountSessionDB.account_id == account.id, AccountSessionDB.device_id == device_id
    ).all()
    replaced = end_sessions(db, same_device, "replaced")
    session = AccountSessionDB(
        id=str(uuid.uuid4()), account_id=account.id, device_id=device_id,
        user_agent=(request.headers.get("user-agent") or "")[:500], ip_address=ip,
        created_at=now, last_seen_at=now, expires_at=now + timedelta(hours=SESSION_HOURS),
    )
    db.add(session)
    if account.is_admin:
        audit(db, account, "admin_login", device=describe_user_agent(session.user_agent))
    db.commit()
    notify_sessions_ended(replaced)
    return {
        "token": _issue_token(session),
        "account_type": account_type(account),
        "must_change_password": account.must_change_password,
        "user_no": account.user_no,
    }


@router.post("/api/logout")
async def logout(request: Request, db: Session = Depends(get_db)):
    auth = request.headers.get("authorization", "")
    if auth.lower().startswith("bearer "):
        try:
            ctx = resolve_session(db, auth[7:])
            ended = end_sessions(db, [ctx.session], "logout")
            if ctx.account.is_admin:
                audit(db, ctx.account, "admin_logout")
            db.commit()
            notify_sessions_ended(ended)
        except HTTPException:
            pass
    return {"message": "Logged out successfully"}


@router.get("/api/auth/me")
async def me(ctx: AuthContext = Depends(get_auth)):
    a = ctx.account
    return {
        "user_no": a.user_no,
        "account_type": account_type(a),
        "must_change_password": a.must_change_password,
        "label": a.label,
    }


@router.post("/api/auth/change-password")
async def change_password(body: ChangePasswordRequest, ctx: AuthContext = Depends(get_auth), db: Session = Depends(get_db)):
    account = ctx.account
    if not verify_password(body.current_password, account.password_hash):
        raise HTTPException(status_code=400, detail="Mevcut şifre hatalı")
    problem = password_problem(body.new_password)
    if problem:
        raise HTTPException(status_code=400, detail=problem)
    if body.new_password == body.current_password:
        raise HTTPException(status_code=400, detail="Yeni şifre mevcut şifreden farklı olmalıdır.")
    now = datetime.utcnow()
    account.password_hash = hash_password(body.new_password)
    account.must_change_password = False
    account.temp_password_expires_at = None
    account.password_changed_at = now
    others = _active_filter(db.query(AccountSessionDB), now).filter(
        AccountSessionDB.account_id == account.id, AccountSessionDB.id != ctx.session.id
    ).all()
    ended = end_sessions(db, others, "password_changed")
    if account.is_admin:
        audit(db, account, "admin_password_changed", closed_sessions=len(ended))
    db.commit()
    notify_sessions_ended(ended)
    return {"message": "Şifre değiştirildi", "closed_sessions": len(ended)}


# ─── Admin panel endpoints ───

def _session_view(s: AccountSessionDB, now: datetime) -> dict:
    status = "active"
    if s.ended_at is not None:
        status = s.end_reason or "ended"
    elif s.expires_at <= now:
        status = "expired"
    return {
        "id": s.id,
        "device_id": s.device_id,
        "device": describe_user_agent(s.user_agent),
        "ip_address": s.ip_address,
        "created_at": s.created_at.isoformat(),
        "last_seen_at": s.last_seen_at.isoformat(),
        "expires_at": s.expires_at.isoformat(),
        "ended_at": s.ended_at.isoformat() if s.ended_at else None,
        "status": status,
    }


@router.get("/api/admin/accounts")
async def admin_list_accounts(ctx: AuthContext = Depends(require_admin), db: Session = Depends(get_db)):
    now = datetime.utcnow()
    accounts = db.query(AccountDB).order_by(AccountDB.is_admin.desc(), AccountDB.is_legacy.desc(), AccountDB.created_at).all()
    recent = now - timedelta(days=30)
    sessions = db.query(AccountSessionDB).filter(
        (AccountSessionDB.ended_at.is_(None)) | (AccountSessionDB.created_at >= recent)
    ).order_by(AccountSessionDB.last_seen_at.desc()).all()
    by_account = defaultdict(list)
    for s in sessions:
        by_account[s.account_id].append(s)
    result = []
    for a in accounts:
        mine = by_account.get(a.id, [])
        active = [s for s in mine if s.ended_at is None and s.expires_at > now]
        temp_state = None
        if a.must_change_password:
            temp_state = "expired" if a.temp_password_expires_at and a.temp_password_expires_at <= now else "pending"
        result.append({
            "id": a.id,
            "user_no": a.user_no,
            "label": a.label,
            "account_type": account_type(a),
            "is_legacy": a.is_legacy,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "temp_password": temp_state,
            "temp_password_expires_at": a.temp_password_expires_at.isoformat() if a.temp_password_expires_at else None,
            "active_device_count": len({s.device_id for s in active}),
            "active_session_count": len(active),
            "sessions": [_session_view(s, now) for s in mine[:50]],
        })
    return result


class CreateAccountRequest(BaseModel):
    label: Optional[str] = None


def _new_temp_password_for(account: AccountDB) -> str:
    temp = generate_temp_password()
    account.password_hash = hash_password(temp)
    account.must_change_password = True
    account.temp_password_expires_at = datetime.utcnow() + timedelta(hours=TEMP_PASSWORD_HOURS)
    return temp


@router.post("/api/admin/accounts")
async def admin_create_account(body: CreateAccountRequest, ctx: AuthContext = Depends(require_admin), db: Session = Depends(get_db)):
    label = (body.label or "").strip()[:100] or None
    temp = generate_temp_password()
    account = _create_account(
        db, password_hash=hash_password(temp), is_admin=False, is_legacy=False, label=label,
        must_change_password=True, temp_password_expires_at=datetime.utcnow() + timedelta(hours=TEMP_PASSWORD_HOURS),
    )
    audit(db, ctx.account, "create_user", account, label=label)
    db.commit()
    return {"id": account.id, "user_no": account.user_no, "temp_password": temp,
            "temp_password_expires_at": account.temp_password_expires_at.isoformat()}


def _get_standard_account(db: Session, account_id: str) -> AccountDB:
    account = db.query(AccountDB).filter(AccountDB.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Hesap bulunamadı")
    return account


@router.post("/api/admin/accounts/{account_id}/reset-password")
async def admin_reset_password(account_id: str, ctx: AuthContext = Depends(require_admin), db: Session = Depends(get_db)):
    account = _get_standard_account(db, account_id)
    if account.is_admin:
        raise HTTPException(status_code=400, detail="Yönetici şifresi Şifre Değiştir bölümünden değiştirilir")
    temp = _new_temp_password_for(account)
    ended = end_sessions(db, _active_filter(db.query(AccountSessionDB), datetime.utcnow()).filter(AccountSessionDB.account_id == account.id).all(), "password_reset")
    audit(db, ctx.account, "reset_password", account, closed_sessions=len(ended))
    db.commit()
    notify_sessions_ended(ended)
    return {"user_no": account.user_no, "temp_password": temp,
            "temp_password_expires_at": account.temp_password_expires_at.isoformat()}


@router.post("/api/admin/sessions/{session_id}/revoke")
async def admin_revoke_session(session_id: str, ctx: AuthContext = Depends(require_admin), db: Session = Depends(get_db)):
    session = db.query(AccountSessionDB).filter(AccountSessionDB.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Oturum bulunamadı")
    target = db.query(AccountDB).filter(AccountDB.id == session.account_id).first()
    ended = end_sessions(db, [session], "revoked")
    audit(db, ctx.account, "revoke_session", target, device=describe_user_agent(session.user_agent))
    db.commit()
    notify_sessions_ended(ended)
    return {"closed_sessions": len(ended)}


@router.post("/api/admin/accounts/{account_id}/revoke-sessions")
async def admin_revoke_all(account_id: str, ctx: AuthContext = Depends(require_admin), db: Session = Depends(get_db)):
    account = _get_standard_account(db, account_id)
    query = _active_filter(db.query(AccountSessionDB), datetime.utcnow()).filter(AccountSessionDB.account_id == account.id)
    if account.id == ctx.account.id:
        query = query.filter(AccountSessionDB.id != ctx.session.id)
    ended = end_sessions(db, query.all(), "revoked")
    audit(db, ctx.account, "revoke_all_sessions", account, closed_sessions=len(ended))
    db.commit()
    notify_sessions_ended(ended)
    return {"closed_sessions": len(ended)}


@router.get("/api/admin/audit-log")
async def admin_audit_log(ctx: AuthContext = Depends(require_admin), db: Session = Depends(get_db)):
    rows = db.query(AdminAuditLogDB).order_by(AdminAuditLogDB.created_at.desc()).limit(200).all()
    return [{
        "id": r.id, "action": r.action, "target_account_id": r.target_account_id,
        "details": json.loads(r.details) if r.details else {}, "created_at": r.created_at.isoformat(),
    } for r in rows]
