#!/usr/bin/env python3
import io
import os
import sys
from pathlib import Path

# ── 1) Route all AgentLab output into the top-level `results/` folder ─────────
ROOT = Path(__file__).parent.resolve()
RESULTS_ROOT = ROOT / "results"
RESULTS_ROOT.mkdir(exist_ok=True)
os.environ["AGENTLAB_EXP_ROOT"] = str(RESULTS_ROOT)


from agentlab.agents.generic_agent import AGENT_4o_MINI

# ── 5) Build & prepare your "openended" experiment ───────────────────────────
from agentlab.ui_assistant import make_exp_args

exp = make_exp_args(
    AGENT_4o_MINI,
)

exp.prepare(RESULTS_ROOT / "test_agentlab")

# ── 6) Run it! It will read your TASK from stdin automatically ─────────────
exp.run()
