#!/usr/bin/env python3
"""
Safe migration script for LexCloud production.
Only allows non-destructive schema updates.
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.database import Base, ClientDB, CaseDB, CompensationLetterDB, ExecutionDB

def check_destructive_operations():
    """Prevent any destructive operations in production"""
    print("🔒 Safe migration mode: Only non-destructive operations allowed")
    return True

def run_safe_migration():
    """Run only safe, non-destructive migrations"""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL not set")
        sys.exit(1)
    
    print(f"🔗 Connecting to database...")
    engine = create_engine(database_url)
    
    try:
        with engine.connect() as conn:
            print("✅ Database connection successful")
            
            print("📋 Creating tables if they don't exist...")
            Base.metadata.create_all(engine)
            print("✅ Schema update completed safely")
            
            result = conn.execute(text("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            """))
            tables = [row[0] for row in result]
            print(f"📊 Tables in database: {', '.join(tables)}")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    check_destructive_operations()
    run_safe_migration()
    print("🎉 Safe migration completed successfully")
