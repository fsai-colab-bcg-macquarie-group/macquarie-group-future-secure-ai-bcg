# api/logging_handler.py
import logging
import os
import re

import redis  # type: ignore[import]


class JobLogFilter(logging.Filter):
    _emoji_re = re.compile(
        "["  # any emoji
        "\U0001F300-\U0001F5FF"
        "\U0001F600-\U0001F64F"
        "\U0001F680-\U0001F6FF"
        "\u2600-\u26FF"
        "\u2700-\u27BF"
        "]"
    )

    def filter(self, record: logging.LogRecord) -> bool:
        raw = record.getMessage()

        # 1) Drop the original OpenAI DEBUG messages
        if record.name == "openai._base_client":
            return False

        # 2) Drop the Celery‑echo lines that *contain* the OpenAI prefix
        if record.name == "celery.redirected" and "openai._base_client" in raw:
            return False

        # 3) Keep only messages that contain at least one emoji
        return bool(self._emoji_re.search(raw))


class RedisLogHandler(logging.Handler):
    def __init__(self, job_id: str):
        super().__init__()
        self.job_id = job_id
        url = os.getenv("REDIS_URL", "redis://redis:6379/0")
        self.redis = redis.from_url(url)
        self.addFilter(JobLogFilter())

    def emit(self, record: logging.LogRecord):
        msg = self.format(record)
        key = f"logs:{self.job_id}"
        self.redis.rpush(key, msg)
