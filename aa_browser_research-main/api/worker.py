import os

from celery import Celery

redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")

celery_app = Celery(
    "browser_use_worker",
    broker=redis_url,
    backend=redis_url,
    include=["api.tasks"],  # auto‑register run_agent
)

# Optional – tune Celery so long browser jobs don't die
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    task_soft_time_limit=900,  # 15 minutes
    task_time_limit=1200,  # hard kill at 20 min
    worker_redirect_stdouts=True,
    worker_redirect_stdouts_level="INFO",
)
