"""Comprehensive API tests for LexCloud backend."""
import pytest
import os
import sys
from unittest.mock import patch, MagicMock, PropertyMock
from datetime import datetime, date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

# Mock environment variables before importing app
os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost:5432/testdb")
os.environ.setdefault("ADMIN_PASSWORD", "test_password_123")
os.environ.setdefault("JWT_SECRET", "test_jwt_secret_key_12345")


@pytest.fixture(autouse=True)
def mock_db_setup():
    """Mock database setup to avoid requiring a real PostgreSQL connection."""
    with patch('app.database.create_engine') as mock_engine, \
         patch('app.database.sessionmaker') as mock_sessionmaker:
        mock_session = MagicMock()
        mock_sessionmaker.return_value = MagicMock(return_value=mock_session)
        yield mock_session


@pytest.fixture
def mock_db():
    """Create a mock database session."""
    db = MagicMock()
    return db


class TestLoginEndpoint:
    """Tests for the authentication system."""

    def test_login_request_model(self):
        """Test LoginRequest model accepts password field."""
        from app.main import LoginRequest
        request = LoginRequest(password="test123")
        assert request.password == "test123"

    def test_login_response_model(self):
        """Test LoginResponse model returns token."""
        from app.main import LoginResponse
        response = LoginResponse(token="jwt_token_here")
        assert response.token == "jwt_token_here"

    def test_password_change_request_model(self):
        """Test PasswordChangeRequest model."""
        from app.main import PasswordChangeRequest
        request = PasswordChangeRequest(new_password="new_pass")
        assert request.new_password == "new_pass"


class TestClientModels:
    """Tests for Client Pydantic models."""

    def test_client_create_model(self):
        from app.main import ClientCreate
        client = ClientCreate(
            name="Test Client",
            email="test@example.com",
            phone="555-0100",
            address="123 Test St"
        )
        assert client.name == "Test Client"
        assert client.email == "test@example.com"
        assert client.phone == "555-0100"
        assert client.address == "123 Test St"
        assert client.tax_id is None
        assert client.vekalet_ofis_no is None

    def test_client_create_with_optional_fields(self):
        from app.main import ClientCreate
        client = ClientCreate(
            name="Full Client",
            email="full@example.com",
            phone="555-0200",
            address="456 Full St",
            tax_id="TAX123",
            vekalet_ofis_no="VK-001"
        )
        assert client.tax_id == "TAX123"
        assert client.vekalet_ofis_no == "VK-001"

    def test_client_update_model(self):
        from app.main import ClientUpdate
        update = ClientUpdate(name="Updated Name", version=2)
        assert update.name == "Updated Name"
        assert update.version == 2
        assert update.email is None

    def test_client_model_complete(self):
        from app.main import Client
        now = datetime.now()
        client = Client(
            id="uuid-123",
            name="Test",
            email="t@t.com",
            phone="555",
            address="Addr",
            created_at=now,
            updated_at=now,
            version=1
        )
        assert client.id == "uuid-123"
        assert client.version == 1


