import asyncio
import builtins
import json
import logging
import sys
from typing import Any

from browser_use import Agent, Browser, BrowserConfig
from browser_use.agent.service import AgentHistoryList
from langchain_openai import ChatOpenAI

from aa_browser_research.controller import controller

from .logging_handler import RedisLogHandler
from .worker import celery_app

openai_logger = logging.getLogger("openai._base_client")
openai_logger.handlers.clear()  # remove its own handler(s)
openai_logger.propagate = False  # don’t bubble up to root
openai_logger.setLevel(logging.INFO)  # or WARNING to keep errors only

log = logging.getLogger(__name__)

_old_print = builtins.print


def _print_to_logger(*args, **kwargs):
    # mirror to logger
    logging.getLogger().info(" ".join(str(a) for a in args))
    # still print to the original stdout if you like:
    _old_print(*args, **kwargs)


builtins.print = _print_to_logger


def _extract(agent_result):
    """Flatten Browser‑use result → dict"""
    if hasattr(agent_result, "extracted_content"):
        raw = agent_result.extracted_content()
    elif isinstance(agent_result, AgentHistoryList):
        raw = agent_result[-1].extracted_content
    else:
        raw = agent_result
    if isinstance(raw, str):
        return json.loads(raw)
    return raw


@celery_app.task(bind=True)
def run_agent(self, req_dict: dict):
    job_id = self.request.id

    # 1) Create & attach a single Redis handler at DEBUG
    handler = RedisLogHandler(job_id)
    handler.setLevel(logging.DEBUG)
    handler.setFormatter(
        logging.Formatter("[%(asctime)s] %(name)s %(levelname)s: %(message)s")
    )
    console = logging.StreamHandler(sys.stdout)
    console.setLevel(logging.DEBUG)
    console.setFormatter(
        logging.Formatter("[%(asctime)s] %(name)s %(levelname)s: %(message)s")
    )

    root = logging.getLogger()
    root.setLevel(logging.DEBUG)  # ensure root emits DEBUG+
    root.addHandler(handler)
    root.addHandler(console)
    # 2) Force all existing loggers to propagate up to the root
    for name, logger in logging.root.manager.loggerDict.items():
        if isinstance(logger, logging.Logger):
            logger.propagate = True
            logger.setLevel(logging.DEBUG)

    old_print = builtins.print

    # builtins.print = lambda *args, **kwargs: root.info(
    #     " ".join(map(str, args))
    # ) or old_print(*args, **kwargs)
    def _print_shim(*args: object, **kwargs: Any) -> None:
        root.info(" ".join(str(a) for a in args))
        old_print(*args, **kwargs)

    builtins.print = _print_shim
    # 4) Early marker
    root.info(f"Task received for job {job_id}")

    try:
        # 5) Run your async agent
        return asyncio.run(_run_agent_async(req_dict))
    finally:
        # 6) Teardown: restore print, log end, detach handler
        builtins.print = old_print
        root.info(f"Ending job {job_id}")
        root.removeHandler(handler)
        root.removeHandler(console)


async def _run_agent_async(req_dict):
    cfg = req_dict
    # 1) Render task with placeholders preserved (LLM sees {{...}})
    task = cfg["task_template"]

    # 2) Build agent
    browser = Browser(config=BrowserConfig(**cfg["browser"].copy()))
    llm = ChatOpenAI(**cfg["llm"])
    planner = ChatOpenAI(**cfg["planner_llm"])

    agent = Agent(
        task=task,
        llm=llm,
        planner_llm=planner,
        browser=browser,
        controller=controller,
        use_vision=True,
        sensitive_data=cfg["secrets"],
        planner_interval=4,
    )

    try:
        result = await agent.run()
        return _extract(result)
    finally:
        await browser.close()
