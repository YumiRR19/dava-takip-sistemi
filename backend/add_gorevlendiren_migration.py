#!/usr/bin/env python3
"""
Migration script to add görevlendiren column to existing tables
"""
import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import ProgrammingError

def run_migration():
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    if not DATABASE_URL:
        print("ERROR: DATABASE_URL environment variable is required")
        sys.exit(1)
    
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    engine = create_engine(DATABASE_URL)
    
    migrations = [
        "ALTER TABLE cases ADD COLUMN IF NOT EXISTS görevlendiren VARCHAR;",
        "ALTER TABLE executions ADD COLUMN IF NOT EXISTS görevlendiren VARCHAR;", 
        "ALTER TABLE compensation_letters ADD COLUMN IF NOT EXISTS görevlendiren VARCHAR;"
    ]
    
    print("Starting database migration to add görevlendiren columns...")
    
    try:
        with engine.connect() as conn:
            for migration in migrations:
                print(f"Running: {migration}")
                try:
                    conn.execute(text(migration))
                    conn.commit()
                    print("✓ Success")
                except ProgrammingError as e:
                    if "already exists" in str(e):
                        print("✓ Column already exists, skipping")
                    else:
                        print(f"✗ Error: {e}")
                        raise
                except Exception as e:
                    print(f"✗ Error: {e}")
                    raise
        
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_migration()