class TestCaseModels:
    """Tests for Case Pydantic models."""

    def test_case_create_model(self):
        from app.main import CaseCreate
        case = CaseCreate(
            title="Test Case",
            client_id="client-1",
            case_type="Hukuk",
            status="Derdest",
            court="Istanbul 1. Asliye Hukuk",
            case_number="2024/001",
            defendant="Defendant Corp",
            start_date=date.today(),
            office_archive_no="ARC-001"
        )
        assert case.title == "Test Case"
        assert case.status == "Derdest"
        assert case.case_name is None
        assert case.description is None

    def test_case_create_with_all_fields(self):
        from app.main import CaseCreate
        case = CaseCreate(
            title="Full Case",
            case_name="Important Case",
            description="Case description",
            client_id="client-2",
            case_type="Ceza",
            status="Temyiz",
            court="Ankara 3. Ceza",
            case_number="2024/100",
            defendant="Other Party",
            notes="Some notes",
            start_date=date(2024, 1, 15),
            next_hearing_date=date(2024, 6, 20),
            reminder_date=date(2024, 6, 18),
            office_archive_no="ARC-100",
            responsible_person="Av.M.Serif Bey",
            görevlendiren="Omer Bey"
        )
        assert case.case_name == "Important Case"
        assert case.görevlendiren == "Omer Bey"
        assert case.reminder_date == date(2024, 6, 18)

    def test_case_update_model(self):
        from app.main import CaseUpdate
        update = CaseUpdate(status="Kabul", version=3)
        assert update.status == "Kabul"
        assert update.title is None

    def test_case_model_complete(self):
        from app.main import Case
        now = datetime.now()
        case = Case(
            id="case-uuid",
            title="Test",
            client_id="c1",
            client_name="Client",
            case_type="Hukuk",
            status="Derdest",
            court="Court",
            case_number="2024/1",
            defendant="Def",
            start_date=date.today(),
            office_archive_no="A1",
            created_at=now,
            updated_at=now,
            version=1
        )
        assert case.id == "case-uuid"


class TestCompensationLetterModels:
    """Tests for CompensationLetter Pydantic models."""

    def test_compensation_letter_create_model(self):
        from app.main import CompensationLetterCreate
        letter = CompensationLetterCreate(
            client_id="client-1",
            letter_number="TM-001",
            bank="Ziraat Bankasi",
            customer_number="C001",
            customer="Customer Corp",
            court="Istanbul Mahkemesi",
            case_number="2024/50",
            status="Aktif"
        )
        assert letter.letter_number == "TM-001"
        assert letter.bank == "Ziraat Bankasi"
        assert letter.description_text is None

    def test_compensation_letter_update_model(self):
        from app.main import CompensationLetterUpdate
        update = CompensationLetterUpdate(status="Tamamlandi", version=2)
        assert update.status == "Tamamlandi"
        assert update.bank is None

    def test_compensation_letter_model_complete(self):
        from app.main import CompensationLetter
        now = datetime.now()
        letter = CompensationLetter(
            id="letter-1",
            title="TM - TM-001",
            client_id="c1",
            client_name="Client",
            letter_number="TM-001",
            bank="Bank",
            customer_number="CN",
            customer="Cust",
            court="Court",
            case_number="2024/1",
            status="Aktif",
            created_at=now,
            updated_at=now,
            version=1
        )
        assert letter.id == "letter-1"


class TestExecutionModels:
    """Tests for Execution Pydantic models."""

    def test_execution_create_model(self):
        from app.main import ExecutionCreate
        execution = ExecutionCreate(
            client_id="client-1",
            defendant="Defendant Corp",
            execution_office="Istanbul 5. Icra",
            execution_number="2024/ICR-001",
            status="Devam Ediyor",
            execution_type="Ilamsiz",
            start_date=date.today(),
            office_archive_no="ICR-001"
        )
        assert execution.execution_office == "Istanbul 5. Icra"
        assert execution.execution_type == "Ilamsiz"
        assert execution.haciz_durumu is None

    def test_execution_create_with_all_fields(self):
        from app.main import ExecutionCreate
        execution = ExecutionCreate(
            client_id="client-2",
            defendant="Another Corp",
            execution_office="Ankara 3. Icra",
            execution_number="2024/ICR-100",
            status="Tamamlandi",
            execution_type="Ilamli",
            start_date=date(2024, 3, 1),
            office_archive_no="ICR-100",
            reminder_date=date(2024, 4, 15),
            reminder_text="Check status",
            notes="Important execution",
            haciz_durumu="Haciz yapildi",
            responsible_person="Av.Ibrahim Bey",
            görevlendiren="Av.M.Serif Bey"
        )
        assert execution.haciz_durumu == "Haciz yapildi"
        assert execution.görevlendiren == "Av.M.Serif Bey"

    def test_execution_update_model(self):
        from app.main import ExecutionUpdate
        update = ExecutionUpdate(status="Kapatildi", version=5)
        assert update.status == "Kapatildi"
        assert update.defendant is None

    def test_execution_model_complete(self):
        from app.main import Execution
        now = datetime.now()
        execution = Execution(
            id="exec-1",
            client_id="c1",
            client_name="Client",
            defendant="Def",
            execution_office="Office",
            execution_number="2024/1",
            status="Active",
            execution_type="Type",
            start_date=date.today(),
            office_archive_no="A1",
            created_at=now,
            updated_at=now,
            version=1
        )
        assert execution.id == "exec-1"


