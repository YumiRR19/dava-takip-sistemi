from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
import uuid

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
    created_at: datetime

class ClientCreate(BaseModel):
    name: str
    email: str
    phone: str
    address: str

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
    start_date: date
    next_hearing_date: Optional[date]
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
    start_date: date
    next_hearing_date: Optional[date]

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    case_type: Optional[str] = None
    status: Optional[str] = None
    court: Optional[str] = None
    case_number: Optional[str] = None
    start_date: Optional[date] = None
    next_hearing_date: Optional[date] = None

clients_db: dict[str, Client] = {}
cases_db: dict[str, Case] = {}

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/api/clients", response_model=Client)
async def create_client(client: ClientCreate):
    client_id = str(uuid.uuid4())
    new_client = Client(
        id=client_id,
        name=client.name,
        email=client.email,
        phone=client.phone,
        address=client.address,
        created_at=datetime.now()
    )
    clients_db[client_id] = new_client
    return new_client

@app.get("/api/clients", response_model=List[Client])
async def get_clients():
    return list(clients_db.values())

@app.get("/api/clients/{client_id}", response_model=Client)
async def get_client(client_id: str):
    if client_id not in clients_db:
        raise HTTPException(status_code=404, detail="Client not found")
    return clients_db[client_id]

@app.delete("/api/clients/{client_id}")
async def delete_client(client_id: str):
    if client_id not in clients_db:
        raise HTTPException(status_code=404, detail="Client not found")
    
    client_cases = [case for case in cases_db.values() if case.client_id == client_id]
    if client_cases:
        raise HTTPException(status_code=400, detail="Cannot delete client with existing cases")
    
    del clients_db[client_id]
    return {"message": "Client deleted successfully"}

@app.post("/api/cases", response_model=Case)
async def create_case(case: CaseCreate):
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
        start_date=case.start_date,
        next_hearing_date=case.next_hearing_date,
        created_at=now,
        updated_at=now
    )
    cases_db[case_id] = new_case
    return new_case

@app.get("/api/cases", response_model=List[Case])
async def get_cases(status: Optional[str] = None, client_id: Optional[str] = None):
    cases = list(cases_db.values())
    
    if status:
        cases = [case for case in cases if case.status.lower() == status.lower()]
    
    if client_id:
        cases = [case for case in cases if case.client_id == client_id]
    
    cases.sort(key=lambda x: x.updated_at, reverse=True)
    return cases

@app.get("/api/cases/{case_id}", response_model=Case)
async def get_case(case_id: str):
    if case_id not in cases_db:
        raise HTTPException(status_code=404, detail="Case not found")
    return cases_db[case_id]

@app.put("/api/cases/{case_id}", response_model=Case)
async def update_case(case_id: str, case_update: CaseUpdate):
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
async def delete_case(case_id: str):
    if case_id not in cases_db:
        raise HTTPException(status_code=404, detail="Case not found")
    
    del cases_db[case_id]
    return {"message": "Case deleted successfully"}

@app.get("/api/dashboard")
async def get_dashboard():
    total_cases = len(cases_db)
    total_clients = len(clients_db)
    
    status_counts = {}
    for case in cases_db.values():
        status = case.status
        status_counts[status] = status_counts.get(status, 0) + 1
    
    from datetime import timedelta
    today = date.today()
    upcoming_deadline = today + timedelta(days=30)
    
    upcoming_hearings = []
    for case in cases_db.values():
        if case.next_hearing_date and today <= case.next_hearing_date <= upcoming_deadline:
            upcoming_hearings.append({
                "case_id": case.id,
                "case_title": case.title,
                "client_name": case.client_name,
                "hearing_date": case.next_hearing_date,
                "court": case.court
            })
    
    upcoming_hearings.sort(key=lambda x: x["hearing_date"])
    
    return {
        "total_cases": total_cases,
        "total_clients": total_clients,
        "status_counts": status_counts,
        "upcoming_hearings": upcoming_hearings
    }
