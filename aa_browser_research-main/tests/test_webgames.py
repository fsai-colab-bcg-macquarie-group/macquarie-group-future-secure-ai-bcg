import asyncio
import json
import logging
import os
import time

from browser_use import Agent
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
TASKS = [
    {
        "name": "Today's date",
        "task": (
            "Visit https://webgames.convergence.ai/date. "
            "Carefully read the instructions listed on the webpage. "
            "Enter the correct date based on the specifications. "
            "Click the 'Check Date' blue button. "
            "If successful, you will receive a secret password. "
            "Return the secret password provided."
        ),
        "expected": "DATE_MASTER_2024",
    },
    {
        "name": "Button megastar",
        "task": (
            "Visit https://webgames.convergence.ai/buttons. "
            "Carefully read the instructions listed on the webpage. "
            "Click and interact with every button to discover the one that holds the secret password. "
            "Make sure to test all elements, including any that may be disguised. "
            "If successful, you will receive a secret password. "
            "Return the secret password provided."
        ),
        "expected": "ClickityClickBoom2024",
    },
    {
        "name": "Click³",
        "task": (
            "Visit https://webgames.convergence.ai/click-cubed. "
            "Carefully read the instructions listed on the webpage. "
            "Click and interact with every button to discover the one that holds the secret password. "
            "Once you click the first blue button named 'Click First', a 5-second timer starts. "
            "Then click the purple button 'Click Second' and finally the green button 'Click Third' within the timer. "
            "If successful, you will receive a secret password. "
            "Return the secret password provided. "
            "If you are not successful (e.g. if a red 'Try Again' button appears), record this session as a failure."
        ),
        "expected": "TripleClickChampion",
    },
    {
        "name": "Patience test",
        "task": (
            "Visit https://webgames.convergence.ai/patience. "
            "Carefully read the instructions listed on the webpage. "
            "After waiting for 10 seconds as instructed, refresh the page. "
            "If successful, you will receive a secret password. "
            "Return the secret password provided. "
            "Do not retry if the task fails."
        ),
        "expected": "waitForIt2023",
    },
    {
        "name": "Slider symphony",
        "task": (
            "Visit https://webgames.convergence.ai/slider-symphony. "
            "Carefully read the instructions listed on the webpage. "
            "The slider columns correspond to the blue boxes on the right. "
            "Click and drag each slider to align the corresponding blue box within the outlined dashed area. "
            "Once all sliders are correctly adjusted and the boxes are aligned, a secret password will be revealed. "
            "Return the secret password provided."
        ),
        "expected": "SMOOTHSLIDER42",
    },
    {
        "name": "Verification Challenge",
        "task": (
            "Visit https://webgames.convergence.ai/verify-challenge. "
            "Carefully read the instructions of the task and execute what is asked. "
            "Analyse the CAPTCHA, solve it, and input the verification code into the designated field. "
            "Click on the Verify button. "
            "If successful, you will receive a secret password. "
            "Return the secret password provided."
        ),
        "expected": "VERIFYMASTER2025",
    },
    {
        "name": "Prove You're Human",
        "task": (
            "Visit https://webgames.convergence.ai/robo-check. "
            "Carefully read the instructions. "
            "Click the checkbox that says 'I'm not a robot' and follow any further instructions (e.g., select images containing x). "
            "Click the Verify button. "
            "If successful, you will receive a secret password. "
            "Return the secret password provided."
        ),
        "expected": "ReCAPTCHA_MASTER_2024",
    },
    {
        "name": "File Upload",
        "task": (
            "Visit https://webgames.convergence.ai/file-upload. "
            "Carefully read the task instructions. "
            "Click the button labeled 'Choose a file', navigate to the 'Downloads' folder, and select the file named 'browse_comp_test_set.csv'. "
            "Click the Upload button. "
            "If successful, you will receive a secret password. "
            "Return the secret password provided."
        ),
        "expected": "FILE_UPLOAD_2024",
    },
    {
        "name": "Shop Admin",
        "task": (
            "Visit https://webgames.convergence.ai/shop-admin. "
            "Carefully read the instructions. "
            "Perform the necessary actions to update the product prices in the admin panel as described. "
            "If successful, you will receive a secret password. "
            "Return the secret password provided."
        ),
        "expected": "SHOP_MASTER_2024",
    },
    {
        "name": "Emoji remember",
        "task": (
            "Visit https://webgames.convergence.ai/emoji-remember. "
            "Carefully read the instructions displayed on the page. "
            "Memorize the sequence of emojis shown and then enter the exact sequence in the provided input field. "
            "If successful, a secret password will be revealed. "
            "Return the secret password provided."
        ),
        "expected": "MemoryIsKey",
    },
    {
        "name": "Bullseye",
        "task": (
            "Visit https://webgames.convergence.ai/bullseye. "
            "Read the task instructions carefully. "
            "Click the moving target three times as it speeds up. "
            "Maintain precise timing for each click. "
            "If successful, a secret password will appear. "
            "Return the secret password provided."
        ),
        "expected": "BullseyeBonanza2024",
    },
    {
        "name": "I Accept",
        "task": (
            "Visit https://webgames.convergence.ai/i-accept. "
            "Read the instructions carefully. "
            "Click the checkbox to prove you are human and agree to the terms. "
            "If successful, you will be presented with a secret password. "
            "Return the secret password provided."
        ),
        "expected": "BicentennialMan",
    },
    {
        "name": "River Crossing",
        "task": (
            "Visit https://webgames.convergence.ai/wolf-goat-cabbage. "
            "Read the instructions carefully. "
            "Transport the wolf, goat, and cabbage safely across the river following the puzzle rules. "
            "If successful, a secret password will be revealed. "
            "Return the secret password provided."
        ),
        "expected": "CabbagesAreYummy",
    },
    {
        "name": "Towers of Hanoi",
        "task": (
            "Visit https://webgames.convergence.ai/towers-of-hanoi. "
            "Read the instructions and puzzle rules carefully. "
            "Move the disks from the starting peg to the rightmost peg, ensuring that no larger disk is placed on a smaller one. "
            "If successful, you will receive a secret password. "
            "Return the secret password provided."
        ),
        "expected": "RecursionMasterTower",
    },
    {
        "name": "Color Harmony",
        "task": (
            "Visit https://webgames.convergence.ai/color-harmony. "
            "Read the instructions carefully. "
            "Use the RGB sliders to mix colors until the target color combination is achieved as indicated on the page. "
            "If successful, a secret password will be displayed. "
            "Return the secret password provided."
        ),
        "expected": "chromatic_conqueror",
    },
    {
        "name": "Sheep Herding",
        "task": (
            "Visit https://webgames.convergence.ai/herding. "
            "Read the instructions carefully. "
            "Guide the wandering sheep into their designated pen by using your cursor to hover and steer them. "
            "If successful, a secret password will be revealed. "
            "Return the secret password provided."
        ),
        "expected": "HerdTooMuch",
    },
    {
        "name": "Canvas Catch",
        "task": (
            "Visit https://webgames.convergence.ai/canvas-catch. "
            "Read the instructions carefully. "
            "Click and drag the circle into the target zone as prompted. "
            "If the circle is properly placed, a secret password will appear. "
            "Return the secret password provided."
        ),
        "expected": "CircleMaster2024",
    },
    {
        "name": "Brick buster",
        "task": (
            "Visit https://webgames.convergence.ai/brick-buster. "
            "Read the instructions carefully. "
            "Click or drag to break all the bricks on the screen. "
            "When all bricks are cleared, a secret password will be revealed. "
            "Return the secret password provided."
        ),
        "expected": "BrickBusterMaster2025",
    },
    {
        "name": "Text Mirror",
        "task": (
            "Visit https://webgames.convergence.ai/text-mirror. "
            "Read the instructions carefully. "
            "Copy the text exactly as it appears into the input field provided. "
            "If the text is copied perfectly, a secret password will appear. "
            "Return the secret password provided."
        ),
        "expected": "TextualPrecision2024",
    },
    {
        "name": "Frog Crossing",
        "task": (
            "Visit https://webgames.convergence.ai/frog-crossing. "
            "Read the instructions carefully. "
            "Use the provided keyboard controls to guide your frog safely across the busy road. "
            "If successful, a secret password will be revealed. "
            "Return the secret password provided."
        ),
        "expected": "HOPPY_CROSSING",
    },
    {
        "name": "Button Hold",
        "task": (
            "Visit https://webgames.convergence.ai/button-hold. "
            "Read the instructions carefully. "
            "Click and hold the button for exactly 3 seconds. "
            "If held correctly, a secret password will appear. "
            "Return the secret password provided."
        ),
        "expected": "HOLD_STEADY_2024",
    },
    {
        "name": "Key Combo",
        "task": (
            "Visit https://webgames.convergence.ai/key-combo. "
            "Read the instructions carefully. "
            "Press the correct key combination as instructed on the page. "
            "If successful, a secret password will be revealed. "
            "Return the secret password provided."
        ),
        "expected": "KEY_MASTER_2024",
    },
    {
        "name": "Scroll vertical",
        "task": (
            "Visit https://webgames.convergence.ai/scroll-vertical. "
            "Read the instructions carefully. "
            "Scroll down the page until you uncover the secret password. "
            "Return the secret password provided."
        ),
        "expected": "SCROLLMASTER2024",
    },
    {
        "name": "Scroll horizontal",
        "task": (
            "Visit https://webgames.convergence.ai/scroll-horizontal. "
            "Read the instructions carefully. "
            "Scroll right across the page until the secret password becomes visible. "
            "Return the secret password provided."
        ),
        "expected": "SIDEWAYSCROLL2024",
    },
    {
        "name": "WebGL Text",
        "task": (
            "Visit https://webgames.convergence.ai/webgl-text. "
            "Read the instructions carefully. "
            "Observe the WebGL-rendered shape on the page and identify it as instructed. "
            "If successful, a secret password will appear. "
            "Return the secret password provided."
        ),
        "expected": "WEBGLSHAPES2024",
    },
    {
        "name": "File Credentials",
        "task": (
            "Visit https://webgames.convergence.ai/file-credentials. "
            "Read the instructions carefully. "
            "Download the credentials file as directed and use its content to log in. "
            "Once authenticated, a secret password will be revealed. "
            "Return the secret password provided."
        ),
        "expected": "FileSecrets2024",
    },
    {
        "name": "Webs, Assemble!",
        "task": (
            "Visit https://webgames.convergence.ai/webs-assemble. "
            "Read the instructions carefully. "
            "Inspect the WebAssembly module on the page to find the hidden secret code. "
            "If successful, a secret password will be revealed. "
            "Return the secret password provided."
        ),
        "expected": "WebAssemblyMaster",
    },
    {
        "name": "Menu Navigator",
        "task": (
            "Visit https://webgames.convergence.ai/menu-navigator. "
            "Read the instructions carefully. "
            "Navigate through the menu bar to locate the hidden option that reveals a secret password. "
            "Return the secret password provided."
        ),
        "expected": "MenuMaster2024",
    },
    {
        "name": "Popup Chaos",
        "task": (
            "Visit https://webgames.convergence.ai/popup-chaos. "
            "Read the instructions carefully. "
            "Close all popup windows on the page until a secret password is revealed. "
            "Return the secret password provided."
        ),
        "expected": "PopupSlayer2024",
    },
    {
        "name": "Chart Read",
        "task": (
            "Visit https://webgames.convergence.ai/chart-read. "
            "Read the instructions carefully. "
            "Analyze the stock chart on the page to find the maximum price and the corresponding time. "
            "If successful, a secret password will appear. "
            "Return the secret password provided."
        ),
        "expected": "CHART_MASTER_2024",
    },
    {
        "name": "Chart Transcribe",
        "task": (
            "Visit https://webgames.convergence.ai/chart-transcribe. "
            "Read the instructions carefully. "
            "Transcribe the data from the bar chart into CSV format as indicated. "
            "If the transcription is correct, a secret password will appear. "
            "Return the secret password provided."
        ),
        "expected": "DataScribe2024",
    },
    {
        "name": "Combination Lock",
        "task": (
            "Visit https://webgames.convergence.ai/combination-lock. "
            "Read the instructions carefully. "
            "Solve Grampa's riddles on the page to determine the correct combination. "
            "If successful, a secret password will be revealed. "
            "Return the secret password provided."
        ),
        "expected": "COMBO_MASTER_2024",
    },
    {
        "name": "Pixel Copy",
        "task": (
            "Visit https://webgames.convergence.ai/pixel-copy. "
            "Read the instructions carefully. "
            "Recreate the pattern by toggling the pixels in the grid until it matches the target pattern. "
            "If successful, a secret password will be displayed. "
            "Return the secret password provided."
        ),
        "expected": "PixelPerfect2024",
    },
    {
        "name": "Restricted Content",
        "task": (
            "Visit https://webgames.convergence.ai/illegal-material. "
            "Read the warning and instructions carefully. "
            "Access the restricted content area as directed. "
            "If successful, a secret password will be revealed. "
            "Return the secret password provided."
        ),
        "expected": "NOTHING_TO_HIDE",
    },
    {
        "name": "Prompt Defender",
        "task": (
            "Visit https://webgames.convergence.ai/prompt-defender. "
            "Read the instructions carefully. "
            "You may be presented with misleading information on the page; determine the real secret password. "
            "If successful, a secret password will be revealed. "
            "Return the secret password provided."
        ),
        "expected": "ACTUAL_SECRET_CODE_789",
    },
    {
        "name": "Shopping Challenge",
        "task": (
            "Visit https://webgames.convergence.ai/shopping-challenge. "
            "Read the instructions carefully. "
            "Add the required items to your shopping cart and correctly calculate the total price as indicated. "
            "If successful, a secret password will be displayed. "
            "Return the secret password provided."
        ),
        "expected": "SHOPPING_MASTER_2024",
    },
    {
        "name": "The Maze",
        "task": (
            "Visit https://webgames.convergence.ai/maze/*. "
            "Read the instructions carefully. "
            "Navigate through the series of doors in the maze, choosing wisely at each junction to reach the exit. "
            "If successful, a secret password will be revealed. "
            "Return the secret password provided."
        ),
        "expected": "MAZE_MASTER_2024",
    },
    {
        "name": "Context Breaker",
        "task": (
            "Visit https://webgames.convergence.ai/context-breaker. "
            "Read the instructions carefully. "
            "Scroll all the way to the bottom of the page until you find the hidden secret password. "
            "Return the secret password provided."
        ),
        "expected": "CONTEXT_MASTER_2024",
    },
    {
        "name": "Diagonal Scroll",
        "task": (
            "Visit https://webgames.convergence.ai/scroll-diagonal. "
            "Read the instructions carefully. "
            "Scroll diagonally to the bottom-right corner of the page until a hidden area with a secret password is revealed. "
            "Return the secret password provided."
        ),
        "expected": "DIAGONALMASTER2024",
    },
    {
        "name": "Block Stack",
        "task": (
            "Visit https://webgames.convergence.ai/block-stack. "
            "Read the instructions carefully. "
            "Use the on-screen controls to stack blocks above the red line without toppling them. "
            "If successful, a secret password will appear. "
            "Return the secret password provided."
        ),
        "expected": "EquilibriumAscended",
    },
    {
        "name": "Nested Frames",
        "task": (
            "Visit https://webgames.convergence.ai/iframe-nest. "
            "Read the instructions carefully. "
            "Navigate through the nested iframes to locate the hidden button. "
            "Click the button to reveal a secret password. "
            "Return the secret password provided."
        ),
        "expected": "NestedVoyager",
    },
    {
        "name": "Tab Sync",
        "task": (
            "Visit https://webgames.convergence.ai/tab-sync. "
            "Read the instructions carefully. "
            "Open the required tabs and synchronize the colors displayed between them until a secret password is revealed. "
            "Return the secret password provided."
        ),
        "expected": "ChromaticSync",
    },
    {
        "name": "OTP Entry",
        "task": (
            "Visit https://webgames.convergence.ai/otp-entry. "
            "Read the instructions carefully. "
            "Enter the correct 6-digit one-time password into the auto-focusing input fields provided. "
            "If successful, a secret password will be displayed. "
            "Return the secret password provided."
        ),
        "expected": "OTP_MASTER_2024",
    },
    {
        "name": "Print to Reveal",
        "task": (
            "Visit https://webgames.convergence.ai/print-reveal. "
            "Read the instructions carefully. "
            "Use the browser’s print functionality to generate a PDF from the page. "
            "The hidden secret password will be revealed as a result. "
            "Return the secret password provided."
        ),
        "expected": "PR1NT_V3R1F13D_2024",
    },
    {
        "name": "Right Click Reveal",
        "task": (
            "Visit https://webgames.convergence.ai/right-click. "
            "Read the instructions carefully. "
            "Use your context menu (right-click) on the page to reveal the hidden secret password. "
            "Return the secret password provided."
        ),
        "expected": "RIGHT_CLICK_MASTER",
    },
    {
        "name": "Calendar Comprehension",
        "task": (
            "Visit https://webgames.convergence.ai/calendar-comprehension. "
            "Read the calendar displayed on the page and answer the follow-up questions as instructed. "
            "If your answers are correct, a secret password will be revealed. "
            "Return the secret password provided."
        ),
        "expected": "CALENDAR_MASTER_2024",
    },
    {
        "name": "Map Panner",
        "task": (
            "Visit https://webgames.convergence.ai/map-panner. "
            "Read the instructions carefully. "
            "Pan around the mysterious map until you locate the hidden treasure where a secret password is displayed. "
            "Return the secret password provided."
        ),
        "expected": "CARTOGRAPHER2024",
    },
    {
        "name": "LadyBird Planner",
        "task": (
            "Visit https://webgames.convergence.ai/ladybird. "
            "Read the instructions carefully. "
            "Plan the ladybird’s path using the directional emojis provided so that it reaches the flower. "
            "If successful, a secret password will be revealed. "
            "Return the secret password provided."
        ),
        "expected": "LADYBIRD_NAVIGATOR",
    },
    {
        "name": "Pixel Perfect",
        "task": (
            "Visit https://webgames.convergence.ai/click-pixel. "
            "Read the instructions carefully. "
            "Precisely click on the single pixel target as indicated on the page. "
            "If successful, a secret password will be displayed. "
            "Return the secret password provided."
        ),
        "expected": "PIXEL_PERFECT_2024",
    },
    {
        "name": "Recipe Calculator",
        "task": (
            "Visit https://webgames.convergence.ai/recipe-calculator. "
            "Read the instructions carefully. "
            "Calculate the correct amount of ingredients for a dinner party as specified on the page. "
            "If successful, a secret password will be revealed. "
            "Return the secret password provided."
        ),
        "expected": "RECIPE_CALC_2024",
    },
    {
        "name": "Advanced Calendar Challenge",
        "task": (
            "Visit https://webgames.convergence.ai/calendar2. "
            "Read the instructions carefully. "
            "Solve the complex time calculations and calendar comprehension questions presented on the page. "
            "If successful, a secret password will be revealed. "
            "Return the secret password provided."
        ),
        "expected": "time_wizard_2024",
    },
    {
        "name": "Stock Market Insight",
        "task": (
            "Visit https://webgames.convergence.ai/stock-market. "
            "Read the instructions carefully. "
            "Analyze the provided information on tech stocks and determine which is the best stock to buy in 2025. "
            "If successful, a secret password will be displayed. "
            "Return the secret password provided."
        ),
        "expected": "GG_GOOG_GAIN",
    },
]

