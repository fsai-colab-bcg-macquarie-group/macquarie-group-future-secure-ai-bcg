"""Streamlit UI for aa_browser_research – secrets masking, worker logs, **examples tab**
-----------------------------------------------------------------------------
• Secret placeholders render as password inputs and stay masked in history.
• Worker logs tab tails `podman‑compose logs worker`.
• **New “📋 Examples” tab** lists ready‑made tasks; clicking one pre‑fills the
  *Run Task* form. Users can also add their own examples in‑app (session‑local).
"""

from __future__ import annotations

import os
import re
import subprocess
import time
from typing import Any, Dict, List

import requests
import streamlit as st

# ─────────────────────────────────────────────────────────────────────────────
# Resolve backend URL
# ─────────────────────────────────────────────────────────────────────────────
try:
    API_BASE: str = st.secrets["api_base"]  # type: ignore[index]
except Exception:
    API_BASE = os.getenv("API_BASE", "http://localhost:8000")

RUN_ENDPOINT = f"{API_BASE}/run"
RESULT_ENDPOINT = f"{API_BASE}/result"  # append /{job_id}

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

PLACEHOLDER_RE = re.compile(r"{{\s*([\w\-]+)\s*}}")


def extract_placeholders(template: str) -> List[str]:
    return sorted(set(PLACEHOLDER_RE.findall(template)))


def build_payload(
    template: str,
    secrets: Dict[str, str],
    llm_model: str,
    llm_temp: float,
    disable_security: bool,
) -> Dict[str, Any]:
    payload: Dict[str, Any] = {
        "task_template": template,
        "planner_llm": {"model": "o4-mini", "temperature": 1.0},
        "browser": {"headless": True, "disable_security": disable_security},
        "llm": {"model": llm_model, "temperature": llm_temp},
        "secrets": {k: v for k, v in secrets.items() if v.strip()},
    }
    return payload


def mask_secrets(payload: Dict[str, Any]) -> Dict[str, Any]:
    masked = payload.copy()
    if "secrets" in masked:
        masked["secrets"] = {
            k: "*****" if v else "" for k, v in masked["secrets"].items()
        }
    return masked


def post_task(payload: Dict[str, Any]) -> str | None:
    try:
        resp = requests.post(RUN_ENDPOINT, json=payload, timeout=30)
        resp.raise_for_status()
        return resp.json().get("job_id")
    except Exception as exc:
        st.error(f"API Error: {exc}")
        return None


def fetch_result(job_id: str):
    try:
        resp = requests.get(f"{RESULT_ENDPOINT}/{job_id}", timeout=30)
        if resp.status_code == 404:
            return {"status": "pending"}
        resp.raise_for_status()
        return resp.json()
    except Exception as exc:
        return {"status": "error", "detail": str(exc)}


def get_worker_logs(lines: int = 100) -> str:
    try:
        result = subprocess.run(
            ["podman-compose", "logs", "--tail", str(lines), "worker"],
            capture_output=True,
            text=True,
            check=False,
        )
        return result.stdout or result.stderr or "(no logs)"
    except FileNotFoundError:
        return "podman-compose not found."


# ─────────────────────────────────────────────────────────────────────────────
# Session state initialisation
# ─────────────────────────────────────────────────────────────────────────────
if "runs" not in st.session_state:
    st.session_state["runs"] = []

# default example list
DEFAULT_EXAMPLES = [
    {
        "title": "Capedge – Login & Summarise Alert",
        "template": (
            "Navigate to https://capedge.com/user/signin. "
            'Enter email "{{email}}" and password "{{password}}". '
            "Solve the reCAPTCHA using the Handle reCAPTCHA action. "
            "Click the Log In button. When in the dashboard, go to the Alert Feed and click on the first alert "
            "(not including external links or Reddit). "
            "Summarise the alert and return the summary in a structured JSON format as follows: "
            '{"title":"<alert title>", "description":"<alert description>", "link":"<link to the alert>"}. '
            "Make the description detailed."
        ),
    }
]

if "examples" not in st.session_state:
    st.session_state["examples"] = DEFAULT_EXAMPLES.copy()

# ─────────────────────────────────────────────────────────────────────────────
# UI Layout
# ─────────────────────────────────────────────────────────────────────────────

st.title("🖥️ FSAI Browser Agent")

run_tab, results_tab, worker_tab, examples_tab = st.tabs(
    [
        "▶️ Run Task",
        "📜 Logs & Results",
        "🪵 Worker Logs",
        "📋 Examples",
    ]
)

