import os
import sys
import uuid
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, File, HTTPException, UploadFile

from fsai_rag.utils.config import settings
from fsai_rag.utils.database_manager import get_db_manager
from fsai_rag.utils.database_schemas import StatusType
from fsai_rag.utils.logger import logger
from use_case_specific.SLR.B4SI.demo import demo

UPLOAD_DIR = settings.UPLOAD_DIR  # Directory to save uploaded files
MAX_WORKERS = settings.MAX_WORKERS  # Number of workers to process files


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    db_manager = await get_db_manager()
    logger.info(f"Database manager initialized with {MAX_WORKERS} workers")
    yield
    # Shutdown
    logger.info("Disconnecting from database manager")
    await db_manager.close()


app = FastAPI(lifespan=lifespan)
executor = ThreadPoolExecutor(max_workers=5)  # Adjust max_workers as needed


@app.post("/demo")
async def run_demo(
    table_name: str, n_trials: int = 30, files: List[UploadFile] = File(...)
):
    try:
        # Validate and save files
        saved_files = []
        for file in files:
            if not file.filename.endswith(".txt"):
                raise HTTPException(
                    status_code=400, detail=f"File {file.filename} is not a .txt file"
                )

            file_path = os.path.join(UPLOAD_DIR, file.filename)

            content = await file.read()
            with open(file_path, "wb") as buffer:
                buffer.write(content)
            saved_files.append(file_path)

        job_id = str(uuid.uuid4())

        table_name = table_name.upper().strip("'\"")

        db_manager = await get_db_manager()

        await db_manager.insert(table_name, job_id, saved_files, n_trials)
        executor.submit(demo, saved_files, table_name, job_id, n_trials)
        await db_manager.update(table_name, job_id, StatusType.STARTED)

        return {
            "message": "Files received and processing started",
            "job_id": job_id,
            "status_code": 200,
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
