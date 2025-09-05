from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
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
from app.database import get_db, create_tables, ClientDB, CaseDB, CompensationLetterDB, ExecutionDB

app = FastAPI(title="LexCloud API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print("Initializing database on startup...")
    create_tables()
    print("Database tables created successfully")

class Client(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    address: str
    tax_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    version: int

class ClientCreate(BaseModel):
    name: str
    email: str
    phone: str
    address: str
    tax_id: Optional[str] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    tax_id: Optional[str] = None
    version: Optional[int] = None

class Case(BaseModel):
    id: str
    title: str
    case_name: Optional[str] = None
    description: Optional[str] = None
    client_id: str
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
    created_at: datetime
    updated_at: datetime
    version: int

class CaseCreate(BaseModel):
    title: str
    case_name: Optional[str] = None
    description: Optional[str] = None
    client_id: str
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

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    case_name: Optional[str] = None
    description: Optional[str] = None
    client_id: Optional[str] = None
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
        client_id=db_case.client_id,
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

@app.get("/api/health/database")
async def database_health(db: Session = Depends(get_db)):
    try:
        db.execute("SELECT 1")
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
    db_clients = db.query(ClientDB).all()
    db_cases = db.query(CaseDB).all()
    db_letters = db.query(CompensationLetterDB).all()
    db_executions = db.query(ExecutionDB).all()
    
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
        db.query(ClientDB).delete()
        db.query(CaseDB).delete()
        db.query(CompensationLetterDB).delete()
        db.query(ExecutionDB).delete()
        
        if "clients" in backup:
            for client_id, client_data in backup["clients"].items():
                client_data["created_at"] = datetime.fromisoformat(client_data["created_at"])
                if "updated_at" in client_data:
                    client_data["updated_at"] = datetime.fromisoformat(client_data["updated_at"])
                else:
                    client_data["updated_at"] = client_data["created_at"]
                
                db_client = ClientDB(**client_data)
                db.add(db_client)
        
        if "cases" in backup:
            for case_id, case_data in backup["cases"].items():
                case_data["created_at"] = datetime.fromisoformat(case_data["created_at"])
                case_data["updated_at"] = datetime.fromisoformat(case_data["updated_at"])
                case_data["start_date"] = date.fromisoformat(case_data["start_date"])
                if case_data.get("next_hearing_date"):
                    case_data["next_hearing_date"] = date.fromisoformat(case_data["next_hearing_date"])
                if case_data.get("reminder_date"):
                    case_data["reminder_date"] = date.fromisoformat(case_data["reminder_date"])
                
                db_case = CaseDB(**case_data)
                db.add(db_case)
        
        if "compensation_letters" in backup:
            for letter_id, letter_data in backup["compensation_letters"].items():
                letter_data["created_at"] = datetime.fromisoformat(letter_data["created_at"])
                letter_data["updated_at"] = datetime.fromisoformat(letter_data["updated_at"])
                
                db_letter = CompensationLetterDB(**letter_data)
                db.add(db_letter)
        
        if "executions" in backup:
            for execution_id, execution_data in backup["executions"].items():
                execution_data["created_at"] = datetime.fromisoformat(execution_data["created_at"])
                execution_data["updated_at"] = datetime.fromisoformat(execution_data["updated_at"])
                execution_data["start_date"] = date.fromisoformat(execution_data["start_date"])
                if execution_data.get("reminder_date"):
                    execution_data["reminder_date"] = date.fromisoformat(execution_data["reminder_date"])
                
                db_execution = ExecutionDB(**execution_data)
                db.add(db_execution)
        
        db.commit()
        
        return {"message": "Data restored successfully"}
    except Exception as e:
        db.rollback()
        print(f"Error restoring data: {e}")
        raise HTTPException(status_code=500, detail="Failed to restore data")

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
        created_at=now,
        updated_at=now,
        version=1
    )
    
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    
    new_client = db_to_pydantic_client(db_client)
    await manager.broadcast_data_change("create", "client", client_id, new_client.dict())
    
    return new_client

@app.get("/api/clients", response_model=List[Client])
async def get_clients(db: Session = Depends(get_db), token: str = Depends(verify_token)):
    db_clients = db.query(ClientDB).all()
    return [db_to_pydantic_client(client) for client in db_clients]

@app.get("/api/clients/{client_id}", response_model=Client)
async def get_client(client_id: str, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    db_client = db.query(ClientDB).filter(ClientDB.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    return db_to_pydantic_client(db_client)

@app.put("/api/clients/{client_id}", response_model=Client)
async def update_client(client_id: str, client_update: ClientUpdate, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    db_client = db.query(ClientDB).filter(ClientDB.id == client_id).first()
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
    db_client = db.query(ClientDB).filter(ClientDB.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db.delete(db_client)
    db.commit()
    
    await manager.broadcast_data_change("delete", "client", client_id, {})
    
    return {"message": "Client deleted successfully"}

@app.post("/api/cases", response_model=Case)
async def create_case(case: CaseCreate, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    case_id = str(uuid.uuid4())
    now = datetime.now()
    
    db_client = db.query(ClientDB).filter(ClientDB.id == case.client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db_case = CaseDB(
        id=case_id,
        title=case.title,
        case_name=case.case_name,
        description=case.description,
        client_id=case.client_id,
        client_name=db_client.name,
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
async def get_cases(status: Optional[str] = None, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    query = db.query(CaseDB)
    if status:
        query = query.filter(CaseDB.status == status)
    db_cases = query.all()
    cases = [db_to_pydantic_case(case) for case in db_cases]
    cases.sort(key=lambda x: x.updated_at, reverse=True)
    return cases

@app.get("/api/cases/{case_id}", response_model=Case)
async def get_case(case_id: str, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    db_case = db.query(CaseDB).filter(CaseDB.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
    return db_to_pydantic_case(db_case)

@app.put("/api/cases/{case_id}", response_model=Case)
async def update_case(case_id: str, case_update: CaseUpdate, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    db_case = db.query(CaseDB).filter(CaseDB.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    if case_update.version is not None and db_case.version != case_update.version:
        raise HTTPException(status_code=409, detail="Version conflict. Please refresh and try again.")
    
    if case_update.client_id:
        db_client = db.query(ClientDB).filter(ClientDB.id == case_update.client_id).first()
        if not db_client:
            raise HTTPException(status_code=404, detail="Client not found")
    
    update_data = case_update.dict(exclude_unset=True, exclude={"version"})
    for field, value in update_data.items():
        setattr(db_case, field, value)
    
    if case_update.client_id:
        db_client = db.query(ClientDB).filter(ClientDB.id == case_update.client_id).first()
        db_case.client_name = db_client.name
    
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
    db_case = db.query(CaseDB).filter(CaseDB.id == case_id).first()
    if not db_case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    db.delete(db_case)
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

@app.get("/api/dashboard")
async def get_dashboard(db: Session = Depends(get_db), token: str = Depends(verify_token)):
    total_cases = db.query(CaseDB).count()
    total_clients = db.query(ClientDB).count()
    
    upcoming_reminders = []
    
    db_cases = db.query(CaseDB).filter(CaseDB.reminder_date.isnot(None)).all()
    for case in db_cases:
        if case.reminder_date:
            reminder_date = case.reminder_date
            days_until = (reminder_date - date.today()).days
            
            if 0 <= days_until <= 7:
                upcoming_reminders.append({
                    "type": "case",
                    "case_id": case.id,
                    "case_number": case.case_number,
                    "case_name": case.case_name,
                    "court": case.court,
                    "client_name": case.client_name,
                    "defendant": case.defendant,
                    "reminder_date": reminder_date.isoformat(),
                    "description": case.description,
                    "days_until": days_until
                })
    
    db_executions = db.query(ExecutionDB).filter(ExecutionDB.reminder_date.isnot(None)).all()
    for execution in db_executions:
        if execution.reminder_date:
            reminder_date = execution.reminder_date
            days_until = (reminder_date - date.today()).days
            
            if 0 <= days_until <= 7:
                upcoming_reminders.append({
                    "type": "execution",
                    "execution_id": execution.id,
                    "execution_number": execution.execution_number,
                    "execution_office": execution.execution_office,
                    "client_name": execution.client_name,
                    "defendant": execution.defendant,
                    "reminder_date": reminder_date.isoformat(),
                    "reminder_text": execution.reminder_text,
                    "days_until": days_until
                })
    
    upcoming_reminders.sort(key=lambda x: x["days_until"])
    
    return {
        "total_cases": total_cases,
        "total_clients": total_clients,
        "upcoming_reminders": upcoming_reminders
    }

@app.post("/api/compensation-letters", response_model=CompensationLetter)
async def create_compensation_letter(letter: CompensationLetterCreate, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    letter_id = str(uuid.uuid4())
    now = datetime.now()
    
    db_client = db.query(ClientDB).filter(ClientDB.id == letter.client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    
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
    db: Session = Depends(get_db),
    token: str = Depends(verify_token)
):
    query = db.query(CompensationLetterDB)
    if status:
        query = query.filter(CompensationLetterDB.status == status)
    if client_id:
        query = query.filter(CompensationLetterDB.client_id == client_id)
    db_letters = query.all()
    letters = [db_to_pydantic_compensation_letter(letter) for letter in db_letters]
    letters.sort(key=lambda x: x.updated_at, reverse=True)
    return letters

@app.get("/api/compensation-letters/{letter_id}", response_model=CompensationLetter)
async def get_compensation_letter(letter_id: str, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    db_letter = db.query(CompensationLetterDB).filter(CompensationLetterDB.id == letter_id).first()
    if not db_letter:
        raise HTTPException(status_code=404, detail="Compensation letter not found")
    return db_to_pydantic_compensation_letter(db_letter)

@app.put("/api/compensation-letters/{letter_id}", response_model=CompensationLetter)
async def update_compensation_letter(letter_id: str, letter_update: CompensationLetterUpdate, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    db_letter = db.query(CompensationLetterDB).filter(CompensationLetterDB.id == letter_id).first()
    if not db_letter:
        raise HTTPException(status_code=404, detail="Compensation letter not found")
    
    if letter_update.version is not None and db_letter.version != letter_update.version:
        raise HTTPException(status_code=409, detail="Version conflict. Please refresh and try again.")
    
    if letter_update.client_id:
        db_client = db.query(ClientDB).filter(ClientDB.id == letter_update.client_id).first()
        if not db_client:
            raise HTTPException(status_code=404, detail="Client not found")
    
    update_data = letter_update.dict(exclude_unset=True, exclude={"version"})
    for field, value in update_data.items():
        setattr(db_letter, field, value)
    
    if letter_update.client_id:
        db_client = db.query(ClientDB).filter(ClientDB.id == letter_update.client_id).first()
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
    db_letter = db.query(CompensationLetterDB).filter(CompensationLetterDB.id == letter_id).first()
    if not db_letter:
        raise HTTPException(status_code=404, detail="Compensation letter not found")
    
    db.delete(db_letter)
    db.commit()
    
    await manager.broadcast_data_change("delete", "compensation_letter", letter_id, {})
    
    return {"message": "Compensation letter deleted successfully"}

@app.post("/api/executions", response_model=Execution)
async def create_execution(execution: ExecutionCreate, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    execution_id = str(uuid.uuid4())
    now = datetime.now()
    
    db_client = db.query(ClientDB).filter(ClientDB.id == execution.client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    
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
    db: Session = Depends(get_db),
    token: str = Depends(verify_token)
):
    query = db.query(ExecutionDB)
    if status:
        query = query.filter(ExecutionDB.status == status)
    if client_id:
        query = query.filter(ExecutionDB.client_id == client_id)
    if haciz_durumu:
        query = query.filter(ExecutionDB.haciz_durumu == haciz_durumu)
    db_executions = query.all()
    return [db_to_pydantic_execution(execution) for execution in db_executions]

@app.get("/api/executions/{execution_id}", response_model=Execution)
async def get_execution(execution_id: str, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    db_execution = db.query(ExecutionDB).filter(ExecutionDB.id == execution_id).first()
    if not db_execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    return db_to_pydantic_execution(db_execution)

@app.put("/api/executions/{execution_id}", response_model=Execution)
async def update_execution(execution_id: str, execution_update: ExecutionUpdate, db: Session = Depends(get_db), token: str = Depends(verify_token)):
    db_execution = db.query(ExecutionDB).filter(ExecutionDB.id == execution_id).first()
    if not db_execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    if execution_update.version is not None and db_execution.version != execution_update.version:
        raise HTTPException(status_code=409, detail="Version conflict. Please refresh and try again.")
    
    if execution_update.client_id:
        db_client = db.query(ClientDB).filter(ClientDB.id == execution_update.client_id).first()
        if not db_client:
            raise HTTPException(status_code=404, detail="Client not found")
    
    update_data = execution_update.dict(exclude_unset=True, exclude={"version"})
    for field, value in update_data.items():
        setattr(db_execution, field, value)
    
    if execution_update.client_id:
        db_client = db.query(ClientDB).filter(ClientDB.id == execution_update.client_id).first()
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
    db_execution = db.query(ExecutionDB).filter(ExecutionDB.id == execution_id).first()
    if not db_execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    db.delete(db_execution)
    db.commit()
    
    await manager.broadcast_data_change("delete", "execution", execution_id, {})
    
    return {"message": "Execution deleted successfully"}