# -------------------------- Examples Tab ------------------------------------
with examples_tab:
    st.subheader("Saved Examples")
    for ex in st.session_state.examples:
        if st.button(ex["title"]):
            # Prefill the run tab
            st.session_state.task_template = ex["template"]
            # Clear any old secret inputs
            for ph in extract_placeholders(ex["template"]):
                st.session_state[f"secret_{ph}"] = ""
            st.success("Example loaded into Run Task tab.")
            st.rerun()

    with st.expander("➕ Add New Example"):
        new_title = st.text_input("Example Title", key="new_ex_title")
        new_template = st.text_area("Example Task Template", key="new_ex_template")
        if st.button("Add Example"):
            if new_title.strip() and new_template.strip():
                st.session_state.examples.append(
                    {"title": new_title, "template": new_template}
                )
                st.success("Example added! It will persist for this session.")
                # clear fields
                st.session_state.new_ex_title = ""
                st.session_state.new_ex_template = ""
                st.rerun()
            else:
                st.warning("Both title and template are required.")

# -------------------------- Run Task Tab ------------------------------------
with run_tab:
    st.subheader("Build Payload")

    task_template = st.text_area(
        "Task Template *",
        value=st.session_state.get("task_template", ""),
        placeholder="Describe the agent's task here…",
        help="Use `{{variable}}` syntax for secrets.",
        height=160,
        key="task_template",
    )

    placeholders = extract_placeholders(task_template)

    secrets_inputs: Dict[str, str] = {}
    if placeholders:
        st.markdown("### Secrets")
        for ph in placeholders:
            secrets_inputs[ph] = st.text_input(ph, type="password", key=f"secret_{ph}")

    with st.expander("⚙️ Advanced LLM Settings"):
        llm_model = st.text_input("LLM Model", value="gpt-4.1", key="llm_model")
        llm_temp = st.slider(
            "LLM Temperature", 0.0, 1.0, value=0.0, step=0.05, key="llm_temp"
        )

    st.markdown("---")
    col1, col2 = st.columns(2)
    col1.text_input("Planner LLM (fixed)", value="o4-mini", disabled=True)
    col1.slider("Planner Temperature (fixed)", 0.0, 1.0, value=1.0, disabled=True)
    col2.checkbox("Headless", value=True, disabled=True)
    disable_sec = col2.checkbox(
        "Disable Browser Security", value=True, key="disable_sec"
    )

    # --- Save‑as‑Example controls -----------------------------------------------
    save_col1, save_col2 = st.columns(2)
    save_as_example = save_col1.checkbox("Save this as an example")
    example_title = save_col2.text_input("Example title", key="save_title")

    # --- Run button & optional example save -------------------------------------
    if st.button("🚀 Run Task"):
        if not task_template.strip():
            st.warning("Task template cannot be empty.")
        else:
            payload = build_payload(
                task_template, secrets_inputs, llm_model, llm_temp, disable_sec
            )

            # Optionally store as example (without secrets)
            if save_as_example and example_title.strip():
                st.session_state.examples.append(
                    {
                        "title": example_title.strip(),
                        "template": task_template,
                        "llm_model": llm_model,
                        "llm_temp": llm_temp,
                        "disable_security": disable_sec,
                    }
                )

            with st.spinner("Submitting task…"):
                job_id = post_task(payload)
            if job_id:
                st.success(f"Task queued (job_id: {job_id})")
                st.session_state.runs.insert(
                    0, {"job_id": job_id, "payload": payload, "ts": time.time()}
                )

# -------------------------- Logs & Results Tab ------------------------------
with results_tab:
    st.subheader("Past Runs")

    if not st.session_state.runs:
        st.info("No tasks run in this session yet.")
    else:
        for run in st.session_state.runs:
            with st.expander(f"Job {run['job_id']}"):
                st.markdown(
                    "**Submitted:** "
                    + time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(run["ts"]))
                )
                st.markdown("**Payload (secrets masked)**")
                st.json(mask_secrets(run["payload"]))

                result = fetch_result(run["job_id"])
                status = result.get("status")
                if status == "pending":
                    st.info("Result not ready yet.")
                elif status == "error":
                    st.error(result.get("detail"))
                else:
                    st.markdown("**Result**")
                    st.json(result)

    st.button("🔄 Refresh All Results", on_click=lambda: None)

# -------------------------- Worker Logs Tab ---------------------------------
with worker_tab:
    st.subheader("Live Worker Logs (last 100 lines)")
    logs_placeholder = st.empty()

    def refresh_logs():
        logs_placeholder.code(get_worker_logs(), language="bash")

    refresh_logs()
    st.button("Refresh", on_click=refresh_logs)
