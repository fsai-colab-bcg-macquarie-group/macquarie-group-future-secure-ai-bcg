import pandas as pd
import pytest
from sqlalchemy.exc import ProgrammingError

from fsai_rag.utils.sql_connection import get_engine
from use_case_specific.SLR.B4SI.get_llamaindex_documents_msg import (
    GetLlamaIndexDocumentsEnum,
    get_llamaindex_documents,
)


def _check_qna_exists() -> bool:
    engine = get_engine()

    try:
        dfr = pd.read_sql("SELECT * FROM b4si_qnas LIMIT 10", engine)
        return not dfr.empty
    except ProgrammingError as e:
        print(e)
        return False


def test_get_llamaindex_documents():

    if not _check_qna_exists():
        pytest.skip("No QNA data found")

    else:

        qn_docs = get_llamaindex_documents(
            qa_bank="emails",
            question_or_answer=GetLlamaIndexDocumentsEnum.QUESTION,
        )

        ans_docs = get_llamaindex_documents(
            qa_bank="emails",
            question_or_answer=GetLlamaIndexDocumentsEnum.ANSWER,
        )

        assert len(qn_docs) == len(ans_docs)
