import json
import logging
import os

from browser_use import ActionResult, Browser, Controller
from dotenv import load_dotenv
from playwright.async_api import Page
from playwright_recaptcha.recaptchav2 import AsyncSolver

load_dotenv()
CAPSOLVER_API_KEY = os.getenv("CAPSOLVER_API_KEY")
if not CAPSOLVER_API_KEY:
    raise RuntimeError("⚠️ Please set CAPSOLVER_API_KEY in your environment")

log = logging.getLogger(__name__)
controller = Controller()


@controller.action("Handle reCAPTCHA")
async def handle_recaptcha(browser: Browser) -> ActionResult:
    page = await browser.get_current_page()
    log.info("🔑 handle_recaptcha: waiting for recaptcha iframe…")
    # wait up to 30s for the checkbox iframe to appear
    await page.wait_for_selector("iframe[src*='anchor']", timeout=30_000)

    # scroll that widget into view so nothing blocks the click
    await page.locator("iframe[src*='anchor']").scroll_into_view_if_needed()

    log.info("🔑 handle_recaptcha: launching AsyncSolver…")
    async with AsyncSolver(page, capsolver_api_key=CAPSOLVER_API_KEY) as solver:
        # force image mode so we never hit the audio-rate-limit
        token = await solver.solve_recaptcha(wait=True, image_challenge=True)
        log.info("✅ solver got token: %s", token)

    # double check the green checkmark
    anchor_box = page.frame_locator("iframe[src*='anchor']").locator(
        "#recaptcha-anchor"
    )
    solved = (await anchor_box.get_attribute("aria-checked")) == "true"
    return ActionResult(
        extracted_content="captcha-solved" if solved else "captcha-failed"
    )


@controller.action("Click Add to Cart")
async def click_add_to_cart(browser: Browser) -> ActionResult:
    page = await browser.get_current_page()

    # 1) Try standard “Add to cart” buttons
    for selector in [
        "button:has-text('Add to cart')",
        "[aria-label*='add to cart']",
        "[data-testid*='add-to-cart']",
        ".add-to-cart button",
    ]:
        for btn in await page.query_selector_all(selector):
            if await btn.is_disabled():
                continue
            await btn.scroll_into_view_if_needed()
            await btn.click()

            # remember the product container for quantity bumps
            handle = await btn.evaluate_handle(
                "el => el.closest('[data-testid*=product], .product-card, .product-tile')"
            )
            container = handle.as_element()
            if container:
                controller._last_product_container = container
            return ActionResult(extracted_content='{"action":"clicked"}')

    # 2) Fallback: probe common web-components w/ shadow DOM
    for host in await page.query_selector_all("wc-add-to-cart, product-card"):
        shadow = await host.evaluate_handle("e => e.shadowRoot")
        if shadow.as_element():
            btn = await shadow.query_selector("button, .btn")
            if btn and not await btn.is_disabled():
                await btn.scroll_into_view_if_needed()
                await btn.click()
                controller._last_product_container = host
                return ActionResult(extracted_content='{"action":"increased"}')

    return ActionResult(extracted_content=None)


@controller.action("Increase Quantity")
async def increase_quantity(browser: Browser) -> ActionResult:
    page = await browser.get_current_page()
    container = getattr(controller, "_last_product_container", None)

    # 1) Try inside the same product container (if any)
    if container:
        # most carts render controls outside the product card,
        # but if your site does it inline this will catch it
        for sel in ["button.increment-btn", ".increment-btn", ".qty-increase"]:
            btn = await container.query_selector(sel)
            if btn and not await btn.is_disabled():
                await btn.scroll_into_view_if_needed()
                await btn.click()
                return ActionResult(extracted_content="increased")

    # 2) Global fallback: any “+” or increment button on the page
    for sel in ["button.increment-btn", ".increment-btn"]:
        for btn in await page.query_selector_all(sel):
            if await btn.is_disabled():
                continue
            await btn.scroll_into_view_if_needed()
            await btn.click()
            return ActionResult(extracted_content="increased")

    return ActionResult(extracted_content=None)
