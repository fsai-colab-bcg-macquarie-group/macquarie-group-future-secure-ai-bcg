import pandas as pd

from fsai_rag.utils.sql_connection import get_engine


class TestSqlConnection:
    def test_get_engine(self):
        engine = get_engine()
        df = pd.read_sql("SELECT 1", engine)
        assert df is not None
        assert df.shape == (1, 1)
