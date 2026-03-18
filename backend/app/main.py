from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect, Query
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Set
from datetime import datetime, date
import json
import uuid
import jwt
import os
import asyncio
import threading
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text, Index, ForeignKey, or_
import logging
from app.database import get_db, create_tables, ClientDB, CaseDB, CompensationLetterDB, ExecutionDB
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="LexCloud API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.on_event("startup")
async def startup_event():
    print("Initializing database on startup...")
    
    database_url = os.getenv("DATABASE_URL", "NOT_SET")
    if database_url != "NOT_SET":
        try:
            from urllib.parse import urlparse
            parsed = urlparse(database_url)
            db_host = parsed.hostname
            db_name = parsed.path.lstrip('/')
            driver = "postgres"
            print(f"✅ Connected to DB: {db_host}/{db_name}")
            print(f"Database driver: {driver}")
            print(f"Database host: {db_host}")
            print(f"Database name: {db_name}")
        except Exception as e:
            print(f"⚠️ Could not parse DATABASE_URL: {e}")
    else:
        print("❌ DATABASE_URL not set!")
        raise ValueError("DATABASE_URL environment variable is required")
    
    try:
        create_tables()
        print("✅ Database tables created successfully")
    except Exception as table_error:
        print(f"⚠️ Table creation failed: {table_error}")
        print("✅ Backend starting without table creation - tables may already exist")
    
    try:
        from app.database import engine
        from sqlalchemy.orm import sessionmaker
        from sqlalchemy import text
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        with SessionLocal() as db:
            try:
                db.execute(text("SELECT vekalet_ofis_no FROM clients LIMIT 1"))
                print("✅ vekalet_ofis_no column already exists")
            except Exception:
                print("🔧 Adding vekalet_ofis_no column to clients table...")
                db.execute(text("ALTER TABLE clients ADD COLUMN vekalet_ofis_no VARCHAR"))
                db.commit()
                print("✅ Successfully added vekalet_ofis_no column")
    except Exception as migration_error:
        print(f"⚠️ Migration error: {migration_error}")
    
    # Migration: add is_starred column to cases, executions, compensation_letters
    try:
        from app.database import engine
        from sqlalchemy.orm import sessionmaker as sm2
        from sqlalchemy import text as text2
        SL2 = sm2(autocommit=False, autoflush=False, bind=engine)
        with SL2() as db:
            for table_name in ['cases', 'executions', 'compensation_letters']:
                try:
                    db.execute(text2(f"SELECT is_starred FROM {table_name} LIMIT 1"))
                    print(f"✅ is_starred column already exists in {table_name}")
                except Exception:
                    db.rollback()
                    print(f"🔧 Adding is_starred column to {table_name}...")
                    db.execute(text2(f"ALTER TABLE {table_name} ADD COLUMN is_starred BOOLEAN DEFAULT false NOT NULL"))
                    db.commit()
                    print(f"✅ Successfully added is_starred column to {table_name}")
    except Exception as starred_migration_error:
        print(f"⚠️ is_starred migration error: {starred_migration_error}")
    
    # Migration: add haciz_reminder_date, haciz_reminder_text, related_case_id columns to executions
    try:
        from app.database import engine as eng3
        from sqlalchemy.orm import sessionmaker as sm3
        from sqlalchemy import text as text3
        SL3 = sm3(autocommit=False, autoflush=False, bind=eng3)
        with SL3() as db:
            for col_name, col_type in [('haciz_reminder_date', 'DATE'), ('haciz_reminder_text', 'TEXT'), ('related_case_id', 'VARCHAR')]:
                try:
                    db.execute(text3(f"SELECT {col_name} FROM executions LIMIT 1"))
                    print(f"Column {col_name} already exists in executions")
                except Exception:
                    db.rollback()
                    print(f"Adding {col_name} column to executions...")
                    db.execute(text3(f"ALTER TABLE executions ADD COLUMN {col_name} {col_type}"))
                    db.commit()
                    print(f"Successfully added {col_name} column to executions")
    except Exception as haciz_migration_error:
        print(f"haciz migration error: {haciz_migration_error}")
    
    # Migration: make client_id nullable in cases table
    try:
        from app.database import engine as eng4
        from sqlalchemy.orm import sessionmaker as sm4
        from sqlalchemy import text as text4
        SL4 = sm4(autocommit=False, autoflush=False, bind=eng4)
        with SL4() as db:
            try:
                db.execute(text4("ALTER TABLE cases ALTER COLUMN client_id DROP NOT NULL"))
                db.commit()
                print("Successfully made client_id nullable")
            except Exception:
                db.rollback()
                print("client_id is already nullable or migration not needed")
    except Exception as e:
        print(f"client_id migration error: {e}")
    
    print("✅ Backend startup completed - table creation and migration completed")

