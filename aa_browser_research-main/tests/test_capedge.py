import logging
import os

import pytest
from browser_use import Agent, Browser, BrowserConfig
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

from aa_browser_research.controller import controller

load_dotenv()
logging.basicConfig(level=logging.INFO)

CAPEDGE_EMAIL = os.getenv("CAPEDGE_EMAIL")
CAPEDGE_PASSWORD = os.getenv("CAPEDGE_PASSWORD")

TASK = f"""
Navigate to https://capedge.com/user/signin.
Enter email "{{email}}" and password "{{password}}".
Solve the reCAPTCHA using the Handle reCAPTCHA action.
After solving Captcha, Click the Log In button using the click action.
When in the dashboard, go to the Alert Feed and click on the first alert (not including external links with the external link icon, or Reddit such as r/subreddit_name).
Summarise the alert and return the summary in a structured JSON format as follows:
{{
    "title": "<alert title>",
    "description": "<alert description>",
    "link": "<link to the alert>"
}}
"""


@pytest.mark.asyncio
async def test_capedge_login():
    config = BrowserConfig(headless=False, disable_security=True)
    browser = Browser(config=config)
    llm = ChatOpenAI(model="gpt-4.1", temperature=0)
    planner = ChatOpenAI(model="o4-mini")

    agent = Agent(
        task=TASK,
        llm=llm,
        planner_llm=planner,
        use_vision=True,
        controller=controller,
        browser=browser,
        sensitive_data={"email": CAPEDGE_EMAIL, "password": CAPEDGE_PASSWORD},
    )

    try:
        result = await agent.run()
    finally:
        await browser.close()
