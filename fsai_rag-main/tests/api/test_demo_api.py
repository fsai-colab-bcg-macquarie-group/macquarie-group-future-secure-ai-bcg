from unittest.mock import AsyncMock, MagicMock, mock_open, patch

import pytest
from fastapi.testclient import TestClient

from api.demo_api import app


@pytest.mark.asyncio
async def test_run_demo():
    client = TestClient(app)
    files = [
        ("files", ("test1.txt", b"test1 content", "text/plain")),
        ("files", ("test2.txt", b"test2 content", "text/plain")),
    ]

    # Create a mock for the database manager
    mock_db_manager = AsyncMock()
    mock_db_manager.insert = AsyncMock()
    mock_db_manager.update = AsyncMock()

    # Mock file operations
    mock_file = mock_open()

    # Mock the executor.submit method
    mock_submit = MagicMock()

    # Mock os.makedirs
    mock_makedirs = MagicMock()

    with patch("api.demo_api.get_db_manager", return_value=mock_db_manager), patch(
        "builtins.open", mock_file
    ), patch("api.demo_api.executor.submit", mock_submit), patch(
        "os.path.join", return_value="/mocked/path/to/file.txt"
    ), patch(
        "api.demo_api.demo"
    ) as mock_demo, patch(
        "os.makedirs", mock_makedirs
    ):

        response = client.post("/demo?table_name=TEST_TABLE&n_trials=10", files=files)

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Files received and processing started"
    assert data["job_id"] is not None

    mock_db_manager.insert.assert_called_once()
    mock_db_manager.update.assert_called_once()

    mock_makedirs.assert_called()
    mock_submit.assert_called_once()
    assert mock_submit.call_args[0][0] == mock_demo

    args, _ = mock_db_manager.insert.call_args
    assert args[0] == "TEST_TABLE"
    assert len(args[2]) == 2  # number of files
