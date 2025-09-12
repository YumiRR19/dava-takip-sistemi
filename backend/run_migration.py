import os
import sys
sys.path.append('/home/ubuntu/dava-takip-sistemi/backend')

from sqlalchemy import create_engine, text
from app.database import DATABASE_URL

def run_migration():
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as connection:
        try:
            try:
                connection.execute(text("ALTER TABLE clients ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE"))
                print("✅ Added is_deleted to clients")
            except Exception as e:
                print(f"⚠️ clients.is_deleted: {e}")
            
            try:
                connection.execute(text("ALTER TABLE cases ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE"))
                print("✅ Added is_deleted to cases")
            except Exception as e:
                print(f"⚠️ cases.is_deleted: {e}")
            
            try:
                connection.execute(text("ALTER TABLE compensation_letters ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE"))
                print("✅ Added is_deleted to compensation_letters")
            except Exception as e:
                print(f"⚠️ compensation_letters.is_deleted: {e}")
            
            try:
                connection.execute(text("ALTER TABLE executions ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE"))
                print("✅ Added is_deleted to executions")
            except Exception as e:
                print(f"⚠️ executions.is_deleted: {e}")
            
            try:
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_cases_defendant ON cases(defendant)"))
                print("✅ Created index on cases.defendant")
            except Exception as e:
                print(f"⚠️ idx_cases_defendant: {e}")
            
            try:
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_cases_status_updated_at ON cases(status, updated_at)"))
                print("✅ Created index on cases(status, updated_at)")
            except Exception as e:
                print(f"⚠️ idx_cases_status_updated_at: {e}")
            
            try:
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id)"))
                print("✅ Created index on cases.client_id")
            except Exception as e:
                print(f"⚠️ idx_cases_client_id: {e}")
            
            try:
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_cases_is_deleted ON cases(is_deleted)"))
                print("✅ Created index on cases.is_deleted")
            except Exception as e:
                print(f"⚠️ idx_cases_is_deleted: {e}")
            
            try:
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_executions_defendant ON executions(defendant)"))
                print("✅ Created index on executions.defendant")
            except Exception as e:
                print(f"⚠️ idx_executions_defendant: {e}")
            
            try:
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_executions_status_updated_at ON executions(status, updated_at)"))
                print("✅ Created index on executions(status, updated_at)")
            except Exception as e:
                print(f"⚠️ idx_executions_status_updated_at: {e}")
            
            try:
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_executions_client_id ON executions(client_id)"))
                print("✅ Created index on executions.client_id")
            except Exception as e:
                print(f"⚠️ idx_executions_client_id: {e}")
            
            try:
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_executions_is_deleted ON executions(is_deleted)"))
                print("✅ Created index on executions.is_deleted")
            except Exception as e:
                print(f"⚠️ idx_executions_is_deleted: {e}")
            
            try:
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_compensation_letters_status_updated_at ON compensation_letters(status, updated_at)"))
                print("✅ Created index on compensation_letters(status, updated_at)")
            except Exception as e:
                print(f"⚠️ idx_compensation_letters_status_updated_at: {e}")
            
            try:
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_compensation_letters_client_id ON compensation_letters(client_id)"))
                print("✅ Created index on compensation_letters.client_id")
            except Exception as e:
                print(f"⚠️ idx_compensation_letters_client_id: {e}")
            
            try:
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_compensation_letters_is_deleted ON compensation_letters(is_deleted)"))
                print("✅ Created index on compensation_letters.is_deleted")
            except Exception as e:
                print(f"⚠️ idx_compensation_letters_is_deleted: {e}")
            
            try:
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_clients_is_deleted ON clients(is_deleted)"))
                print("✅ Created index on clients.is_deleted")
            except Exception as e:
                print(f"⚠️ idx_clients_is_deleted: {e}")
            
            try:
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_clients_updated_at ON clients(updated_at)"))
                print("✅ Created index on clients.updated_at")
            except Exception as e:
                print(f"⚠️ idx_clients_updated_at: {e}")
            
            connection.commit()
            print("\n🎉 Migration completed successfully!")
            
        except Exception as e:
            connection.rollback()
            print(f"❌ Migration failed: {e}")
            raise

if __name__ == "__main__":
    run_migration()