class TestConnectionManager:
    """Tests for WebSocket connection manager."""

    def test_connection_manager_init(self):
        from app.main import ConnectionManager
        cm = ConnectionManager()
        assert len(cm.active_connections) == 0

    def test_make_serializable_with_dict(self):
        from app.main import ConnectionManager
        cm = ConnectionManager()
        data = {"key": "value", "number": 42}
        result = cm._make_serializable(data)
        assert result == {"key": "value", "number": 42}

    def test_make_serializable_with_datetime(self):
        from app.main import ConnectionManager
        cm = ConnectionManager()
        now = datetime(2024, 6, 15, 10, 30, 0)
        result = cm._make_serializable(now)
        assert result == "2024-06-15T10:30:00"

    def test_make_serializable_with_date(self):
        from app.main import ConnectionManager
        cm = ConnectionManager()
        d = date(2024, 6, 15)
        result = cm._make_serializable(d)
        assert result == "2024-06-15"

    def test_make_serializable_with_nested_dict(self):
        from app.main import ConnectionManager
        cm = ConnectionManager()
        data = {
            "name": "Test",
            "created_at": datetime(2024, 1, 1, 12, 0, 0),
            "items": [date(2024, 6, 15), "text"]
        }
        result = cm._make_serializable(data)
        assert result["created_at"] == "2024-01-01T12:00:00"
        assert result["items"][0] == "2024-06-15"
        assert result["items"][1] == "text"

    def test_make_serializable_with_list(self):
        from app.main import ConnectionManager
        cm = ConnectionManager()
        data = [1, "two", date(2024, 1, 1)]
        result = cm._make_serializable(data)
        assert result == [1, "two", "2024-01-01"]


