"""
Migration: Add soft delete and performance indexes
"""
from sqlalchemy import text

def upgrade(connection):
    connection.execute(text("ALTER TABLE clients ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE"))
    connection.execute(text("ALTER TABLE cases ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE"))
    connection.execute(text("ALTER TABLE compensation_letters ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE"))
    connection.execute(text("ALTER TABLE executions ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE"))
    
    connection.execute(text("CREATE INDEX idx_cases_defendant ON cases(defendant)"))
    connection.execute(text("CREATE INDEX idx_cases_status_updated_at ON cases(status, updated_at)"))
    connection.execute(text("CREATE INDEX idx_cases_client_id ON cases(client_id)"))
    connection.execute(text("CREATE INDEX idx_cases_is_deleted ON cases(is_deleted)"))
    
    connection.execute(text("CREATE INDEX idx_executions_defendant ON executions(defendant)"))
    connection.execute(text("CREATE INDEX idx_executions_status_updated_at ON executions(status, updated_at)"))
    connection.execute(text("CREATE INDEX idx_executions_client_id ON executions(client_id)"))
    connection.execute(text("CREATE INDEX idx_executions_is_deleted ON executions(is_deleted)"))
    
    connection.execute(text("CREATE INDEX idx_compensation_letters_status_updated_at ON compensation_letters(status, updated_at)"))
    connection.execute(text("CREATE INDEX idx_compensation_letters_client_id ON compensation_letters(client_id)"))
    connection.execute(text("CREATE INDEX idx_compensation_letters_is_deleted ON compensation_letters(is_deleted)"))
    
    connection.execute(text("CREATE INDEX idx_clients_is_deleted ON clients(is_deleted)"))
    connection.execute(text("CREATE INDEX idx_clients_updated_at ON clients(updated_at)"))

def downgrade(connection):
    connection.execute(text("DROP INDEX IF EXISTS idx_cases_defendant"))
    connection.execute(text("DROP INDEX IF EXISTS idx_cases_status_updated_at"))
    connection.execute(text("DROP INDEX IF EXISTS idx_cases_client_id"))
    connection.execute(text("DROP INDEX IF EXISTS idx_cases_is_deleted"))
    
    connection.execute(text("DROP INDEX IF EXISTS idx_executions_defendant"))
    connection.execute(text("DROP INDEX IF EXISTS idx_executions_status_updated_at"))
    connection.execute(text("DROP INDEX IF EXISTS idx_executions_client_id"))
    connection.execute(text("DROP INDEX IF EXISTS idx_executions_is_deleted"))
    
    connection.execute(text("DROP INDEX IF EXISTS idx_compensation_letters_status_updated_at"))
    connection.execute(text("DROP INDEX IF EXISTS idx_compensation_letters_client_id"))
    connection.execute(text("DROP INDEX IF EXISTS idx_compensation_letters_is_deleted"))
    
    connection.execute(text("DROP INDEX IF EXISTS idx_clients_is_deleted"))
    connection.execute(text("DROP INDEX IF EXISTS idx_clients_updated_at"))
    
    connection.execute(text("ALTER TABLE clients DROP COLUMN is_deleted"))
    connection.execute(text("ALTER TABLE cases DROP COLUMN is_deleted"))
    connection.execute(text("ALTER TABLE compensation_letters DROP COLUMN is_deleted"))
    connection.execute(text("ALTER TABLE executions DROP COLUMN is_deleted"))
