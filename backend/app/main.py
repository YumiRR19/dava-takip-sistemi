from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Dict, Set
from datetime import datetime, date, timedelta
import uuid
import json
import os
import jwt
import fcntl
import threading
import asyncio
from pathlib import Path

app = FastAPI(title="Dava Takip Sistemi", description="Legal Case Tracking System")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.on_event("startup")
async def startup_event():
    print("Loading data on startup...")
    load_data()
    print(f"Loaded {len(clients_db)} clients, {len(cases_db)} cases, {len(compensation_letters_db)} compensation letters, {len(executions_db)} executions")

class Client(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    address: str
    tax_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    version: int = 1

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
    next_hearing_date: Optional[date]
    reminder_date: Optional[date]
    office_archive_no: str
    created_at: datetime
    updated_at: datetime
    version: int = 1

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

clients_db: dict[str, Client] = {}
cases_db: dict[str, Case] = {}

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
    version: int = 1

class CompensationLetterCreate(BaseModel):
    letter_number: str
    bank: str
    customer_number: str
    customer: str
    court: str
    case_number: str
    status: str
    description_text: Optional[str] = None

class CompensationLetterUpdate(BaseModel):
    letter_number: Optional[str] = None
    bank: Optional[str] = None
    customer_number: Optional[str] = None
    customer: Optional[str] = None
    court: Optional[str] = None
    case_number: Optional[str] = None
    status: Optional[str] = None
    description_text: Optional[str] = None
    version: Optional[int] = None

compensation_letters_db: dict[str, CompensationLetter] = {}

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
    version: int = 1

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
    defendant: Optional[str] = None
    execution_office: Optional[str] = None
    execution_number: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[date] = None
    office_archive_no: Optional[str] = None
    reminder_date: Optional[date] = None
    reminder_text: Optional[str] = None
    notes: Optional[str] = None
    haciz_durumu: Optional[str] = None
    version: Optional[int] = None

executions_db: dict[str, Execution] = {}

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD") or "Msghukuk0714."
JWT_SECRET = os.getenv("JWT_SECRET") or "lexcloud-jwt-secret-key-2025"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

DATA_DIR = Path("/tmp/lexcloud_data")
DATA_DIR.mkdir(exist_ok=True)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.connection_lock = threading.Lock()

    async def connect(self, websocket: WebSocket, user_token: str):
        await websocket.accept()
        with self.connection_lock:
            if user_token not in self.active_connections:
                self.active_connections[user_token] = set()
            self.active_connections[user_token].add(websocket)
        print(f"WebSocket connected for user: {user_token[:10]}...")

    def disconnect(self, websocket: WebSocket, user_token: str):
        with self.connection_lock:
            if user_token in self.active_connections:
                self.active_connections[user_token].discard(websocket)
                if not self.active_connections[user_token]:
                    del self.active_connections[user_token]
        print(f"WebSocket disconnected for user: {user_token[:10]}...")

    async def broadcast_data_change(self, change_type: str, entity_type: str, entity_id: str, data: dict):
        message = {
            "type": "data_change",
            "change_type": change_type,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "data": data,
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

manager = ConnectionManager()

def load_data():
    global clients_db, cases_db, compensation_letters_db, executions_db
    
    try:
        clients_file = DATA_DIR / "clients.json"
        if clients_file.exists():
            with open(clients_file, 'r', encoding='utf-8') as f:
                clients_data = json.load(f)
                for client_id, client_data in clients_data.items():
                    client_data["created_at"] = datetime.fromisoformat(client_data["created_at"])
                    if "updated_at" in client_data:
                        client_data["updated_at"] = datetime.fromisoformat(client_data["updated_at"])
                    else:
                        client_data["updated_at"] = client_data["created_at"]
                    clients_db[client_id] = Client(**client_data)
    except Exception as e:
        print(f"Error loading clients: {e}")
    
    try:
        cases_file = DATA_DIR / "cases.json"
        if cases_file.exists():
            with open(cases_file, 'r', encoding='utf-8') as f:
                cases_data = json.load(f)
                for case_id, case_data in cases_data.items():
                    case_data["created_at"] = datetime.fromisoformat(case_data["created_at"])
                    case_data["updated_at"] = datetime.fromisoformat(case_data["updated_at"])
                    case_data["start_date"] = date.fromisoformat(case_data["start_date"])
                    if case_data["next_hearing_date"]:
                        case_data["next_hearing_date"] = date.fromisoformat(case_data["next_hearing_date"])
                    if case_data.get("reminder_date"):
                        case_data["reminder_date"] = date.fromisoformat(case_data["reminder_date"])
                    cases_db[case_id] = Case(**case_data)
    except Exception as e:
        print(f"Error loading cases: {e}")
    
    try:
        letters_file = DATA_DIR / "compensation_letters.json"
        if letters_file.exists():
            with open(letters_file, 'r', encoding='utf-8') as f:
                letters_data = json.load(f)
                for letter_id, letter_data in letters_data.items():
                    letter_data["created_at"] = datetime.fromisoformat(letter_data["created_at"])
                    letter_data["updated_at"] = datetime.fromisoformat(letter_data["updated_at"])
                    compensation_letters_db[letter_id] = CompensationLetter(**letter_data)
    except Exception as e:
        print(f"Error loading compensation letters: {e}")
    
    try:
        executions_file = DATA_DIR / "executions.json"
        if executions_file.exists():
            with open(executions_file, 'r', encoding='utf-8') as f:
                executions_data = json.load(f)
                for execution_id, execution_data in executions_data.items():
                    execution_data["created_at"] = datetime.fromisoformat(execution_data["created_at"])
                    execution_data["updated_at"] = datetime.fromisoformat(execution_data["updated_at"])
                    execution_data["start_date"] = date.fromisoformat(execution_data["start_date"])
                    if execution_data.get("reminder_date"):
                        execution_data["reminder_date"] = date.fromisoformat(execution_data["reminder_date"])
                    executions_db[execution_id] = Execution(**execution_data)
    except Exception as e:
        print(f"Error loading executions: {e}")

def save_data():
    """Save all data to files with error handling and logging"""
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        
        for filename, data in [
            ('clients.json', clients_db),
            ('cases.json', cases_db),
            ('compensation_letters.json', compensation_letters_db),
            ('executions.json', executions_db)
        ]:
            filepath = DATA_DIR / filename
            temp_filepath = filepath.with_suffix('.tmp')
            
            if filename == 'clients.json':
                serialized_data = {k: {**v.model_dump(), "created_at": v.created_at.isoformat(), "updated_at": v.updated_at.isoformat(), "version": v.version} for k, v in data.items()}
            elif filename == 'cases.json':
                serialized_data = {k: {**v.model_dump(), "created_at": v.created_at.isoformat(), "updated_at": v.updated_at.isoformat(), "start_date": v.start_date.isoformat(), "next_hearing_date": v.next_hearing_date.isoformat() if v.next_hearing_date else None, "reminder_date": v.reminder_date.isoformat() if v.reminder_date else None, "version": v.version} for k, v in data.items()}
            elif filename == 'compensation_letters.json':
                serialized_data = {k: {**v.model_dump(), "created_at": v.created_at.isoformat(), "updated_at": v.updated_at.isoformat(), "version": v.version} for k, v in data.items()}
            elif filename == 'executions.json':
                serialized_data = {k: {**v.model_dump(), "created_at": v.created_at.isoformat(), "updated_at": v.updated_at.isoformat(), "start_date": v.start_date.isoformat(), "reminder_date": v.reminder_date.isoformat() if v.reminder_date else None, "version": v.version} for k, v in data.items()}
            
            with open(temp_filepath, 'w', encoding='utf-8') as f:
                json.dump(serialized_data, f, ensure_ascii=False, indent=2, default=str)
            
            temp_filepath.replace(filepath)
            
        print(f"Data saved successfully at {datetime.now()}")
    except Exception as e:
        print(f"Error saving data: {e}")
        import traceback
        traceback.print_exc()
        raise

def save_clients():
    save_data()

def save_cases():
    save_data()

def save_compensation_letters():
    save_data()

def save_executions():
    save_data()

load_data()

security = HTTPBearer(auto_error=False)

class LoginRequest(BaseModel):
    password: str

class LoginResponse(BaseModel):
    success: bool
    token: str

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return credentials.credentials
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
@app.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    try:
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            await websocket.close(code=1008, reason="Token expired")
            return
        except jwt.InvalidTokenError:
            await websocket.close(code=1008, reason="Invalid token")
            return
        
        await manager.connect(websocket, token)
        
        while True:
            try:
                data = await websocket.receive_text()
                await websocket.send_text(json.dumps({"type": "pong", "timestamp": datetime.now().isoformat()}))
            except WebSocketDisconnect:
                break
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        manager.disconnect(websocket, token)



@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/api/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    if request.password == ADMIN_PASSWORD:
        expiration = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
        payload = {
            "exp": expiration,
            "iat": datetime.utcnow(),
            "user": "admin"
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return LoginResponse(success=True, token=token)
    else:
        raise HTTPException(status_code=401, detail="Invalid password")

@app.post("/api/auth/logout")
async def logout(token: str = Depends(verify_token)):
    return {"message": "Logged out successfully"}

@app.post("/api/auth/change-password")
async def change_password(request: PasswordChangeRequest, token: str = Depends(verify_token)):
    global ADMIN_PASSWORD
    if request.current_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    ADMIN_PASSWORD = request.new_password
    return {"message": "Password changed successfully"}

@app.get("/api/backup")
async def backup_data(token: str = Depends(verify_token)):
    backup_data = {
        "clients": {k: {**v.dict(), "created_at": v.created_at.isoformat()} for k, v in clients_db.items()},
        "cases": {k: {**v.dict(), "created_at": v.created_at.isoformat(), "updated_at": v.updated_at.isoformat(), "start_date": v.start_date.isoformat(), "next_hearing_date": v.next_hearing_date.isoformat() if v.next_hearing_date else None, "reminder_date": v.reminder_date.isoformat() if v.reminder_date else None} for k, v in cases_db.items()},
        "compensation_letters": {k: {**v.dict(), "created_at": v.created_at.isoformat(), "updated_at": v.updated_at.isoformat()} for k, v in compensation_letters_db.items()},
        "executions": {k: {**v.dict(), "created_at": v.created_at.isoformat(), "updated_at": v.updated_at.isoformat(), "start_date": v.start_date.isoformat(), "reminder_date": v.reminder_date.isoformat() if v.reminder_date else None} for k, v in executions_db.items()},
        "backup_date": datetime.now().isoformat()
    }
    return backup_data

@app.post("/api/restore")
async def restore_data(backup_data: dict, token: str = Depends(verify_token)):
    global clients_db, cases_db, compensation_letters_db, executions_db
    try:
        clients_db = {}
        for client_id, client_data in backup_data.get("clients", {}).items():
            client_data["created_at"] = datetime.fromisoformat(client_data["created_at"])
            clients_db[client_id] = Client(**client_data)
        
        cases_db = {}
        for case_id, case_data in backup_data.get("cases", {}).items():
            case_data["created_at"] = datetime.fromisoformat(case_data["created_at"])
            case_data["updated_at"] = datetime.fromisoformat(case_data["updated_at"])
            case_data["start_date"] = date.fromisoformat(case_data["start_date"])
            if case_data["next_hearing_date"]:
                case_data["next_hearing_date"] = date.fromisoformat(case_data["next_hearing_date"])
            if case_data.get("reminder_date"):
                case_data["reminder_date"] = date.fromisoformat(case_data["reminder_date"])
            if "office_archive_no" not in case_data:
                case_data["office_archive_no"] = ""
            cases_db[case_id] = Case(**case_data)
        
        compensation_letters_db = {}
        for letter_id, letter_data in backup_data.get("compensation_letters", {}).items():
            letter_data["created_at"] = datetime.fromisoformat(letter_data["created_at"])
            letter_data["updated_at"] = datetime.fromisoformat(letter_data["updated_at"])
            compensation_letters_db[letter_id] = CompensationLetter(**letter_data)
        
        executions_db = {}
        for execution_id, execution_data in backup_data.get("executions", {}).items():
            execution_data["created_at"] = datetime.fromisoformat(execution_data["created_at"])
            execution_data["updated_at"] = datetime.fromisoformat(execution_data["updated_at"])
            execution_data["start_date"] = date.fromisoformat(execution_data["start_date"])
            if execution_data.get("reminder_date"):
                execution_data["reminder_date"] = date.fromisoformat(execution_data["reminder_date"])
            executions_db[execution_id] = Execution(**execution_data)
        
        return {"message": "Data restored successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Restore failed: {str(e)}")

@app.post("/api/clients", response_model=Client)
async def create_client(client: ClientCreate, token: str = Depends(verify_token)):
    client_id = str(uuid.uuid4())
    now = datetime.now()
    new_client = Client(
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
    clients_db[client_id] = new_client
    save_data()
    
    await manager.broadcast_data_change("create", "client", client_id, new_client.dict())
    
    return new_client

@app.get("/api/clients", response_model=List[Client])
async def get_clients(token: str = Depends(verify_token)):
    return list(clients_db.values())

@app.get("/api/clients/{client_id}", response_model=Client)
async def get_client(client_id: str, token: str = Depends(verify_token)):
    if client_id not in clients_db:
        raise HTTPException(status_code=404, detail="Client not found")
    return clients_db[client_id]

@app.put("/api/clients/{client_id}", response_model=Client)
async def update_client(client_id: str, client_update: ClientUpdate, token: str = Depends(verify_token)):
    try:
        if client_id not in clients_db:
            print(f"Client not found: {client_id}")
            raise HTTPException(status_code=404, detail="Client not found")
        
        client = clients_db[client_id]
        
        if hasattr(client_update, 'version') and client_update.version is not None:
            if client.version != client_update.version:
                raise HTTPException(status_code=409, detail=f"Conflict: Client was modified by another user. Expected version {client_update.version}, but current version is {client.version}")
        
        update_data = client_update.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            if field != 'version':
                setattr(client, field, value)
        
        client.updated_at = datetime.now()
        client.version += 1
        clients_db[client_id] = client
        save_data()
        
        await manager.broadcast_data_change("update", "client", client_id, client.dict())
        
        print(f"Client updated successfully: {client_id}")
        return client
    except Exception as e:
        print(f"Error updating client {client_id}: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error updating client: {str(e)}")

@app.delete("/api/clients/{client_id}")
async def delete_client(client_id: str, token: str = Depends(verify_token)):
    if client_id not in clients_db:
        raise HTTPException(status_code=404, detail="Client not found")
    
    client_cases = [case for case in cases_db.values() if case.client_id == client_id]
    if client_cases:
        raise HTTPException(status_code=400, detail="Cannot delete client with existing cases")
    
    del clients_db[client_id]
    save_data()
    
    await manager.broadcast_data_change("delete", "client", client_id, {})
    
    return {"message": "Client deleted successfully"}

@app.post("/api/cases", response_model=Case)
async def create_case(case: CaseCreate, token: str = Depends(verify_token)):
    try:
        if case.client_id not in clients_db:
            print(f"Client not found for case creation: {case.client_id}")
            raise HTTPException(status_code=404, detail="Client not found")
        
        case_id = str(uuid.uuid4())
        client = clients_db[case.client_id]
        now = datetime.now()
        
        new_case = Case(
            id=case_id,
            title=case.title,
            case_name=case.case_name,
            description=case.description or "",
            client_id=case.client_id,
            client_name=client.name,
            case_type=case.case_type,
            status=case.status,
            court=case.court,
            case_number=case.case_number,
            defendant=case.defendant,
            notes=case.notes or "",
            start_date=case.start_date,
            next_hearing_date=case.next_hearing_date,
            reminder_date=case.reminder_date,
            office_archive_no=case.office_archive_no,
            created_at=now,
            updated_at=now,
            version=1
        )
        cases_db[case_id] = new_case
        save_data()
        
        await manager.broadcast_data_change("create", "case", case_id, new_case.dict())
        
        print(f"Case created successfully: {case_id}")
        return new_case
    except Exception as e:
        print(f"Error creating case: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating case: {str(e)}")

@app.get("/api/cases", response_model=List[Case])
async def get_cases(status: Optional[str] = None, client_id: Optional[str] = None, token: str = Depends(verify_token)):
    cases = list(cases_db.values())
    
    if status:
        cases = [case for case in cases if case.status.lower() == status.lower()]
    
    if client_id:
        cases = [case for case in cases if case.client_id == client_id]
    
    cases.sort(key=lambda x: x.updated_at, reverse=True)
    return cases

@app.get("/api/cases/{case_id}", response_model=Case)
async def get_case(case_id: str, token: str = Depends(verify_token)):
    if case_id not in cases_db:
        raise HTTPException(status_code=404, detail="Case not found")
    return cases_db[case_id]

@app.put("/api/cases/{case_id}", response_model=Case)
async def update_case(case_id: str, case_update: CaseUpdate, token: str = Depends(verify_token)):
    try:
        if case_id not in cases_db:
            print(f"Case not found: {case_id}")
            raise HTTPException(status_code=404, detail="Case not found")
        
        case = cases_db[case_id]
        
        if hasattr(case_update, 'version') and case_update.version is not None:
            if case.version != case_update.version:
                raise HTTPException(status_code=409, detail=f"Conflict: Case was modified by another user. Expected version {case_update.version}, but current version is {case.version}")
        
        update_data = case_update.dict(exclude_unset=True)
        
        if 'client_id' in update_data and update_data['client_id'] not in clients_db:
            print(f"Client not found for case update: {update_data['client_id']}")
            raise HTTPException(status_code=400, detail="Client not found")
        
        for field, value in update_data.items():
            if field != 'version':
                setattr(case, field, value)
        
        if 'client_id' in update_data:
            client = clients_db[update_data['client_id']]
            case.client_name = client.name
        
        case.updated_at = datetime.now()
        case.version += 1
        cases_db[case_id] = case
        save_data()
        
        await manager.broadcast_data_change("update", "case", case_id, case.dict())
        
        print(f"Case updated successfully: {case_id}")
        return case
    except Exception as e:
        print(f"Error updating case {case_id}: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error updating case: {str(e)}")

@app.delete("/api/cases/{case_id}")
async def delete_case(case_id: str, token: str = Depends(verify_token)):
    if case_id not in cases_db:
        raise HTTPException(status_code=404, detail="Case not found")
    
    del cases_db[case_id]
    save_data()
    
    await manager.broadcast_data_change("delete", "case", case_id, {})
    
    return {"message": "Case deleted successfully"}

class CaseSearchParams(BaseModel):
    case_type: Optional[str] = None
    status: Optional[str] = None
    court: Optional[str] = None
    client_id: Optional[str] = None
    start_date_from: Optional[date] = None
    start_date_to: Optional[date] = None

@app.post("/api/cases/search", response_model=List[Case])
async def search_cases(search_params: CaseSearchParams, token: str = Depends(verify_token)):
    cases = list(cases_db.values())
    
    if search_params.case_type:
        cases = [case for case in cases if case.case_type.lower() == search_params.case_type.lower()]
    
    if search_params.status:
        cases = [case for case in cases if case.status.lower() == search_params.status.lower()]
    
    if search_params.court:
        cases = [case for case in cases if search_params.court.lower() in case.court.lower()]
    
    if search_params.client_id:
        cases = [case for case in cases if case.client_id == search_params.client_id]
    
    if search_params.start_date_from:
        cases = [case for case in cases if case.start_date >= search_params.start_date_from]
    
    if search_params.start_date_to:
        cases = [case for case in cases if case.start_date <= search_params.start_date_to]
    
    cases.sort(key=lambda x: x.updated_at, reverse=True)
    return cases

@app.get("/api/dashboard")
async def get_dashboard(token: str = Depends(verify_token)):
    total_cases = len(cases_db)
    total_clients = len(clients_db)
    
    status_counts = {}
    for case in cases_db.values():
        status = case.status
        status_counts[status] = status_counts.get(status, 0) + 1
    
    from datetime import timedelta
    today = date.today()
    upcoming_deadline = today + timedelta(days=7)
    
    upcoming_hearings = []
    for case in cases_db.values():
        if case.next_hearing_date and today <= case.next_hearing_date <= upcoming_deadline:
            upcoming_hearings.append({
                "case_id": case.id,
                "case_title": case.title,
                "case_number": case.case_number,
                "client_name": case.client_name,
                "hearing_date": case.next_hearing_date,
                "court": case.court,
                "defendant": case.defendant
            })
    
    upcoming_hearings.sort(key=lambda x: x["hearing_date"])
    
    upcoming_reminders = []
    for case in cases_db.values():
        if case.reminder_date:
            reminder_date_obj = case.reminder_date
            if hasattr(case.reminder_date, 'date'):
                reminder_date_obj = case.reminder_date.date()
            
            if today <= reminder_date_obj <= upcoming_deadline:
                upcoming_reminders.append({
                    "type": "case",
                    "case_id": case.id,
                    "case_title": case.title,
                    "case_name": case.case_name or "",
                    "case_number": case.case_number,
                    "client_name": case.client_name,
                    "reminder_date": case.reminder_date,
                    "court": case.court,
                    "status": case.status,
                    "defendant": case.defendant,
                    "description": case.description or ""
                })
    
    for execution in executions_db.values():
        if execution.reminder_date:
            reminder_date_obj = execution.reminder_date
            if hasattr(execution.reminder_date, 'date'):
                reminder_date_obj = execution.reminder_date.date()
            
            if today <= reminder_date_obj <= upcoming_deadline:
                upcoming_reminders.append({
                    "type": "execution",
                    "execution_id": execution.id,
                    "execution_number": execution.execution_number,
                    "execution_office": execution.execution_office,
                    "client_name": execution.client_name,
                    "reminder_date": execution.reminder_date,
                    "defendant": execution.defendant,
                    "reminder_text": execution.reminder_text or ""
                })
    
    upcoming_reminders.sort(key=lambda x: x["reminder_date"])
    
    return {
        "total_cases": total_cases,
        "total_clients": total_clients,
        "status_counts": status_counts,
        "upcoming_hearings": upcoming_hearings,
        "upcoming_reminders": upcoming_reminders
    }

@app.post("/api/compensation-letters", response_model=CompensationLetter)
async def create_compensation_letter(letter: CompensationLetterCreate, token: str = Depends(verify_token)):
    try:
        letter_id = str(uuid.uuid4())
        now = datetime.now()
        
        new_letter = CompensationLetter(
            id=letter_id,
            title="",
            client_id="",
            client_name="",
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
        compensation_letters_db[letter_id] = new_letter
        save_data()
        
        await manager.broadcast_data_change("create", "compensation_letter", letter_id, new_letter.dict())
        
        print(f"Compensation letter created successfully: {letter_id}")
        return new_letter
    except Exception as e:
        print(f"Error creating compensation letter: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating compensation letter: {str(e)}")

@app.get("/api/compensation-letters", response_model=List[CompensationLetter])
async def get_compensation_letters(status: Optional[str] = None, client_id: Optional[str] = None, token: str = Depends(verify_token)):
    letters = list(compensation_letters_db.values())
    
    if status:
        letters = [letter for letter in letters if letter.status.lower() == status.lower()]
    
    if client_id:
        letters = [letter for letter in letters if letter.client_id == client_id]
    
    letters.sort(key=lambda x: x.updated_at, reverse=True)
    return letters

@app.get("/api/compensation-letters/{letter_id}", response_model=CompensationLetter)
async def get_compensation_letter(letter_id: str, token: str = Depends(verify_token)):
    if letter_id not in compensation_letters_db:
        raise HTTPException(status_code=404, detail="Compensation letter not found")
    return compensation_letters_db[letter_id]

@app.put("/api/compensation-letters/{letter_id}", response_model=CompensationLetter)
async def update_compensation_letter(letter_id: str, letter_update: CompensationLetterUpdate, token: str = Depends(verify_token)):
    try:
        if letter_id not in compensation_letters_db:
            print(f"Compensation letter not found: {letter_id}")
            raise HTTPException(status_code=404, detail="Compensation letter not found")
        
        letter = compensation_letters_db[letter_id]
        
        if hasattr(letter_update, 'version') and letter_update.version is not None:
            if letter.version != letter_update.version:
                raise HTTPException(status_code=409, detail=f"Conflict: Compensation letter was modified by another user. Expected version {letter_update.version}, but current version is {letter.version}")
        
        update_data = letter_update.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            if field != 'version':
                setattr(letter, field, value)
        
        letter.updated_at = datetime.now()
        letter.version += 1
        compensation_letters_db[letter_id] = letter
        save_data()
        
        await manager.broadcast_data_change("update", "compensation_letter", letter_id, letter.dict())
        
        print(f"Compensation letter updated successfully: {letter_id}")
        return letter
    except Exception as e:
        print(f"Error updating compensation letter {letter_id}: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error updating compensation letter: {str(e)}")

@app.delete("/api/compensation-letters/{letter_id}")
async def delete_compensation_letter(letter_id: str, token: str = Depends(verify_token)):
    if letter_id not in compensation_letters_db:
        raise HTTPException(status_code=404, detail="Compensation letter not found")
    
    del compensation_letters_db[letter_id]
    save_data()
    
    await manager.broadcast_data_change("delete", "compensation_letter", letter_id, {})
    
    return {"message": "Compensation letter deleted successfully"}

@app.post("/api/executions", response_model=Execution)
async def create_execution(execution: ExecutionCreate, token: str = Depends(verify_token)):
    try:
        if execution.client_id not in clients_db:
            print(f"Client not found for execution creation: {execution.client_id}")
            raise HTTPException(status_code=404, detail="Client not found")
        
        execution_id = str(uuid.uuid4())
        client = clients_db[execution.client_id]
        now = datetime.now()
        
        new_execution = Execution(
            id=execution_id,
            client_id=execution.client_id,
            client_name=client.name,
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
        executions_db[execution_id] = new_execution
        save_data()
        
        await manager.broadcast_data_change("create", "execution", execution_id, new_execution.dict())
        
        print(f"Execution created successfully: {execution_id}")
        return new_execution
    except Exception as e:
        print(f"Error creating execution: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating execution: {str(e)}")

@app.get("/api/executions", response_model=List[Execution])
async def get_executions(status: Optional[str] = None, client_id: Optional[str] = None, haciz_durumu: Optional[str] = None, token: str = Depends(verify_token)):
    executions = list(executions_db.values())
    
    if status:
        executions = [execution for execution in executions if execution.status.lower() == status.lower()]
    
    if client_id:
        executions = [execution for execution in executions if execution.client_id == client_id]
    
    if haciz_durumu:
        executions = [execution for execution in executions if execution.haciz_durumu and execution.haciz_durumu.lower() == haciz_durumu.lower()]
    
    return executions

@app.get("/api/executions/{execution_id}", response_model=Execution)
async def get_execution(execution_id: str, token: str = Depends(verify_token)):
    if execution_id not in executions_db:
        raise HTTPException(status_code=404, detail="Execution not found")
    return executions_db[execution_id]

@app.put("/api/executions/{execution_id}", response_model=Execution)
async def update_execution(execution_id: str, execution_update: ExecutionUpdate, token: str = Depends(verify_token)):
    try:
        if execution_id not in executions_db:
            print(f"Execution not found: {execution_id}")
            raise HTTPException(status_code=404, detail="Execution not found")
        
        execution = executions_db[execution_id]
        
        if hasattr(execution_update, 'version') and execution_update.version is not None:
            if execution.version != execution_update.version:
                raise HTTPException(status_code=409, detail=f"Conflict: Execution was modified by another user. Expected version {execution_update.version}, but current version is {execution.version}")
        
        update_data = execution_update.dict(exclude_unset=True)
        
        if 'client_id' in update_data and update_data['client_id'] not in clients_db:
            print(f"Client not found for execution update: {update_data['client_id']}")
            raise HTTPException(status_code=400, detail="Client not found")
        
        for field, value in update_data.items():
            if field != 'version':
                setattr(execution, field, value)
        
        if 'client_id' in update_data:
            client = clients_db[update_data['client_id']]
            execution.client_name = client.name
        
        execution.updated_at = datetime.now()
        execution.version += 1
        executions_db[execution_id] = execution
        save_data()
        
        await manager.broadcast_data_change("update", "execution", execution_id, execution.dict())
        
        print(f"Execution updated successfully: {execution_id}")
        return execution
    except Exception as e:
        print(f"Error updating execution {execution_id}: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error updating execution: {str(e)}")

@app.delete("/api/executions/{execution_id}")
async def delete_execution(execution_id: str, token: str = Depends(verify_token)):
    if execution_id not in executions_db:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    del executions_db[execution_id]
    save_data()
    
    await manager.broadcast_data_change("delete", "execution", execution_id, {})
    
    return {"message": "Execution deleted successfully"}
