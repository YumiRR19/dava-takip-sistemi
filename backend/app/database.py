from sqlalchemy import create_engine, Column, String, DateTime, Date, Integer, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import func
import os
from datetime import datetime, date

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./lexcloud.db")

if DATABASE_URL.startswith("postgres://") and not os.getenv("PRODUCTION"):
    DATABASE_URL = "sqlite:///./lexcloud.db"

engine = create_engine(DATABASE_URL)
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
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    version = Column(Integer, default=1)

class CaseDB(Base):
    __tablename__ = "cases"
    
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    case_name = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    client_id = Column(String, nullable=False)
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
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    version = Column(Integer, default=1)

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
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    version = Column(Integer, default=1)

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
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    version = Column(Integer, default=1)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    Base.metadata.create_all(bind=engine)