class Client(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    address: str
    tax_id: Optional[str] = None
    vekalet_ofis_no: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    version: int

class ClientCreate(BaseModel):
    name: str
    email: str
    phone: str
    address: str
    tax_id: Optional[str] = None
    vekalet_ofis_no: Optional[str] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    tax_id: Optional[str] = None
    vekalet_ofis_no: Optional[str] = None
    version: int

class Case(BaseModel):
    id: str
    title: str
    case_name: Optional[str] = None
    description: Optional[str] = None
    client_id: Optional[str] = ""
    client_name: str
    case_type: str
    status: str
    court: str
    case_number: str
    defendant: str
    notes: Optional[str] = None
    start_date: date
    next_hearing_date: Optional[date] = None
    reminder_date: Optional[date] = None
    office_archive_no: str
    responsible_person: Optional[str] = None
    görevlendiren: Optional[str] = None
    is_starred: bool = False
    created_at: datetime
    updated_at: datetime
    version: int

class CaseCreate(BaseModel):
    title: str
    case_name: Optional[str] = None
    description: Optional[str] = None
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    case_type: str
    status: str
    court: str
    case_number: str
    defendant: str
    notes: Optional[str] = None
    start_date: date
    next_hearing_date: Optional[date] = None
    reminder_date: Optional[date] = None
    office_archive_no: str
    responsible_person: Optional[str] = None
    görevlendiren: Optional[str] = None
    is_starred: bool = False

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    case_name: Optional[str] = None
    description: Optional[str] = None
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    case_type: Optional[str] = None
    status: Optional[str] = None
    court: Optional[str] = None
    case_number: Optional[str] = None
    defendant: Optional[str] = None
    notes: Optional[str] = None
    start_date: Optional[date] = None
    next_hearing_date: Optional[date] = None
    reminder_date: Optional[date] = None
    office_archive_no: Optional[str] = None
    responsible_person: Optional[str] = None
    görevlendiren: Optional[str] = None
    is_starred: Optional[bool] = None
    version: Optional[int] = None

class CompensationLetter(BaseModel):
    id: str
    title: str
    client_id: str
    client_name: str
    letter_number: str
    bank: str
    customer_number: str
    customer: str
    court: str
    case_number: str
    status: str
    description_text: Optional[str] = None
    reminder_date: Optional[date] = None
    reminder_text: Optional[str] = None
    responsible_person: Optional[str] = None
    görevlendiren: Optional[str] = None
    is_starred: bool = False
    created_at: datetime
    updated_at: datetime
    version: int

class CompensationLetterCreate(BaseModel):
    client_id: str
    letter_number: str
    bank: str
    customer_number: str
    customer: str
    court: str
    case_number: str
    status: str
    description_text: Optional[str] = None
    reminder_date: Optional[date] = None
    reminder_text: Optional[str] = None
    responsible_person: Optional[str] = None
    görevlendiren: Optional[str] = None
    is_starred: bool = False

class CompensationLetterUpdate(BaseModel):
    client_id: Optional[str] = None
    letter_number: Optional[str] = None
    bank: Optional[str] = None
    customer_number: Optional[str] = None
    customer: Optional[str] = None
    court: Optional[str] = None
    case_number: Optional[str] = None
    status: Optional[str] = None
    description_text: Optional[str] = None
    reminder_date: Optional[date] = None
    reminder_text: Optional[str] = None
    responsible_person: Optional[str] = None
    görevlendiren: Optional[str] = None
    is_starred: Optional[bool] = None
    version: Optional[int] = None

class Execution(BaseModel):
    id: str
    client_id: str
    client_name: str
    defendant: str
    execution_office: str
    execution_number: str
    status: str
    execution_type: str
    start_date: date
    office_archive_no: str
    reminder_date: Optional[date] = None
    reminder_text: Optional[str] = None
    notes: Optional[str] = None
    haciz_durumu: Optional[str] = None
    haciz_reminder_date: Optional[date] = None
    haciz_reminder_text: Optional[str] = None
    related_case_id: Optional[str] = None
    responsible_person: Optional[str] = None
    görevlendiren: Optional[str] = None
    is_starred: bool = False
    created_at: datetime
    updated_at: datetime
    version: int

class ExecutionCreate(BaseModel):
    client_id: str
    defendant: str
    execution_office: str
    execution_number: str
    status: str
    execution_type: str
    start_date: date
    office_archive_no: str
    reminder_date: Optional[date] = None
    reminder_text: Optional[str] = None
    notes: Optional[str] = None
    haciz_durumu: Optional[str] = None
    haciz_reminder_date: Optional[date] = None
    haciz_reminder_text: Optional[str] = None
    related_case_id: Optional[str] = None
    responsible_person: Optional[str] = None
    görevlendiren: Optional[str] = None
    is_starred: bool = False

class ExecutionUpdate(BaseModel):
    client_id: Optional[str] = None
    defendant: Optional[str] = None
    execution_office: Optional[str] = None
    execution_number: Optional[str] = None
    status: Optional[str] = None
    execution_type: Optional[str] = None
    start_date: Optional[date] = None
    office_archive_no: Optional[str] = None
    reminder_date: Optional[date] = None
    reminder_text: Optional[str] = None
    notes: Optional[str] = None
    haciz_durumu: Optional[str] = None
    haciz_reminder_date: Optional[date] = None
    haciz_reminder_text: Optional[str] = None
    related_case_id: Optional[str] = None
    responsible_person: Optional[str] = None
    görevlendiren: Optional[str] = None
    is_starred: Optional[bool] = None
    version: Optional[int] = None

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
JWT_SECRET = os.getenv("JWT_SECRET")

if not ADMIN_PASSWORD:
    raise ValueError("ADMIN_PASSWORD environment variable is required")
if not JWT_SECRET:
    raise ValueError("JWT_SECRET environment variable is required")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.connection_lock = threading.Lock()

    def connect(self, websocket: WebSocket, user_token: str):
        with self.connection_lock:
            if user_token not in self.active_connections:
                self.active_connections[user_token] = set()
            self.active_connections[user_token].add(websocket)

    def disconnect(self, websocket: WebSocket, user_token: str):
        with self.connection_lock:
            if user_token in self.active_connections:
                self.active_connections[user_token].discard(websocket)
                if not self.active_connections[user_token]:
                    del self.active_connections[user_token]

    async def broadcast_data_change(self, change_type: str, entity_type: str, entity_id: str, data: dict):
        serializable_data = self._make_serializable(data)
        
        message = {
            "type": "data_change",
            "change_type": change_type,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "data": serializable_data,
            "timestamp": datetime.now().isoformat()
        }
        
        disconnected_connections = []
        with self.connection_lock:
            for user_token, connections in self.active_connections.items():
                for connection in connections.copy():
                    try:
                        await connection.send_text(json.dumps(message))
                    except Exception as e:
                        print(f"Error sending WebSocket message: {e}")
                        disconnected_connections.append((connection, user_token))
        
        for connection, user_token in disconnected_connections:
            self.disconnect(connection, user_token)
    
    def _make_serializable(self, obj):
        """Convert datetime objects to ISO format strings for JSON serialization"""
        if isinstance(obj, dict):
            return {key: self._make_serializable(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [self._make_serializable(item) for item in obj]
        elif isinstance(obj, (date, datetime)):
            return obj.isoformat()
        else:
            return obj

def db_to_pydantic_client(db_client: ClientDB) -> Client:
    return Client(
        id=db_client.id,
        name=db_client.name,
        email=db_client.email,
        phone=db_client.phone,
        address=db_client.address,
        tax_id=db_client.tax_id,
        vekalet_ofis_no=db_client.vekalet_ofis_no,
        created_at=db_client.created_at,
        updated_at=db_client.updated_at,
        version=db_client.version
    )

def db_to_pydantic_case(db_case: CaseDB) -> Case:
    return Case(
        id=db_case.id,
        title=db_case.title,
        case_name=db_case.case_name,
        description=db_case.description,
        client_id=db_case.client_id if db_case.client_id is not None else "",
        client_name=db_case.client_name,
        case_type=db_case.case_type,
        status=db_case.status,
        court=db_case.court,
        case_number=db_case.case_number,
        defendant=db_case.defendant,
        notes=db_case.notes,
        start_date=db_case.start_date,
        next_hearing_date=db_case.next_hearing_date,
        reminder_date=db_case.reminder_date,
        office_archive_no=db_case.office_archive_no,
        responsible_person=db_case.responsible_person,
        görevlendiren=db_case.görevlendiren,
        is_starred=db_case.is_starred if db_case.is_starred is not None else False,
        created_at=db_case.created_at,
        updated_at=db_case.updated_at,
        version=db_case.version
    )

def db_to_pydantic_compensation_letter(db_letter: CompensationLetterDB) -> CompensationLetter:
    return CompensationLetter(
        id=db_letter.id,
        title=db_letter.title,
        client_id=db_letter.client_id,
        client_name=db_letter.client_name,
        letter_number=db_letter.letter_number,
        bank=db_letter.bank,
        customer_number=db_letter.customer_number,
        customer=db_letter.customer,
        court=db_letter.court,
        case_number=db_letter.case_number,
        status=db_letter.status,
        description_text=db_letter.description_text,
        reminder_date=db_letter.reminder_date,
        reminder_text=db_letter.reminder_text,
        responsible_person=db_letter.responsible_person,
        görevlendiren=db_letter.görevlendiren,
        is_starred=db_letter.is_starred if db_letter.is_starred is not None else False,
        created_at=db_letter.created_at,
        updated_at=db_letter.updated_at,
        version=db_letter.version
    )

def db_to_pydantic_execution(db_execution: ExecutionDB) -> Execution:
    return Execution(
        id=db_execution.id,
        client_id=db_execution.client_id,
        client_name=db_execution.client_name,
        defendant=db_execution.defendant,
        execution_office=db_execution.execution_office,
        execution_number=db_execution.execution_number,
        status=db_execution.status,
        execution_type=db_execution.execution_type,
        start_date=db_execution.start_date,
        office_archive_no=db_execution.office_archive_no,
        reminder_date=db_execution.reminder_date,
        reminder_text=db_execution.reminder_text,
        notes=db_execution.notes,
        haciz_durumu=db_execution.haciz_durumu,
        haciz_reminder_date=db_execution.haciz_reminder_date,
        haciz_reminder_text=db_execution.haciz_reminder_text,
        related_case_id=db_execution.related_case_id,
        responsible_person=db_execution.responsible_person,
        görevlendiren=db_execution.görevlendiren,
        is_starred=db_execution.is_starred if db_execution.is_starred is not None else False,
        created_at=db_execution.created_at,
        updated_at=db_execution.updated_at,
        version=db_execution.version
    )

manager = ConnectionManager()

class LoginRequest(BaseModel):
    password: str

class LoginResponse(BaseModel):
    token: str

class PasswordChangeRequest(BaseModel):
    new_password: str

def verify_token(token: str = Depends(HTTPBearer())):
    try:
        payload = jwt.decode(token.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        await websocket.accept()
        manager.connect(websocket, token)
        
        import asyncio
        async def ping_task():
            while True:
                try:
                    await asyncio.sleep(25)
                    if websocket.client_state == websocket.client_state.CONNECTED:
                        await websocket.ping()
                except Exception:
                    break
        
        ping_coroutine = asyncio.create_task(ping_task())
        
        try:
            while True:
                data = await websocket.receive_text()
                print(f"Received WebSocket message: {data}")
        except WebSocketDisconnect:
            ping_coroutine.cancel()
            manager.disconnect(websocket, token)
    except jwt.InvalidTokenError:
        await websocket.close(code=1008)

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/api/health/websocket")
async def websocket_health():
    connection_count = sum(len(connections) for connections in manager.active_connections.values())
    return {
        "status": "ok",
        "active_connections": connection_count,
        "total_users": len(manager.active_connections)
    }

@app.get("/health/api")
async def api_health():
    return {"status": "ok", "service": "api", "timestamp": datetime.now().isoformat()}

@app.get("/health/db")
async def db_health(db: Session = Depends(get_db)):
    try:
        from sqlalchemy import text
        from urllib.parse import urlparse
        
        db.execute(text("SELECT 1"))
        db.execute(text("CREATE TEMP TABLE health_test (id INTEGER)"))
        db.execute(text("INSERT INTO health_test (id) VALUES (1)"))
        db.execute(text("SELECT id FROM health_test WHERE id = 1"))
        db.execute(text("DROP TABLE health_test"))
        db.commit()
        
        database_url = os.getenv("DATABASE_URL", "")
        parsed = urlparse(database_url)
        
        return {
            "connected": True,
            "driver": "postgres",
            "host": parsed.hostname or "unknown",
            "db": parsed.path.lstrip('/') or "unknown",
            "status": "ok",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        db.rollback()
        return {
            "connected": False,
            "driver": "postgres",
            "host": "unknown",
            "db": "unknown", 
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@app.get("/health/ws")
async def ws_health():
    connection_count = sum(len(connections) for connections in manager.active_connections.values())
    return {
        "status": "ok",
        "websocket": "active",
        "active_connections": connection_count,
        "total_users": len(manager.active_connections),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/health/database")
async def database_health(db: Session = Depends(get_db)):
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": "disconnected", "error": str(e)}

@app.post("/api/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    if request.password == ADMIN_PASSWORD:
        token = jwt.encode(
            {"exp": datetime.utcnow().timestamp() + (JWT_EXPIRATION_HOURS * 3600)},
            JWT_SECRET,
            algorithm=JWT_ALGORITHM
        )
        return LoginResponse(token=token)
    raise HTTPException(status_code=401, detail="Invalid password")

@app.post("/api/logout")
async def logout():
    return {"message": "Logged out successfully"}

@app.post("/api/change-password")
async def change_password(request: PasswordChangeRequest, token: str = Depends(verify_token)):
    global ADMIN_PASSWORD
    ADMIN_PASSWORD = request.new_password
    return {"message": "Password changed successfully"}

@app.get("/api/backup")
async def backup_data(db: Session = Depends(get_db), token: str = Depends(verify_token)):
    db_clients = db.query(ClientDB).filter(ClientDB.is_deleted == False).all()
    db_cases = db.query(CaseDB).filter(CaseDB.is_deleted == False).all()
    db_letters = db.query(CompensationLetterDB).filter(CompensationLetterDB.is_deleted == False).all()
    db_executions = db.query(ExecutionDB).filter(ExecutionDB.is_deleted == False).all()
    
    backup_data = {
        "clients": {client.id: {
            **db_to_pydantic_client(client).dict(),
            "created_at": client.created_at.isoformat(),
            "updated_at": client.updated_at.isoformat()
        } for client in db_clients},
        "cases": {case.id: {
            **db_to_pydantic_case(case).dict(),
            "created_at": case.created_at.isoformat(),
            "updated_at": case.updated_at.isoformat(),
            "start_date": case.start_date.isoformat(),
            "next_hearing_date": case.next_hearing_date.isoformat() if case.next_hearing_date else None,
            "reminder_date": case.reminder_date.isoformat() if case.reminder_date else None
        } for case in db_cases},
        "compensation_letters": {letter.id: {
            **db_to_pydantic_compensation_letter(letter).dict(),
            "created_at": letter.created_at.isoformat(),
            "updated_at": letter.updated_at.isoformat()
        } for letter in db_letters},
        "executions": {execution.id: {
            **db_to_pydantic_execution(execution).dict(),
            "created_at": execution.created_at.isoformat(),
            "updated_at": execution.updated_at.isoformat(),
            "start_date": execution.start_date.isoformat(),
            "reminder_date": execution.reminder_date.isoformat() if execution.reminder_date else None
        } for execution in db_executions}
    }
    return backup_data

@app.post("/api/restore")
async def restore_data(backup: dict, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    try:
        if not backup or not isinstance(backup, dict):
            raise HTTPException(status_code=400, detail="Invalid backup data format")
        
        required_sections = ['clients', 'cases', 'executions', 'compensation_letters']
        has_valid_sections = any(section in backup for section in required_sections)
        if not has_valid_sections:
            raise HTTPException(status_code=400, detail="Backup file does not contain valid data sections")
        
        db.query(ClientDB).filter(ClientDB.is_deleted == False).update({"is_deleted": True})
        db.query(CaseDB).filter(CaseDB.is_deleted == False).update({"is_deleted": True})
        db.query(CompensationLetterDB).filter(CompensationLetterDB.is_deleted == False).update({"is_deleted": True})
        db.query(ExecutionDB).filter(ExecutionDB.is_deleted == False).update({"is_deleted": True})
        
        if "clients" in backup:
            for client_id, client_data in backup["clients"].items():
                try:
                    client_data["created_at"] = datetime.fromisoformat(client_data["created_at"])
                    if "updated_at" in client_data:
                        client_data["updated_at"] = datetime.fromisoformat(client_data["updated_at"])
                    else:
                        client_data["updated_at"] = client_data["created_at"]
                    
                    db_client = ClientDB(**client_data)
                    db.add(db_client)
                except Exception as e:
                    print(f"Error processing client {client_id}: {e}")
                    continue
        
        if "cases" in backup:
            for case_id, case_data in backup["cases"].items():
                try:
                    case_data["created_at"] = datetime.fromisoformat(case_data["created_at"])
                    case_data["updated_at"] = datetime.fromisoformat(case_data["updated_at"])
                    case_data["start_date"] = date.fromisoformat(case_data["start_date"])
                    if case_data.get("next_hearing_date"):
                        case_data["next_hearing_date"] = date.fromisoformat(case_data["next_hearing_date"])
                    if case_data.get("reminder_date"):
                        case_data["reminder_date"] = date.fromisoformat(case_data["reminder_date"])
                    
                    db_case = CaseDB(**case_data)
                    db.add(db_case)
                except Exception as e:
                    print(f"Error processing case {case_id}: {e}")
                    continue
        
        if "compensation_letters" in backup:
            for letter_id, letter_data in backup["compensation_letters"].items():
                try:
                    letter_data["created_at"] = datetime.fromisoformat(letter_data["created_at"])
                    letter_data["updated_at"] = datetime.fromisoformat(letter_data["updated_at"])
                    if letter_data.get("reminder_date"):
                        letter_data["reminder_date"] = date.fromisoformat(letter_data["reminder_date"])
                    
                    db_letter = CompensationLetterDB(**letter_data)
                    db.add(db_letter)
                except Exception as e:
                    print(f"Error processing compensation letter {letter_id}: {e}")
                    continue
        
        if "executions" in backup:
            for execution_id, execution_data in backup["executions"].items():
                try:
                    execution_data["created_at"] = datetime.fromisoformat(execution_data["created_at"])
                    execution_data["updated_at"] = datetime.fromisoformat(execution_data["updated_at"])
                    execution_data["start_date"] = date.fromisoformat(execution_data["start_date"])
                    if execution_data.get("reminder_date"):
                        execution_data["reminder_date"] = date.fromisoformat(execution_data["reminder_date"])
                    
                    db_execution = ExecutionDB(**execution_data)
                    db.add(db_execution)
                except Exception as e:
                    print(f"Error processing execution {execution_id}: {e}")
                    continue
        
        db.commit()
        
        await manager.broadcast_data_change("restore", "all", "system", {"message": "Data restored successfully"})
        
        return {"message": "Data restored successfully"}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(f"Error restoring data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to restore data: {str(e)}")

@app.get("/health/backup")
async def backup_health(db: Session = Depends(get_db)):
    import os
    import subprocess
    from datetime import datetime, timedelta
    
    try:
        backup_dir = "/app/backups"
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)
        
        today = datetime.now().strftime("%Y%m%d")
        backup_file = f"{backup_dir}/lexcloud_backup_{today}.sql"
        
        last_backup_time = None
        backup_size = 0
        
        if os.path.exists(backup_file):
            stat = os.stat(backup_file)
            last_backup_time = datetime.fromtimestamp(stat.st_mtime)
            backup_size = stat.st_size
        
        restore_test_result = "PASS"
        try:
            test_query = db.execute(text("SELECT COUNT(*) FROM clients WHERE is_deleted = false")).scalar()
            if test_query is None:
                restore_test_result = "FAIL - Database connection issue"
        except Exception as e:
            restore_test_result = f"FAIL - {str(e)}"
        
        return {
            "status": "healthy" if last_backup_time and (datetime.now() - last_backup_time).days < 2 else "warning",
            "last_backup": last_backup_time.isoformat() if last_backup_time else None,
            "backup_size_bytes": backup_size,
            "last_restore_test": restore_test_result,
            "backup_retention_days": 7
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "last_backup": None,
            "backup_size_bytes": 0,
            "last_restore_test": "FAIL",
            "backup_retention_days": 7
        }

@app.post("/api/clients", response_model=Client)
async def create_client(client: ClientCreate, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    client_id = str(uuid.uuid4())
    now = datetime.now()
    
    db_client = ClientDB(
        id=client_id,
        name=client.name,
        email=client.email,
        phone=client.phone,
        address=client.address,
        tax_id=client.tax_id,
        vekalet_ofis_no=client.vekalet_ofis_no,
        created_at=now,
        updated_at=now,
        version=1,
        is_deleted=False
    )
    
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    
    new_client = db_to_pydantic_client(db_client)
    await manager.broadcast_data_change("create", "client", client_id, new_client.dict())
    
    return new_client

@app.get("/api/clients", response_model=List[Client])
async def get_clients(
    page: int = Query(1, ge=1),
    limit: int = Query(1000, ge=1, le=10000),
    db: Session = Depends(get_db), 
    token: str = Depends(verify_token)
):
    offset = (page - 1) * limit
    db_clients = db.query(ClientDB).filter(ClientDB.is_deleted == False).order_by(ClientDB.updated_at.desc()).offset(offset).limit(limit).all()
    return [db_to_pydantic_client(client) for client in db_clients]

@app.get("/api/clients/{client_id}", response_model=Client)
async def get_client(client_id: str, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    db_client = db.query(ClientDB).filter(ClientDB.id == client_id, ClientDB.is_deleted == False).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    return db_to_pydantic_client(db_client)

@app.put("/api/clients/{client_id}", response_model=Client)
async def update_client(client_id: str, client_update: ClientUpdate, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    db_client = db.query(ClientDB).filter(ClientDB.id == client_id, ClientDB.is_deleted == False).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    if client_update.version is not None and db_client.version != client_update.version:
        raise HTTPException(status_code=409, detail="Version conflict. Please refresh and try again.")
    
    update_data = client_update.dict(exclude_unset=True, exclude={"version"})
    for field, value in update_data.items():
        setattr(db_client, field, value)
    
    db_client.updated_at = datetime.now()
    db_client.version += 1
    
    try:
        db.commit()
        db.refresh(db_client)
        
        client = db_to_pydantic_client(db_client)
        await manager.broadcast_data_change("update", "client", client_id, client.dict())
        
        print(f"Client updated successfully: {client_id}")
        return client
    except Exception as e:
        db.rollback()
        print(f"Error updating client {client_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update client")

@app.delete("/api/clients/{client_id}")
async def delete_client(client_id: str, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    db_client = db.query(ClientDB).filter(ClientDB.id == client_id, ClientDB.is_deleted == False).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db_client.is_deleted = True
    db_client.updated_at = datetime.now()
    db.commit()
    
    await manager.broadcast_data_change("delete", "client", client_id, {})
    
    return {"message": "Client deleted successfully"}

@app.post("/api/cases", response_model=Case)
async def create_case(case: CaseCreate, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    case_id = str(uuid.uuid4())
    now = datetime.now()
    
    # Determine client_name: from client_id lookup or directly provided
    resolved_client_id = case.client_id or ""
    resolved_client_name = case.client_name or ""
    if case.client_id:
        db_client = db.query(ClientDB).filter(ClientDB.id == case.client_id, ClientDB.is_deleted == False).first()
        if db_client:
            resolved_client_name = db_client.name
    
    if not resolved_client_name:
        raise HTTPException(status_code=400, detail="Client name is required")
    
    db_case = CaseDB(
        id=case_id,
        title=case.title,
        case_name=case.case_name,
        description=case.description,
        client_id=resolved_client_id,
        client_name=resolved_client_name,
        case_type=case.case_type,
        status=case.status,
        court=case.court,
        case_number=case.case_number,
        defendant=case.defendant,
        notes=case.notes,
        start_date=case.start_date,
        next_hearing_date=case.next_hearing_date,
        reminder_date=case.reminder_date,
        office_archive_no=case.office_archive_no,
        responsible_person=case.responsible_person,
        görevlendiren=case.görevlendiren,
        is_starred=case.is_starred,
        created_at=now,
        updated_at=now,
        version=1
    )
    
    try:
        db.add(db_case)
        db.commit()
        db.refresh(db_case)
        
        new_case = db_to_pydantic_case(db_case)
        await manager.broadcast_data_change("create", "case", case_id, new_case.dict())
        
        print(f"Case created successfully: {case_id}")
        return new_case
    except Exception as e:
        db.rollback()
        print(f"Error creating case: {e}")
        raise HTTPException(status_code=500, detail="Failed to create case")

@app.get("/api/cases", response_model=List[Case])
async def get_cases(
    status: Optional[str] = None, 
    query: Optional[str] = None,
    responsible_person: Optional[str] = None,
    görevlendiren: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(1000, ge=1, le=10000),
    db: Session = Depends(get_db), 
    token: str = Depends(verify_token)
):
    db_query = db.query(CaseDB).filter(CaseDB.is_deleted == False)
    if status:
        db_query = db_query.filter(CaseDB.status == status)
    if responsible_person:
        db_query = db_query.filter(CaseDB.responsible_person == responsible_person)
    if görevlendiren:
        db_query = db_query.filter(CaseDB.görevlendiren == görevlendiren)
    if query:
        db_query = db_query.filter(
            or_(
                CaseDB.title.ilike(f"%{query}%"),
                CaseDB.defendant.ilike(f"%{query}%"),
                CaseDB.client_name.ilike(f"%{query}%"),
                CaseDB.case_number.ilike(f"%{query}%"),
                CaseDB.case_name.ilike(f"%{query}%")
            )
        )
    
    offset = (page - 1) * limit
    db_cases = db_query.order_by(CaseDB.updated_at.desc()).offset(offset).limit(limit).all()
    return [db_to_pydantic_case(case) for case in db_cases]

@app.get("/api/cases/{case_id}", response_model=Case)
async def get_case(case_id: str, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    db_case = db.query(CaseDB).filter(CaseDB.id == case_id, CaseDB.is_deleted == False).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
    return db_to_pydantic_case(db_case)

@app.put("/api/cases/{case_id}", response_model=Case)
async def update_case(case_id: str, case_update: CaseUpdate, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    db_case = db.query(CaseDB).filter(CaseDB.id == case_id, CaseDB.is_deleted == False).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    if case_update.version is not None and db_case.version != case_update.version:
        raise HTTPException(status_code=409, detail="Version conflict. Please refresh and try again.")
    
    update_data = case_update.dict(exclude_unset=True, exclude={"version"})
    
    # Handle client_name: if client_name is explicitly provided, use it directly (free text).
    # Only fall back to client_id lookup if client_name was NOT provided.
    if 'client_name' not in update_data and case_update.client_id:
        db_client = db.query(ClientDB).filter(ClientDB.id == case_update.client_id, ClientDB.is_deleted == False).first()
        if db_client:
            update_data['client_name'] = db_client.name
    
    for field, value in update_data.items():
        setattr(db_case, field, value)
    
    db_case.updated_at = datetime.now()
    db_case.version += 1
    
    try:
        db.commit()
        db.refresh(db_case)
        
        case = db_to_pydantic_case(db_case)
        await manager.broadcast_data_change("update", "case", case_id, case.dict())
        
        print(f"Case updated successfully: {case_id}")
        return case
    except Exception as e:
        db.rollback()
        print(f"Error updating case {case_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update case")

@app.delete("/api/cases/{case_id}")
async def delete_case(case_id: str, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    db_case = db.query(CaseDB).filter(CaseDB.id == case_id, CaseDB.is_deleted == False).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    db_case.is_deleted = True
    db_case.updated_at = datetime.now()
    db.commit()
    
    await manager.broadcast_data_change("delete", "case", case_id, {})
    
    return {"message": "Case deleted successfully"}

class CaseSearchParams(BaseModel):
    q: Optional[str] = None
    status: Optional[str] = None
    client_id: Optional[str] = None
    court: Optional[str] = None
    case_type: Optional[str] = None

@app.get("/api/cases/search", response_model=List[Case])
async def search_cases(
    q: Optional[str] = None,
    status: Optional[str] = None,
    client_id: Optional[str] = None,
    court: Optional[str] = None,
    case_type: Optional[str] = None,
    db: Session = Depends(get_db),
    token: str = Depends(verify_token)
):
    query = db.query(CaseDB)
    
    if q:
        q_lower = f"%{q.lower()}%"
        query = query.filter(
            (CaseDB.title.ilike(q_lower)) |
            (CaseDB.case_number.ilike(q_lower)) |
            (CaseDB.defendant.ilike(q_lower)) |
            (CaseDB.client_name.ilike(q_lower))
        )
    
    if status:
        query = query.filter(CaseDB.status == status)
    
    if client_id:
        query = query.filter(CaseDB.client_id == client_id)
    
    if court:
        query = query.filter(CaseDB.court.ilike(f"%{court}%"))
    
    if case_type:
        query = query.filter(CaseDB.case_type == case_type)
    
    db_cases = query.all()
    return [db_to_pydantic_case(case) for case in db_cases]

@app.get("/health")
async def health_check():
    """Health check endpoint for Fly.io"""
    try:
        db = next(get_db())
        db.execute(text("SELECT 1"))
        db.close()
        
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logging.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unavailable")

@app.get("/api/dashboard")
async def get_dashboard(db: Session = Depends(get_db), token: str = Depends(verify_token), reminder_date: Optional[str] = Query(None, description="Filter reminders by specific date (YYYY-MM-DD). If not provided, shows reminders for today and next 7 days.")):
    total_cases = db.query(CaseDB).filter(CaseDB.is_deleted == False).count()
    total_clients = db.query(ClientDB).filter(ClientDB.is_deleted == False).count()
    total_executions = db.query(ExecutionDB).filter(ExecutionDB.is_deleted == False).count()
    total_compensation_letters = db.query(CompensationLetterDB).filter(CompensationLetterDB.is_deleted == False).count()
    
    # Parse the optional reminder_date filter
    filter_date = None
    if reminder_date:
        try:
            filter_date = date.fromisoformat(reminder_date)
        except ValueError:
            pass  # Invalid date format, fall back to default behavior
    
    upcoming_reminders = []
    
    db_cases = db.query(CaseDB).filter(CaseDB.reminder_date.isnot(None), CaseDB.is_deleted == False).all()
    for case in db_cases:
        if case.reminder_date:
            r_date = case.reminder_date
            days_until = (r_date - date.today()).days
            
            include = False
            if filter_date:
                include = (r_date == filter_date)
            else:
                include = (0 <= days_until <= 7)
            
            if include:
                upcoming_reminders.append({
                    "type": "case",
                    "case_id": case.id,
                    "case_number": case.case_number,
                    "case_name": case.case_name,
                    "court": case.court,
                    "client_name": case.client_name,
                    "defendant": case.defendant,
                    "reminder_date": r_date.isoformat(),
                    "description": case.description,
                    "responsible_person": case.responsible_person,
                    "görevlendiren": case.görevlendiren,
                    "is_starred": case.is_starred if case.is_starred is not None else False,
                    "days_until": days_until
                })
    
    db_executions = db.query(ExecutionDB).filter(ExecutionDB.reminder_date.isnot(None), ExecutionDB.is_deleted == False).all()
    for execution in db_executions:
        if execution.reminder_date:
            r_date = execution.reminder_date
            days_until = (r_date - date.today()).days
            
            include = False
            if filter_date:
                include = (r_date == filter_date)
            else:
                include = (0 <= days_until <= 7)
            
            if include:
                upcoming_reminders.append({
                    "type": "execution",
                    "execution_id": execution.id,
                    "execution_number": execution.execution_number,
                    "execution_office": execution.execution_office,
                    "client_name": execution.client_name,
                    "defendant": execution.defendant,
                    "reminder_date": r_date.isoformat(),
                    "reminder_text": execution.reminder_text,
                    "responsible_person": execution.responsible_person,
                    "görevlendiren": execution.görevlendiren,
                    "is_starred": execution.is_starred if execution.is_starred is not None else False,
                    "days_until": days_until
                })
    
    # Haciz reminders from executions with haciz_reminder_date
    db_haciz_executions = db.query(ExecutionDB).filter(ExecutionDB.haciz_reminder_date.isnot(None), ExecutionDB.is_deleted == False).all()
    for execution in db_haciz_executions:
        if execution.haciz_reminder_date:
            r_date = execution.haciz_reminder_date
            days_until = (r_date - date.today()).days
            
            include = False
            if filter_date:
                include = (r_date == filter_date)
            else:
                include = (0 <= days_until <= 7)
            
            if include:
                upcoming_reminders.append({
                    "type": "haciz_reminder",
                    "execution_id": execution.id,
                    "execution_number": execution.execution_number,
                    "execution_office": execution.execution_office,
                    "client_name": execution.client_name,
                    "defendant": execution.defendant,
                    "reminder_date": r_date.isoformat(),
                    "reminder_text": execution.haciz_reminder_text,
                    "haciz_durumu": execution.haciz_durumu,
                    "responsible_person": execution.responsible_person,
                    "görevlendiren": execution.görevlendiren,
                    "is_starred": execution.is_starred if execution.is_starred is not None else False,
                    "days_until": days_until
                })
    
    db_compensation_letters = db.query(CompensationLetterDB).filter(CompensationLetterDB.reminder_date.isnot(None), CompensationLetterDB.is_deleted == False).all()
    for letter in db_compensation_letters:
        if letter.reminder_date:
            r_date = letter.reminder_date
            days_until = (r_date - date.today()).days
            
            include = False
            if filter_date:
                include = (r_date == filter_date)
            else:
                include = (0 <= days_until <= 7)
            
            if include:
                upcoming_reminders.append({
                    "type": "compensation_letter",
                    "compensation_letter_id": letter.id,
                    "letter_number": letter.letter_number,
                    "court": letter.court,
                    "case_number": letter.case_number,
                    "customer": letter.customer,
                    "client_name": letter.client_name,
                    "reminder_date": r_date.isoformat(),
                    "reminder_text": letter.reminder_text,
                    "responsible_person": letter.responsible_person,
                    "görevlendiren": letter.görevlendiren,
                    "is_starred": letter.is_starred if letter.is_starred is not None else False,
                    "days_until": days_until
                })
    
    upcoming_reminders.sort(key=lambda x: x["days_until"])
    
    status_counts = {}
    db_cases = db.query(CaseDB).filter(CaseDB.is_deleted == False).all()
    for case in db_cases:
        status = case.status
        status_counts[status] = status_counts.get(status, 0) + 1
    
    return {
        "total_cases": total_cases,
        "total_clients": total_clients,
        "total_executions": total_executions,
        "total_compensation_letters": total_compensation_letters,
        "status_counts": status_counts,
        "upcoming_reminders": upcoming_reminders
    }

@app.post("/api/compensation-letters", response_model=CompensationLetter)
async def create_compensation_letter(letter: CompensationLetterCreate, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    letter_id = str(uuid.uuid4())
    now = datetime.now()
    
    db_client = db.query(ClientDB).filter(ClientDB.id == letter.client_id, ClientDB.is_deleted == False).first()
    if not db_client:
        raise HTTPException(status_code=400, detail="Invalid client ID")
    
    db_letter = CompensationLetterDB(
        id=letter_id,
        title=f"Teminat Mektubu - {letter.letter_number}",
        client_id=letter.client_id,
        client_name=db_client.name,
        letter_number=letter.letter_number,
        bank=letter.bank,
        customer_number=letter.customer_number,
        customer=letter.customer,
        court=letter.court,
        case_number=letter.case_number,
        status=letter.status,
        description_text=letter.description_text,
        reminder_date=letter.reminder_date,
        reminder_text=letter.reminder_text,
        responsible_person=letter.responsible_person,
        görevlendiren=letter.görevlendiren,
        is_starred=letter.is_starred,
        created_at=now,
        updated_at=now,
        version=1
    )
    
    try:
        db.add(db_letter)
        db.commit()
        db.refresh(db_letter)
        
        new_letter = db_to_pydantic_compensation_letter(db_letter)
        await manager.broadcast_data_change("create", "compensation_letter", letter_id, new_letter.dict())
        
        print(f"Compensation letter created successfully: {letter_id}")
        return new_letter
    except Exception as e:
        db.rollback()
        print(f"Error creating compensation letter: {e}")
        raise HTTPException(status_code=500, detail="Failed to create compensation letter")

@app.get("/api/compensation-letters", response_model=List[CompensationLetter])
async def get_compensation_letters(
    status: Optional[str] = None,
    client_id: Optional[str] = None,
    görevlendiren: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(1000, ge=1, le=10000),
    db: Session = Depends(get_db),
    token: str = Depends(verify_token)
):
    query = db.query(CompensationLetterDB).filter(CompensationLetterDB.is_deleted == False)
    if status:
        query = query.filter(CompensationLetterDB.status == status)
    if client_id:
        query = query.filter(CompensationLetterDB.client_id == client_id)
    if görevlendiren:
        query = query.filter(CompensationLetterDB.görevlendiren == görevlendiren)
    
    offset = (page - 1) * limit
    db_letters = query.order_by(CompensationLetterDB.updated_at.desc()).offset(offset).limit(limit).all()
    return [db_to_pydantic_compensation_letter(letter) for letter in db_letters]

@app.get("/api/compensation-letters/{letter_id}", response_model=CompensationLetter)
async def get_compensation_letter(letter_id: str, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    db_letter = db.query(CompensationLetterDB).filter(CompensationLetterDB.id == letter_id, CompensationLetterDB.is_deleted == False).first()
    if not db_letter:
        raise HTTPException(status_code=404, detail="Compensation letter not found")
    return db_to_pydantic_compensation_letter(db_letter)

@app.put("/api/compensation-letters/{letter_id}", response_model=CompensationLetter)
async def update_compensation_letter(letter_id: str, letter_update: CompensationLetterUpdate, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    db_letter = db.query(CompensationLetterDB).filter(CompensationLetterDB.id == letter_id, CompensationLetterDB.is_deleted == False).first()
    if not db_letter:
        raise HTTPException(status_code=404, detail="Compensation letter not found")
    
    if letter_update.version is not None and db_letter.version != letter_update.version:
        raise HTTPException(status_code=409, detail="Version conflict. Please refresh and try again.")
    
    if letter_update.client_id:
        db_client = db.query(ClientDB).filter(ClientDB.id == letter_update.client_id, ClientDB.is_deleted == False).first()
        if not db_client:
            raise HTTPException(status_code=400, detail="Invalid client ID")
    
    update_data = letter_update.dict(exclude_unset=True, exclude={"version"})
    for field, value in update_data.items():
        setattr(db_letter, field, value)
    
    if letter_update.client_id:
        db_client = db.query(ClientDB).filter(ClientDB.id == letter_update.client_id, ClientDB.is_deleted == False).first()
        db_letter.client_name = db_client.name
    
    db_letter.updated_at = datetime.now()
    db_letter.version += 1
    
    try:
        db.commit()
        db.refresh(db_letter)
        
        letter = db_to_pydantic_compensation_letter(db_letter)
        await manager.broadcast_data_change("update", "compensation_letter", letter_id, letter.dict())
        
        print(f"Compensation letter updated successfully: {letter_id}")
        return letter
    except Exception as e:
        db.rollback()
        print(f"Error updating compensation letter {letter_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update compensation letter")

@app.delete("/api/compensation-letters/{letter_id}")
async def delete_compensation_letter(letter_id: str, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    db_letter = db.query(CompensationLetterDB).filter(CompensationLetterDB.id == letter_id, CompensationLetterDB.is_deleted == False).first()
    if not db_letter:
        raise HTTPException(status_code=404, detail="Compensation letter not found")
    
    db_letter.is_deleted = True
    db_letter.updated_at = datetime.now()
    db.commit()
    
    await manager.broadcast_data_change("delete", "compensation_letter", letter_id, {})
    
    return {"message": "Compensation letter deleted successfully"}

@app.post("/api/executions", response_model=Execution)
async def create_execution(execution: ExecutionCreate, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    execution_id = str(uuid.uuid4())
    now = datetime.now()
    
    db_client = db.query(ClientDB).filter(ClientDB.id == execution.client_id, ClientDB.is_deleted == False).first()
    if not db_client:
        raise HTTPException(status_code=400, detail="Invalid client ID")
    
    db_execution = ExecutionDB(
        id=execution_id,
        client_id=execution.client_id,
        client_name=db_client.name,
        defendant=execution.defendant,
        execution_office=execution.execution_office,
        execution_number=execution.execution_number,
        status=execution.status,
        execution_type=execution.execution_type,
        start_date=execution.start_date,
        office_archive_no=execution.office_archive_no,
        reminder_date=execution.reminder_date,
        reminder_text=execution.reminder_text,
        notes=execution.notes,
        haciz_durumu=execution.haciz_durumu,
        haciz_reminder_date=execution.haciz_reminder_date,
        haciz_reminder_text=execution.haciz_reminder_text,
        related_case_id=execution.related_case_id,
        responsible_person=execution.responsible_person,
        görevlendiren=execution.görevlendiren,
        is_starred=execution.is_starred,
        created_at=now,
        updated_at=now,
        version=1
    )
    
    try:
        db.add(db_execution)
        db.commit()
        db.refresh(db_execution)
        
        new_execution = db_to_pydantic_execution(db_execution)
        await manager.broadcast_data_change("create", "execution", execution_id, new_execution.dict())
        
        print(f"Execution created successfully: {execution_id}")
        return new_execution
    except Exception as e:
        db.rollback()
        print(f"Error creating execution: {e}")
        raise HTTPException(status_code=500, detail="Failed to create execution")

@app.get("/api/executions", response_model=List[Execution])
async def get_executions(
    status: Optional[str] = None,
    client_id: Optional[str] = None,
    haciz_durumu: Optional[str] = None,
    responsible_person: Optional[str] = None,
    görevlendiren: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(1000, ge=1, le=10000),
    db: Session = Depends(get_db),
    token: str = Depends(verify_token)
):
    query = db.query(ExecutionDB).filter(ExecutionDB.is_deleted == False)
    if status:
        query = query.filter(ExecutionDB.status == status)
    if client_id:
        query = query.filter(ExecutionDB.client_id == client_id)
    if responsible_person:
        query = query.filter(ExecutionDB.responsible_person == responsible_person)
    if görevlendiren:
        query = query.filter(ExecutionDB.görevlendiren == görevlendiren)
    if haciz_durumu:
        query = query.filter(ExecutionDB.haciz_durumu == haciz_durumu)
    
    offset = (page - 1) * limit
    db_executions = query.order_by(ExecutionDB.updated_at.desc()).offset(offset).limit(limit).all()
    return [db_to_pydantic_execution(execution) for execution in db_executions]

@app.get("/api/executions/{execution_id}", response_model=Execution)
async def get_execution(execution_id: str, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    db_execution = db.query(ExecutionDB).filter(ExecutionDB.id == execution_id, ExecutionDB.is_deleted == False).first()
    if not db_execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    return db_to_pydantic_execution(db_execution)

@app.put("/api/executions/{execution_id}", response_model=Execution)
async def update_execution(execution_id: str, execution_update: ExecutionUpdate, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    db_execution = db.query(ExecutionDB).filter(ExecutionDB.id == execution_id, ExecutionDB.is_deleted == False).first()
    if not db_execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    if execution_update.version is not None and db_execution.version != execution_update.version:
        raise HTTPException(status_code=409, detail="Version conflict. Please refresh and try again.")
    
    if execution_update.client_id:
        db_client = db.query(ClientDB).filter(ClientDB.id == execution_update.client_id, ClientDB.is_deleted == False).first()
        if not db_client:
            raise HTTPException(status_code=400, detail="Invalid client ID")
    
    update_data = execution_update.dict(exclude_unset=True, exclude={"version"})
    for field, value in update_data.items():
        setattr(db_execution, field, value)
    
    if execution_update.client_id:
        db_client = db.query(ClientDB).filter(ClientDB.id == execution_update.client_id, ClientDB.is_deleted == False).first()
        db_execution.client_name = db_client.name
    
    db_execution.updated_at = datetime.now()
    db_execution.version += 1
    
    try:
        db.commit()
        db.refresh(db_execution)
        
        execution = db_to_pydantic_execution(db_execution)
        await manager.broadcast_data_change("update", "execution", execution_id, execution.dict())
        
        print(f"Execution updated successfully: {execution_id}")
        return execution
    except Exception as e:
        db.rollback()
        print(f"Error updating execution {execution_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update execution")

@app.delete("/api/executions/{execution_id}")
async def delete_execution(execution_id: str, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    db_execution = db.query(ExecutionDB).filter(ExecutionDB.id == execution_id, ExecutionDB.is_deleted == False).first()
    if not db_execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    db_execution.is_deleted = True
    db_execution.updated_at = datetime.now()
    db.commit()
    
    await manager.broadcast_data_change("delete", "execution", execution_id, {})
    
    return {"message": "Execution deleted successfully"}

class ToggleStarRequest(BaseModel):
    entity_type: str  # "case", "execution", "compensation_letter"
    entity_id: str

@app.post("/api/reminders/toggle-star")
async def toggle_star(request: ToggleStarRequest, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    if request.entity_type == "case":
        db_item = db.query(CaseDB).filter(CaseDB.id == request.entity_id, CaseDB.is_deleted == False).first()
    elif request.entity_type == "execution":
        db_item = db.query(ExecutionDB).filter(ExecutionDB.id == request.entity_id, ExecutionDB.is_deleted == False).first()
    elif request.entity_type == "compensation_letter":
        db_item = db.query(CompensationLetterDB).filter(CompensationLetterDB.id == request.entity_id, CompensationLetterDB.is_deleted == False).first()
    else:
        raise HTTPException(status_code=400, detail="Invalid entity type")
    
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db_item.is_starred = not db_item.is_starred
    db_item.updated_at = datetime.now()
    db_item.version += 1
    
    try:
        db.commit()
        db.refresh(db_item)
        
        await manager.broadcast_data_change("update", request.entity_type, request.entity_id, {
            "entity_type": request.entity_type,
            "entity_id": request.entity_id,
            "is_starred": db_item.is_starred
        })
        
        return {"entity_type": request.entity_type, "entity_id": request.entity_id, "is_starred": db_item.is_starred}
    except Exception as e:
        db.rollback()
        print(f"Error toggling star: {e}")
        raise HTTPException(status_code=500, detail="Failed to toggle star")
