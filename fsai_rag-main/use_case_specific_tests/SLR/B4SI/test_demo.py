from unittest.mock import AsyncMock, patch

import pytest

from fsai_rag.utils.database_schemas import StatusType
from use_case_specific.SLR.B4SI.demo import demo


class TestDemo:
    @pytest.fixture
    def mock_tune_knowledge_base(self):
        """Mock the long-running tune_knowledge_base function."""
        with patch("use_case_specific.SLR.B4SI.demo.tune_knowledge_base") as mock:
            mock.return_value = ({"chunk_size": 10000}, 0.85)  # Simplified mock return
            yield mock

    @pytest.fixture
    def mock_db_manager(self):
        """Mock the database manager."""
        with patch("use_case_specific.SLR.B4SI.demo.get_db_manager") as mock:
            mock_db = AsyncMock()
            mock.return_value = mock_db
            yield mock_db

    def test_demo_success_path(self, mock_tune_knowledge_base, mock_db_manager):
        """Test the happy path - successful execution."""
        result = demo(["dummy.txt"], "test_table", "test_123")

        # Verify tune_knowledge_base was called
        mock_tune_knowledge_base.assert_called_once()

        # Verify database was updated with success
        mock_db_manager.update.assert_called_once_with(
            "test_table", "test_123", StatusType.SUCCEEDED
        )

        # Verify return value
        assert isinstance(result, tuple)
        assert len(result) == 2

    def test_demo_error_path(self, mock_tune_knowledge_base, mock_db_manager):
        """Test error handling path."""
        mock_tune_knowledge_base.side_effect = Exception("Tuning failed")

        with pytest.raises(Exception):
            demo(["dummy.txt"], "test_table", "test_123")

        # Verify database was updated with failure
        mock_db_manager.update.assert_called_once_with(
            "test_table", "test_123", StatusType.FAILED
        )
