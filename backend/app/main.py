from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
import uuid
import json
import os

app = FastAPI(title="Dava Takip Sistemi", description="Legal Case Tracking System")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class Client(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    address: str
    tax_id: Optional[str] = None
    created_at: datetime

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

class Case(BaseModel):
    id: str
    title: str
    description: str
    client_id: str
    client_name: str
    case_type: str
    status: str
    court: str
    case_number: str
    defendant: str
    notes: str
    start_date: date
    next_hearing_date: Optional[date]
    reminder_date: Optional[date]
    office_archive_no: str
    created_at: datetime
    updated_at: datetime

class CaseCreate(BaseModel):
    title: str
    description: str
    client_id: str
    case_type: str
    status: str
    court: str
    case_number: str
    defendant: str
    notes: str
    start_date: date
    next_hearing_date: Optional[date]
    reminder_date: Optional[date]
    office_archive_no: str

class CaseUpdate(BaseModel):
    title: Optional[str] = None
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

clients_db: dict[str, Client] = {}
cases_db: dict[str, Case] = {}

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD") or "Msghukuk0714."
active_sessions: set[str] = set()

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
    if not credentials or credentials.credentials not in active_sessions:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return credentials.credentials

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/api/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    if request.password == ADMIN_PASSWORD:
        token = str(uuid.uuid4())
        active_sessions.add(token)
        return LoginResponse(success=True, token=token)
    else:
        raise HTTPException(status_code=401, detail="Invalid password")

@app.post("/api/auth/logout")
async def logout(token: str = Depends(verify_token)):
    active_sessions.discard(token)
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
        "backup_date": datetime.now().isoformat()
    }
    return backup_data

@app.post("/api/restore")
async def restore_data(backup_data: dict, token: str = Depends(verify_token)):
    global clients_db, cases_db
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
        
        return {"message": "Data restored successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Restore failed: {str(e)}")

@app.post("/api/clients", response_model=Client)
async def create_client(client: ClientCreate, token: str = Depends(verify_token)):
    client_id = str(uuid.uuid4())
    new_client = Client(
        id=client_id,
        name=client.name,
        email=client.email,
        phone=client.phone,
        address=client.address,
        tax_id=client.tax_id,
        created_at=datetime.now()
    )
    clients_db[client_id] = new_client
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
    if client_id not in clients_db:
        raise HTTPException(status_code=404, detail="Client not found")
    
    client = clients_db[client_id]
    update_data = client_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(client, field, value)
    
    clients_db[client_id] = client
    return client

@app.delete("/api/clients/{client_id}")
async def delete_client(client_id: str, token: str = Depends(verify_token)):
    if client_id not in clients_db:
        raise HTTPException(status_code=404, detail="Client not found")
    
    client_cases = [case for case in cases_db.values() if case.client_id == client_id]
    if client_cases:
        raise HTTPException(status_code=400, detail="Cannot delete client with existing cases")
    
    del clients_db[client_id]
    return {"message": "Client deleted successfully"}

@app.post("/api/cases", response_model=Case)
async def create_case(case: CaseCreate, token: str = Depends(verify_token)):
    if case.client_id not in clients_db:
        raise HTTPException(status_code=404, detail="Client not found")
    
    case_id = str(uuid.uuid4())
    client = clients_db[case.client_id]
    now = datetime.now()
    
    new_case = Case(
        id=case_id,
        title=case.title,
        description=case.description,
        client_id=case.client_id,
        client_name=client.name,
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
        updated_at=now
    )
    cases_db[case_id] = new_case
    return new_case

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
    if case_id not in cases_db:
        raise HTTPException(status_code=404, detail="Case not found")
    
    case = cases_db[case_id]
    update_data = case_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(case, field, value)
    
    case.updated_at = datetime.now()
    cases_db[case_id] = case
    return case

@app.delete("/api/cases/{case_id}")
async def delete_case(case_id: str, token: str = Depends(verify_token)):
    if case_id not in cases_db:
        raise HTTPException(status_code=404, detail="Case not found")
    
    del cases_db[case_id]
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
                "court": case.court
            })
    
    upcoming_hearings.sort(key=lambda x: x["hearing_date"])
    
    upcoming_reminders = []
    for case in cases_db.values():
        if case.reminder_date and today <= case.reminder_date <= upcoming_deadline:
            upcoming_reminders.append({
                "case_id": case.id,
                "case_title": case.title,
                "case_number": case.case_number,
                "client_name": case.client_name,
                "reminder_date": case.reminder_date,
                "court": case.court,
                "status": case.status
            })
    
    upcoming_reminders.sort(key=lambda x: x["reminder_date"])
    
    return {
        "total_cases": total_cases,
        "total_clients": total_clients,
        "status_counts": status_counts,
        "upcoming_hearings": upcoming_hearings,
        "upcoming_reminders": upcoming_reminders
    }
