# validate_solver.py
import asyncio
import logging
import os

from dotenv import load_dotenv
from playwright.async_api import async_playwright
from playwright_recaptcha.recaptchav2 import AsyncSolver

# load your .env (make sure it contains CAPSOVER_API_KEY)
load_dotenv()
CAPSOLVER_API_KEY = os.getenv("CAPSOLVER_API_KEY")
if not CAPSOLVER_API_KEY:
    raise RuntimeError("⚠️ Please set CAPSOVER_API_KEY in your environment")

logging.basicConfig(level=logging.INFO)


async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=False)
        page = await browser.new_page()

        # 1) Navigate to the demo—and wait for the widget
        await page.goto(
            "https://www.google.com/recaptcha/api2/demo", wait_until="networkidle"
        )
        await page.wait_for_selector("iframe[src*='anchor']", timeout=30_000)

        # 2) Solve via image workflow (capsolver)
        logging.info("▶️  Starting AsyncSolver with Capsolver image mode…")
        async with AsyncSolver(
            page,
            capsolver_api_key=CAPSOLVER_API_KEY,  # ← your paid key here
        ) as solver:
            token = await solver.solve_recaptcha(
                wait=True, image_challenge=True  # ← force the image flow
            )
            logging.info(f"✅ Solver finished, token={token!r}")

        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
