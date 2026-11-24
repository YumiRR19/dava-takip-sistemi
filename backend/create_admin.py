"""Create the single LexCloud admin account (idempotent).

Usage: DATABASE_URL=... JWT_SECRET=... python create_admin.py <temp-password-file>

Prints only the admin Kullanıcı No. On first creation the temporary password is
written to <temp-password-file> (mode 0600) and never printed. Running it again
creates nothing and keeps the existing number.
"""
import os
import sys

from app.database import SessionLocal, create_tables
from app.accounts import ensure_admin_account


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    out_path = sys.argv[1]
    create_tables()
    db = SessionLocal()
    try:
        user_no, temp = ensure_admin_account(db)
    finally:
        db.close()
    if temp is None:
        print(f"Admin already exists; Kullanıcı No unchanged: {user_no}")
        return
    fd = os.open(out_path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as f:
        f.write(temp)
    print(f"Admin created. Kullanıcı No: {user_no}. Temporary password written to {out_path}")


if __name__ == "__main__":
    main()
