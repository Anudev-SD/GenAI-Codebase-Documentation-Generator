import os
import subprocess
from litellm import completion

AGENT_REASONING_PROMPT = """You are an autonomous Python engineering agent.
Decompose the coding goal into isolated python execution tasks.
Execute code in the secure sandbox and analyze stdout.
Never execute destructive shell commands like 'rm -rf' or access unauthorized network ports.
"""

def execute_agent_loop(goal: str):
    model = os.getenv("LITELLM_MODEL", "gemini/gemini-2.5-flash")
    print(f"Running agent with model {model} on goal: {goal}")
    # Simulates thought-action-observation
    return "Task completed with sandbox verification."
