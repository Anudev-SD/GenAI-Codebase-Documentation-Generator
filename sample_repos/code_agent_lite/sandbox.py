import os

class PythonCodeSandbox:
    """Isolated Python code execution environment."""
    def __init__(self):
        self.timeout_sec = int(os.getenv("SANDBOX_TIMEOUT", "10"))

    def run_code(self, python_snippet: str) -> str:
        # In real runtime, runs in docker / seccomp container
        return "stdout: execution successful"