class TestDbToPydanticConverters:
    """Tests for database-to-pydantic conversion functions."""

    def test_db_to_pydantic_client(self):
        from app.main import db_to_pydantic_client
        mock_db_client = MagicMock()
        mock_db_client.id = "c1"
        mock_db_client.name = "Test Client"
        mock_db_client.email = "test@test.com"
        mock_db_client.phone = "555-0100"
        mock_db_client.address = "Test Address"
        mock_db_client.tax_id = "TX1"
        mock_db_client.vekalet_ofis_no = "VK1"
        mock_db_client.created_at = datetime(2024, 1, 1)
        mock_db_client.updated_at = datetime(2024, 6, 1)
        mock_db_client.version = 1

        result = db_to_pydantic_client(mock_db_client)
        assert result.id == "c1"
        assert result.name == "Test Client"
        assert result.tax_id == "TX1"

    def test_db_to_pydantic_case(self):
        from app.main import db_to_pydantic_case
        mock_db_case = MagicMock()
        mock_db_case.id = "case-1"
        mock_db_case.title = "Test Case"
        mock_db_case.case_name = "Named Case"
        mock_db_case.description = "Desc"
        mock_db_case.client_id = "c1"
        mock_db_case.client_name = "Client"
        mock_db_case.case_type = "Hukuk"
        mock_db_case.status = "Derdest"
        mock_db_case.court = "Court"
        mock_db_case.case_number = "2024/1"
        mock_db_case.defendant = "Def"
        mock_db_case.notes = "Notes"
        mock_db_case.start_date = date(2024, 1, 1)
        mock_db_case.next_hearing_date = date(2024, 7, 1)
        mock_db_case.reminder_date = date(2024, 6, 28)
        mock_db_case.office_archive_no = "A1"
        mock_db_case.responsible_person = "RP"
        mock_db_case.görevlendiren = "GV"
        mock_db_case.created_at = datetime(2024, 1, 1)
        mock_db_case.updated_at = datetime(2024, 6, 1)
        mock_db_case.version = 2

        result = db_to_pydantic_case(mock_db_case)
        assert result.id == "case-1"
        assert result.case_name == "Named Case"
        assert result.görevlendiren == "GV"

    def test_db_to_pydantic_execution(self):
        from app.main import db_to_pydantic_execution
        mock = MagicMock()
        mock.id = "exec-1"
        mock.client_id = "c1"
        mock.client_name = "Client"
        mock.defendant = "Def"
        mock.execution_office = "Office"
        mock.execution_number = "2024/ICR-1"
        mock.status = "Active"
        mock.execution_type = "Ilamsiz"
        mock.start_date = date(2024, 1, 1)
        mock.office_archive_no = "A1"
        mock.reminder_date = None
        mock.reminder_text = None
        mock.notes = None
        mock.haciz_durumu = None
        mock.responsible_person = None
        mock.görevlendiren = None
        mock.created_at = datetime(2024, 1, 1)
        mock.updated_at = datetime(2024, 6, 1)
        mock.version = 1

        result = db_to_pydantic_execution(mock)
        assert result.id == "exec-1"
        assert result.execution_type == "Ilamsiz"

    def test_db_to_pydantic_compensation_letter(self):
        from app.main import db_to_pydantic_compensation_letter
        mock = MagicMock()
        mock.id = "lt-1"
        mock.title = "TM"
        mock.client_id = "c1"
        mock.client_name = "Client"
        mock.letter_number = "TM-001"
        mock.bank = "Bank"
        mock.customer_number = "CN"
        mock.customer = "Cust"
        mock.court = "Court"
        mock.case_number = "2024/1"
        mock.status = "Aktif"
        mock.description_text = None
        mock.reminder_date = None
        mock.reminder_text = None
        mock.responsible_person = None
        mock.görevlendiren = None
        mock.created_at = datetime(2024, 1, 1)
        mock.updated_at = datetime(2024, 6, 1)
        mock.version = 1

        result = db_to_pydantic_compensation_letter(mock)
        assert result.id == "lt-1"
        assert result.letter_number == "TM-001"


class TestCaseSearchParams:
    """Tests for CaseSearchParams model."""

    def test_search_params_all_none(self):
        from app.main import CaseSearchParams
        params = CaseSearchParams()
        assert params.case_type is None
        assert params.status is None
        assert params.court is None

    def test_search_params_with_values(self):
        from app.main import CaseSearchParams
        params = CaseSearchParams(
            case_type="Hukuk",
            status="Derdest",
            court="Istanbul",
            client_id="c1",
            defendant="Def"
        )
        assert params.case_type == "Hukuk"
        assert params.defendant == "Def"


class TestHealthEndpoints:
    """Tests for health check endpoints."""

    @pytest.mark.asyncio
    async def test_healthz(self):
        from app.main import healthz
        result = await healthz()
        assert result == {"status": "ok"}

    @pytest.mark.asyncio
    async def test_api_health(self):
        from app.main import api_health
        result = await api_health()
        assert result["status"] == "ok"
        assert result["service"] == "api"
        assert "timestamp" in result

    @pytest.mark.asyncio
    async def test_ws_health(self):
        from app.main import ws_health
        result = await ws_health()
        assert result["status"] == "ok"
        assert result["websocket"] == "active"
        assert "active_connections" in result
        assert "total_users" in result
