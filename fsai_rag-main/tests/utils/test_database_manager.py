from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession
from sqlalchemy.sql import text

from fsai_rag.utils.config import Settings
from fsai_rag.utils.database_manager import DatabaseManager, get_db_manager
from fsai_rag.utils.database_schemas import SchemaType, StatusType


@pytest.fixture
def mock_settings():
    return MagicMock(spec=Settings)


@pytest.fixture
def mock_engine():
    return AsyncMock(spec=AsyncEngine)


@pytest.fixture
async def db_manager(mock_settings, mock_engine):
    # Configure mock_settings with expected attributes
    mock_settings.DB_USER = "test_user"
    mock_settings.DB_PASSWORD = "test_password"
    mock_settings.DB_HOST = "test_host"
    mock_settings.DB_PORT = "test_port"
    mock_settings.DB_NAME = "test_db"

    with patch(
        "fsai_rag.utils.database_manager.get_settings", return_value=mock_settings
    ):
        with patch(
            "fsai_rag.utils.database_manager.create_async_engine",
            return_value=mock_engine,
        ):
            manager = DatabaseManager()
            manager.engine.connect = AsyncMock()
            yield manager


@pytest.mark.asyncio
async def test_initialise(db_manager):
    db_manager.create_status_type = AsyncMock()
    await db_manager.initialise()
    db_manager.engine.connect.assert_called_once()
    db_manager.create_status_type.assert_called_once()


@pytest.mark.asyncio
async def test_create_status_type(db_manager):
    db_manager.create_database_if_not_exists = AsyncMock()
    mock_conn = AsyncMock()
    mock_begin = AsyncMock()
    mock_begin.__aenter__.return_value = mock_conn
    db_manager.engine.begin.return_value = mock_begin

    sql = "CREATE TYPE status_type AS ENUM ('PENDING', 'COMPLETED', 'FAILED')"
    with patch("fsai_rag.utils.database_schemas.get_schema", return_value=sql):
        await db_manager.create_status_type()

        mock_conn.execute.assert_called_once()


@pytest.mark.asyncio
async def test_insert(db_manager):
    db_manager.create_table_if_not_exists = AsyncMock()

    with patch("fsai_rag.utils.database_manager.AsyncSession") as MockAsyncSession:
        mock_session = AsyncMock(spec=AsyncSession)
        MockAsyncSession.return_value.__aenter__.return_value = mock_session

        mock_stream = AsyncMock()
        mock_session.stream = mock_stream

        await db_manager.insert("test_table", "job123", ["file1.txt", "file2.txt"], 3)

        db_manager.create_table_if_not_exists.assert_called_once_with("test_table")
        mock_session.stream.assert_called_once()


@pytest.mark.asyncio
async def test_update(db_manager):
    with patch("fsai_rag.utils.database_manager.AsyncSession") as MockAsyncSession:
        mock_session = AsyncMock(spec=AsyncSession)
        MockAsyncSession.return_value.__aenter__.return_value = mock_session

        mock_stream = AsyncMock()
        mock_session.stream = mock_stream

        await db_manager.update("test_table", "job123", StatusType.SUCCEEDED)

        mock_session.stream.assert_called_once()


@pytest.mark.asyncio
async def test_get(db_manager):
    with patch("fsai_rag.utils.database_manager.AsyncSession") as MockAsyncSession:
        mock_session = AsyncMock(spec=AsyncSession)
        MockAsyncSession.return_value.__aenter__.return_value = mock_session

        mock_result = AsyncMock()
        mock_stream = AsyncMock()
        mock_session.stream = mock_stream
        mock_stream.return_value = mock_result

        await db_manager.get("test_table", "job123")

        mock_session.stream.assert_called_once()
        mock_result.fetchall.assert_called_once()


@pytest.mark.asyncio
async def test_delete(db_manager):

    with patch("fsai_rag.utils.database_manager.AsyncSession") as MockAsyncSession:
        mock_session = AsyncMock(spec=AsyncSession)
        MockAsyncSession.return_value.__aenter__.return_value = mock_session

        mock_stream = AsyncMock()
        mock_session.stream = mock_stream

        await db_manager.delete("test_table", "job123")

        mock_session.stream.assert_called_once()


@pytest.mark.asyncio
async def test_close(db_manager):
    await db_manager.close()
    db_manager.engine.dispose.assert_called_once()


@pytest.mark.asyncio
async def test_get_db_manager():
    with patch("fsai_rag.utils.database_manager.DatabaseManager") as mock_db_manager:
        mock_instance = AsyncMock()
        mock_db_manager.return_value = mock_instance

        manager1 = await get_db_manager()
        manager2 = await get_db_manager()

        assert manager1 == manager2
        mock_db_manager.assert_called_once()
        mock_instance.initialise.assert_called_once()
