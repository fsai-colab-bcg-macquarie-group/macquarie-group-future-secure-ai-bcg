import asyncio
import json
import logging
import os
import warnings

import openai
from browser_use import Agent, Browser, BrowserConfig
from browser_use.browser.context import BrowserContextConfig
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

from aa_browser_research.controller import controller

warnings.filterwarnings("ignore", category=DeprecationWarning)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Load environment variables for MFA (if still required)
def load_env_vars():
    load_dotenv()
    email = os.getenv("COUNTDOWN_EMAIL")
    password = os.getenv("COUNTDOWN_PASSWORD")
    if not (email and password):
        raise RuntimeError(
            "⚠️ COUNTDOWN_EMAIL and COUNTDOWN_PASSWORD must be set in your .env file"
        )
    return email, password


async def build_grocery_list(input_prompt) -> list[dict]:
    prompt = (
        f"{input_prompt}, \n"
        "Return *only* a JSON array of objects "
        'with fields "item" and "quantity", e.g.:\n\n'
        '[{"item":"1 kg jasmine rice","quantity":"1 kg"}, …]'
    )

    resp = openai.chat.completions.create(
        model="gpt-4.1",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=400,
    )
    content = resp.choices[0].message.content.strip()
    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        logger.error("Failed to parse JSON from OpenAI:\n%s", content)
        raise


async def main():
    prompt = "come up with a grocery list to make cheap bean tacos, not many ingredients and simple. the quantity should only be for 3 people."
    grocery_items = await build_grocery_list(prompt)
    logger.info("🔖 Grocery list from GPT:\n%s", grocery_items)

    # after you build grocery_items…
    lines = "\n".join(
        f"{i+1}. {it['item']} – quantity: {it['quantity']}"
        for i, it in enumerate(grocery_items)
    )

    # fill in your preferences/budget/coupon as variables if you like
    preference = "cheapest available size"
    budget = "$120"

    TASK = f"""
    Add the following items to my shopping cart on Harris Farm AU.
    **Use the `Click Add to Cart` action** for every the first unit of each product.
    If the quantity requested is more than 1, **use the `Increase Quantity` action** (the “+” button) to bump the count on that same product.
    If it asks for a delivery code, use 2122. Select Lane Cove, and delivery slot will be click and collect at 7pm thursday.
    After each action, it should return a JSON with the action and result, i.e. clicked, increased.
    Make sure to check that an item was successully added to cart, as sometimes it does not happen and will need to redo an action.
    Look at the top right amount every time a new item is added to cart to validate it has been successfully added to cart as well as the amount of items in cart.
    Another tip is when you click add to cart, you usually know its successful when that button changes to a quantity with '+' and '-' buttons next to it.
    Don't assume things are sold out. They are most likely not unless explicitly stated with text you can read saying' Sold Out'.

    Here are the items:
    {lines}

    For each item:
    - When entering the item in the search bar, press Enter instead of clicking the search button.
    - If the exact item is unavailable, find the closest alternative.
    - If there are multiple options (size, brand, pack size, etc.), select the {preference}.
    - If the price is above {budget}, choose a more affordable substitute.

    Once all items are in the cart:
    -   Check the cart and validate
    -   If there are too many of one item, remove until the desired amount is left
    -   If items are missing, close the cart and add until the cart is the desired list of grocery items.

    Return:
    - A JSON array of objects with fields {{item, selected_variant, unit_price, quantity, total_price}}
    - The final cart total.
    """

    # Ensure cookies.json is in the same directory as this script
    cwd = os.path.dirname(os.path.abspath(__file__))
    cookies_path = os.path.join(cwd, "cookies.json")
    if not os.path.exists(cookies_path):
        raise FileNotFoundError(f"cookies.json not found at {cookies_path}")

    # Configure the Browser to auto-load cookies
    context_cfg = BrowserContextConfig(
        cookies_file=cookies_path,
        disable_security=True,
        # user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        minimum_wait_page_load_time=3,
        wait_for_network_idle_page_load_time=3.0,
        maximum_wait_page_load_time=30,
    )
    browser_cfg = BrowserConfig(
        headless=False,
        disable_security=True,
        new_context_config=context_cfg,
    )

    # Launch browser with cookie-loaded context
    browser = Browser(config=browser_cfg)

    # Initialize LLMs
    llm = ChatOpenAI(model="gpt-4.1", temperature=0)
    planner_llm = ChatOpenAI(model="o3-mini")

    # Create and run the Agent
    agent = Agent(
        task=TASK,
        llm=llm,
        planner_llm=planner_llm,
        browser=browser,
        controller=controller,
        use_vision=True,
        planner_interval=4,
    )

    try:

        result = await agent.run()
        print("Automation completed. Results:")
        # print(json.dumps(result, indent=2))
        print(result)
    except Exception:
        logger.exception("Agent run failed")
    finally:
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
