import pytest
import os
from unittest.mock import patch, MagicMock
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

def test_database_url_required():
    """Test that DATABASE_URL environment variable is required"""
    with patch.dict(os.environ, {}, clear=True):
        with pytest.raises(ValueError, match="DATABASE_URL environment variable is required"):
            import app.database

def test_database_url_must_be_postgresql():
    """Test that DATABASE_URL must be a PostgreSQL connection string"""
    invalid_urls = [
        "sqlite:///test.db",
        "mysql://user:pass@host/db", 
        "mongodb://host/db",
        "redis://host:6379",
        "http://example.com"
    ]
    
    for invalid_url in invalid_urls:
        with patch.dict(os.environ, {"DATABASE_URL": invalid_url}):
            with pytest.raises(ValueError, match="DATABASE_URL must be a PostgreSQL connection string"):
                if 'app.database' in sys.modules:
                    del sys.modules['app.database']
                import app.database

def test_valid_postgresql_urls():
    """Test that valid PostgreSQL URLs are accepted"""
    valid_urls = [
        "postgresql://user:pass@host:5432/db",
        "postgres://user:pass@host:5432/db",
        "postgresql://user@host/db",
        "postgres://user@host/db"
    ]
    
    for valid_url in valid_urls:
        with patch.dict(os.environ, {"DATABASE_URL": valid_url}):
            with patch('sqlalchemy.create_engine') as mock_engine:
                if 'app.database' in sys.modules:
                    del sys.modules['app.database']
                import app.database
                assert True

def test_postgres_url_conversion():
    """Test that postgres:// URLs are converted to postgresql://"""
    with patch.dict(os.environ, {"DATABASE_URL": "postgres://user:pass@host:5432/db"}):
        with patch('sqlalchemy.create_engine') as mock_engine:
            if 'app.database' in sys.modules:
                del sys.modules['app.database']
            import app.database
            
            mock_engine.assert_called_once()
            called_url = mock_engine.call_args[0][0]
            assert called_url.startswith("postgresql://")
            assert "user:pass@host:5432/db" in called_url
