# api/main.py
import json
import logging
import uuid

from celery.result import AsyncResult
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from starlette.background import BackgroundTasks

from .tasks import run_agent
from .worker import celery_app

log = logging.getLogger(__name__)
app = FastAPI(title="Browser‑Use Runner")


class LLMCfg(BaseModel):
    model: str = "gpt-4.1"
    temperature: float = 0.0


class BrowserCfg(BaseModel):
    headless: bool = True
    disable_security: bool = True


class RunRequest(BaseModel):
    task_template: str = Field(..., description="Prompt with {{macros}}")
    secrets: dict = Field(..., description="Values only the browser should see")
    llm: LLMCfg = LLMCfg()
    planner_llm: LLMCfg = LLMCfg(model="o4-mini")
    browser: BrowserCfg = BrowserCfg()


class RunResponse(BaseModel):
    job_id: str


class ResultResponse(BaseModel):
    status: str
    output: dict | None = None
    error: str | None = None


# ---------- API routes ---------- #
@app.post("/run", response_model=RunResponse, status_code=202)
def run(req: RunRequest):
    job_id = str(uuid.uuid4())
    # Launch celery task asynchronously
    run_agent.apply_async(args=[req.dict()], task_id=job_id)
    return RunResponse(job_id=job_id)


@app.get("/result/{job_id}", response_model=ResultResponse)
def result(job_id: str):
    res = AsyncResult(job_id, app=celery_app)

    if res.state in ("PENDING", "STARTED"):
        return ResultResponse(status=res.state)

    if res.state == "FAILURE":
        return ResultResponse(status="ERROR", error=str(res.result))

    raw = res.result

    summary: dict | str | None
    if isinstance(raw, list) and raw:
        last = raw[-1]
        if isinstance(last, str):
            try:
                summary = json.loads(last)
            except json.JSONDecodeError:
                log.warning("Could not JSON-parse final result: %r", last)
                summary = {"raw": last}
        else:
            summary = last
    else:
        summary = raw

    if not isinstance(summary, dict):
        summary = {"result": summary}

    return ResultResponse(status="SUCCESS", output=summary)


@app.get("/logs/{job_id}")
def get_logs(job_id: str):
    import os

    import redis  # type: ignore[import]

    url = os.getenv("REDIS_URL", "redis://redis:6379/0")
    r = redis.from_url(url)
    key = f"logs:{job_id}"
    # raw = r.lrange(key, 0, 49)
    raw = r.lrange(key, 0, -1)
    logs = [line.decode("utf-8") for line in raw][::-1]
    if not logs:
        raise HTTPException(404, detail="No logs found for that job_id")
    return {"job_id": job_id, "logs": logs}


@app.get("/healthz")
def health():
    return {"status": "ok"}
