import asyncio
import os
from typing import Any, Dict, List

from fsai_rag.utils.database_manager import get_db_manager
from fsai_rag.utils.database_schemas import StatusType
from fsai_rag.utils.logger import logger
from use_case_specific.SLR.B4SI.tune_b4si_knowledge_base import tune_knowledge_base


def demo(
    files: List[str], table_name: str, job_id: str, n_trials: int = 30
) -> tuple[Dict[str, Any], float]:
    """Run knowledge base tuning process and update status."""
    logger.info(
        f"Starting job {job_id} with: files={files}, table={table_name}, trials={n_trials}"
    )

    try:
        result = tune_knowledge_base(
            files=files,
            table_name=table_name,
            job_id=job_id,
            n_trials=n_trials,
            ragas_testset_tbl_name="b4si_ragas_testset",
        )
        # Update status in database
        loop = asyncio.new_event_loop()
        db_manager = loop.run_until_complete(get_db_manager())
        loop.run_until_complete(
            db_manager.update(table_name, job_id, StatusType.SUCCEEDED)
        )
        loop.close()
        return result

    except Exception as e:
        logger.error(f"Error in tuning: {e}")
        # Update status in database
        loop = asyncio.new_event_loop()
        db_manager = loop.run_until_complete(get_db_manager())
        loop.run_until_complete(
            db_manager.update(table_name, job_id, StatusType.FAILED)
        )
        loop.close()
        raise


if __name__ == "__main__":
    POLICY_FILES = [
        os.path.join("data", "b4si", "docx", "TXT", "B4SI BI Guidance Manual.txt"),
        os.path.join("data", "b4si", "docx", "TXT", "B4SI CI Guidance Manual.txt"),
    ]
    demo(POLICY_FILES, "table_name", "job_id", 30)
