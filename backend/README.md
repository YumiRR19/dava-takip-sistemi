# LexCloud Backend

FastAPI backend for the LexCloud case tracking system (Dava Takip Sistemi).

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Authentication**: JWT (PyJWT)
- **Python**: 3.12+

## Features

- JWT-based authentication with password management
- CRUD operations for Clients, Cases, Executions, and Compensation Letters
- Real-time updates via WebSocket connections
- Dashboard with reminder system
- Reports & Analytics API with status distributions, monthly trends, and responsible person breakdown
- Backup and restore functionality
- Health check endpoints for API, database, and WebSocket monitoring
- Optimistic concurrency control with version fields
- Soft delete support across all entities
- GZip compression middleware

## API Endpoints

### Authentication
- `POST /api/login` - Login with password
- `POST /api/logout` - Logout
- `POST /api/change-password` - Change admin password

### Clients
- `GET /api/clients` - List all clients
- `GET /api/clients/{id}` - Get client by ID
- `POST /api/clients` - Create new client
- `PUT /api/clients/{id}` - Update client
- `DELETE /api/clients/{id}` - Delete client (soft delete)

### Cases
- `GET /api/cases` - List cases with filtering (status, client, responsible person)
- `GET /api/cases/{id}` - Get case by ID
- `POST /api/cases` - Create new case
- `PUT /api/cases/{id}` - Update case
- `DELETE /api/cases/{id}` - Delete case (soft delete)
- `GET /api/cases/search` - Search cases with advanced filters

### Executions
- `GET /api/executions` - List executions with filtering
- `GET /api/executions/{id}` - Get execution by ID
- `POST /api/executions` - Create new execution
- `PUT /api/executions/{id}` - Update execution
- `DELETE /api/executions/{id}` - Delete execution (soft delete)

### Compensation Letters
- `GET /api/compensation-letters` - List compensation letters
- `GET /api/compensation-letters/{id}` - Get letter by ID
- `POST /api/compensation-letters` - Create new letter
- `PUT /api/compensation-letters/{id}` - Update letter
- `DELETE /api/compensation-letters/{id}` - Delete letter (soft delete)

### Dashboard & Reports
- `GET /api/dashboard` - Dashboard data with reminders
- `GET /api/reports` - Analytics data (status counts, monthly trends, distributions)

### Backup & Restore
- `GET /api/backup` - Export all data as JSON
- `POST /api/restore` - Restore data from JSON backup

### Health Checks
- `GET /healthz` - Basic health check
- `GET /health/api` - API health
- `GET /health/db` - Database health
- `GET /health/ws` - WebSocket health
- `GET /health/backup` - Backup health

### WebSocket
- `WS /ws/{token}` - Real-time data change notifications

## Setup

### Prerequisites
- Python 3.12+
- PostgreSQL database
- Poetry package manager

### Environment Variables
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
ADMIN_PASSWORD=your_admin_password
JWT_SECRET=your_jwt_secret_key
```

### Installation
```bash
# Install dependencies
poetry install

# Run the server
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Running Tests
```bash
poetry run pytest tests/ -v
```

## Project Structure
```
backend/
  app/
    __init__.py
    database.py      # SQLAlchemy models and database configuration
    main.py          # FastAPI application with all routes
  tests/
    test_api.py              # Comprehensive API tests
    test_database_config.py  # Database configuration tests
  alembic/           # Database migrations
  pyproject.toml     # Python dependencies
  Dockerfile         # Container configuration
  fly.toml           # Fly.io deployment configuration
```
