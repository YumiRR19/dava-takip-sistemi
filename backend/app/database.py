from sqlalchemy import create_engine, event, Column, String, DateTime, Date, Integer, Text, Boolean, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import func
import os
from datetime import datetime, date

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

if not (DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://")):
    raise ValueError("DATABASE_URL must be a PostgreSQL connection string (postgresql:// or postgres://)")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)


engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_size=5,
    max_overflow=5,
    pool_timeout=30,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={
        "application_name": "lexcloud-backend",
    }
)

# Set statement_timeout after connection is established (Neon pooler
# rejects the "options" startup parameter, so we use an event listener).
@event.listens_for(engine, "connect")
def set_statement_timeout(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("SET statement_timeout = '30s'")
    cursor.close()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ClientDB(Base):
    __tablename__ = "clients"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(String, nullable=False)
    tax_id = Column(String, nullable=True)
    vekalet_ofis_no = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    version = Column(Integer, default=1)
    is_deleted = Column(Boolean, default=False)

class CaseDB(Base):
    __tablename__ = "cases"
    
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    case_name = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    client_id = Column(String, nullable=True, default="")
    client_name = Column(String, nullable=False)
    case_type = Column(String, nullable=False)
    status = Column(String, nullable=False)
    court = Column(String, nullable=False)
    case_number = Column(String, nullable=False)
    defendant = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False)
    next_hearing_date = Column(Date, nullable=True)
    reminder_date = Column(Date, nullable=True)
    office_archive_no = Column(String, nullable=False)
    responsible_person = Column(String, nullable=True)
    görevlendiren = Column("gÃ¶revlendiren", String, nullable=True)
    icra_dosya_numarasi = Column(String, nullable=True)
    is_starred = Column(Boolean, default=False, nullable=False, server_default="false")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    version = Column(Integer, default=1)
    is_deleted = Column(Boolean, default=False)

class CompensationLetterDB(Base):
    __tablename__ = "compensation_letters"
    
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    client_id = Column(String, nullable=False)
    client_name = Column(String, nullable=False)
    letter_number = Column(String, nullable=False)
    bank = Column(String, nullable=False)
    customer_number = Column(String, nullable=False)
    customer = Column(String, nullable=False)
    court = Column(String, nullable=False)
    case_number = Column(String, nullable=False)
    status = Column(String, nullable=False)
    description_text = Column(Text, nullable=True)
    reminder_date = Column(Date, nullable=True)
    reminder_text = Column(Text, nullable=True)
    responsible_person = Column(String, nullable=True)
    görevlendiren = Column("gÃ¶revlendiren", String, nullable=True)
    is_starred = Column(Boolean, default=False, nullable=False, server_default="false")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    version = Column(Integer, default=1)
    is_deleted = Column(Boolean, default=False)

class ExecutionDB(Base):
    __tablename__ = "executions"
    
    id = Column(String, primary_key=True)
    client_id = Column(String, nullable=False)
    client_name = Column(String, nullable=False)
    defendant = Column(String, nullable=False)
    execution_office = Column(String, nullable=False)
    execution_number = Column(String, nullable=False)
    status = Column(String, nullable=False)
    execution_type = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    office_archive_no = Column(String, nullable=False)
    reminder_date = Column(Date, nullable=True)
    reminder_text = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    haciz_durumu = Column(String, nullable=True)
    haciz_reminder_date = Column(Date, nullable=True)
    haciz_reminder_text = Column(Text, nullable=True)
    related_case_id = Column(String, nullable=True)
    responsible_person = Column(String, nullable=True)
    görevlendiren = Column("gÃ¶revlendiren", String, nullable=True)
    is_starred = Column(Boolean, default=False, nullable=False, server_default="false")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    version = Column(Integer, default=1)
    is_deleted = Column(Boolean, default=False)

class SettingsOptionDB(Base):
    __tablename__ = "settings_options"
    
    id = Column(String, primary_key=True)
    category = Column(String, nullable=False)  # 'bank', 'gorevlendiren', 'ilgili_sorumlu'
    value = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    __table_args__ = (
        UniqueConstraint('category', 'value', name='uq_settings_category_value'),
    )

def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

def create_tables():
    Base.metadata.create_all(bind=engine)
