import asyncio
import json
import logging
import os

from browser_use import Agent, Browser, BrowserConfig
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from playwright.async_api import async_playwright

load_dotenv()
logger = logging.getLogger()

# Load environment variables
yahoo_email = os.getenv("YAHOO_EMAIL")
yahoo_password = os.getenv("YAHOO_PASSWORD")

# Define the task
TASK = """
    ### Prompt for visiting Yahoo Finance, searching for stocks, following and adding stocks to new and existing watchlists

    **Objective:**
    Visit [Yahoo Finance](https://au.finance.yahoo.com), sign in. Search for the following 3 stocks: CBA, NVDA, VOO. Add them to the watchlist.

    **Important:**
    - Make sure that you successfully login.
    - Make sure that you correctly enter the stock tickers into the search.
    - Make sure that you correctly follow the searched stock ticker and add it to the correct watchlist.
    - If a ticker is from the Australian stock market, it should be added to the Australian watchlist.
    - If you encounter an "I'm not a robot" captcha, click on the tick box next to it and click continue.
    - If a ticker is from the US stock market, it should be added to the US watchlist.
    - If a watchlist does not exist, create a new watchlist, i.e. "Australian watchlist" or "US watchlist".
    - If a watchlist already exists, add the stock to the existing watchlist.
    - Do not add stocks to 'My Watchlist', only to the Australian watchlist or US watchlist.
    - If a pop up appears about 'Yahoo Finance is now available in dark mode', click on the green 'OK' button.
    - If you see a '500' error, refresh the page.
    - If a stock ticker is checked in a watchlist that it is not supposed to be in, uncheck it, such as an Australian stock ticker in the US watchlist and vice versa.
    ---

    ### Step 1: Login to Yahoo Finance
    - Open [Yahoo Finance](https://au.finance.yahoo.com).
    - Click on the 'Sign in' button on the top right.
    - Enter the following email in the email input field: {0}.
    - Click on the "Next" button.
    - If you encounter an "I'm not a robot" captcha, click on the tick box next to it and click continue.
    - Enter the following password in the password input field: {1}.
    - Click on the "Next" button.
    - If the page asks you to Sign in with your fingerprint or code, click on the 'Not now' text.
    - Wait for the main dashboard page to load.
    ---

    ### Step 2: Search for the CBA stock ticker
    - In the search bar, enter the stock ticker "CBA".
    - Click on the button with the search icon.
    - Wait for the stock page to load.
    - Click on the "Follow" button.
    - Add to the appropriate watchlist if exists. For example, if this stock ticker is Australian, add it to the Australian watchlist by clicking on the check box next to the watchlist name.
    - If the watchlist does not exist, create a new watchlist by clicking on the "Create new" button and entering the name "Australian watchlist" or "US watchlist".
    - Once the checkbox is selected, click on the search bar again.
    ---

    ### Step 3: Search for the NVDA stock ticker
    - In the search bar, enter the stock ticker "NVDA".
    - Click on the button with the search icon.
    - Wait for the stock page to load.
    - Click on the "Follow" button.
    - Add to the appropriate watchlist if exists. For example, if this stock ticker is Australian, add it to the Australian watchlist by clicking on the check box next to the watchlist name.
    - If the watchlist does not exist, create a new watchlist by clicking on the "Create new" button and entering the name "Australian watchlist" or "US watchlist".
    - Once the checkbox is selected, click on the search bar again.
    ---

    ### Step 4: Search for the VOO stock ticker
    - In the search bar, enter the stock ticker "VOO".
    - Click on the button with the search icon.
    - Wait for the stock page to load.
    - Click on the "Follow" button.
    - Add to the appropriate watchlist if exists. For example, if this stock ticker is Australian, add it to the Australian watchlist by clicking on the check box next to the watchlist name.
    - If the watchlist does not exist, create a new watchlist by clicking on the "Create new" button and entering the name "Australian watchlist" or "US watchlist".
    - Once the checkbox is selected, click on the 'My Portfolios' button.
    ---

    ### Step 5: Return results
    - For each stock ticker, return a json including each stock ticker, company name, the date, today's price, change in price.
    - Ensure that the date is in the format YYYY-MM-DD.
    - Ensure that the price is a float.
    - Ensure that the stock ticker is a string.
    - Include as much information as possible about the stock ticker in json format.
    - Ensure that the json is valid.

    ---

    **Important:** Ensure efficiency and accuracy throughout the process.
""".format(
    yahoo_email, yahoo_password
)


async def main(task):

    # config = BrowserConfig(headless=True)
    browser = Browser()

    llm = ChatOpenAI(
        model="gpt-4o",
        temperature=0,
    )
    planner_llm = ChatOpenAI(
        model="o3-mini",
    )

    agent = Agent(
        task=task,
        llm=llm,
        planner_llm=planner_llm,
        use_vision_for_planner=False,
        planner_interval=4,
        browser=browser,
    )

    try:
        result = await agent.run()
    except Exception as agent_error:
        logger.error("Error running agent:", agent_error)
        await browser.close()
        return {"status": "error", "message": "Error running agent."}
    return result


if __name__ == "__main__":
    result = asyncio.run(main(TASK))