DEFAULT_TEMPERATURE = 0


def classify_failure(result_text: str) -> str:
    """Simple classifier to define error mode categories based on the result text."""
    text = result_text.lower()
    if "captcha" in text:
        return "CAPTCHA Failure"
    elif "infinite loop" in text or "timeout" in text:
        return "Infinite Loop/Timeout"
    elif "not found" in text or "failed" in text:
        return "Resource/Content Not Found"
    elif "memory" in text:
        return "Memory/Context Overflow"
    # Extend with more patterns as needed.
    return "Uncategorized Failure"


def extract_token_details(agent):
    """
    Extracts tokens used from the agent if available.
    Assumes the agent has an attribute or method that gives input and output tokens separately.
    Adjust based on your actual API.
    """
    try:
        input_tokens = agent.result.total_input_tokens()  # Hypothetical method
    except Exception:
        input_tokens = None
    try:
        output_tokens = agent.result.total_output_tokens()  # Hypothetical method
    except Exception:
        output_tokens = None
    return input_tokens, output_tokens


def count_steps(agent):
    """
    Returns the number of steps the agent took.
    Assumes agent.history is a list of actions. Adjust this based on your actual implementation.
    """
    try:
        return len(agent.history)
    except Exception:
        return None


async def run_task(task_prompt: str) -> dict:
    llm = ChatOpenAI(model="gpt-4o", temperature=DEFAULT_TEMPERATURE)
    planner = ChatOpenAI(model="o3-mini")
    agent = Agent(task=task_prompt, llm=llm, planner_llm=planner)

    # Run the agent with a max_steps limit of 20 to prevent infinite loops.
    start_time = time.time()
    history = await agent.run(max_steps=20)
    duration = time.time() - start_time

    try:
        tokens = history.total_input_tokens()
    except Exception:
        tokens = None

    extracted = (
        history.extracted_content() if hasattr(history, "extracted_content") else ""
    )
    result_text = " ".join(extracted) if isinstance(extracted, list) else extracted
    success = bool(result_text)
    error_mode = None
    if not success:
        error_mode = classify_failure(result_text)

    # Optionally add the step count from the agent's history.
    steps = count_steps(agent)

    return {
        "result": result_text,
        "duration_seconds": duration,
        "tokens": tokens,
        "steps": steps,
        "success": success,
        "error_mode": error_mode,
    }


async def main():
    all_results = {}
    for task in TASKS:
        logger.info("Running task: %s", task["name"])
        result = await run_task(task["task"])
        all_results[task["name"]] = result
        logger.info(
            "Task %s completed in %.2f seconds",
            task["name"],
            result["duration_seconds"],
        )

    # Save results to a JSON file for further analysis/reporting, or print them.
    with open("results/webgames_eval_results.json", "w") as f:
        json.dump(all_results, f, indent=2)

    print(json.dumps(all_results, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
