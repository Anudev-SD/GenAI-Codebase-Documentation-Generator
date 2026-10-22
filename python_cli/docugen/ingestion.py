"""
Deterministic AST ingestion layer for Generative AI codebases.
Filters out bloat (.git, venvs, binaries) and extracts system prompts,
framework imports, call graphs, and environment variable references.
"""

import ast
import os
import re
from pathlib import Path
from typing import List, Dict, Set, Tuple, Optional

from docugen.schemas import (
    IngestionResult,
    IngestionStats,
    SystemPromptInfo,
    FrameworkDetection,
)

BLOAT_DIR_NAMES = {
    ".git", ".github", ".pytest_cache", ".ruff_cache", "__pycache__",
    "venv", ".venv", "env", ".env", "node_modules", "dist", "build",
    ".idea", ".vscode", ".tox", "eggs", ".mypy_cache"
}

BINARY_EXTENSIONS = {
    ".pyc", ".pyo", ".pyd", ".png", ".jpg", ".jpeg", ".gif", ".ico",
    ".pdf", ".exe", ".bin", ".tar", ".gz", ".zip", ".whl", ".so", ".dylib"
}

FRAMEWORK_MAPPINGS = {
    "langchain": ("LangChain", "orchestration"),
    "langgraph": ("LangGraph", "agent_loop"),
    "llama_index": ("LlamaIndex", "orchestration"),
    "llamaindex": ("LlamaIndex", "orchestration"),
    "litellm": ("LiteLLM", "llm_client"),
    "chromadb": ("ChromaDB", "vector_store"),
    "pinecone": ("Pinecone", "vector_store"),
    "qdrant_client": ("Qdrant", "vector_store"),
    "weaviate": ("Weaviate", "vector_store"),
    "faiss": ("FAISS", "vector_store"),
    "google.genai": ("Google GenAI SDK", "llm_client"),
    "openai": ("OpenAI SDK", "llm_client"),
    "anthropic": ("Anthropic SDK", "llm_client"),
    "tavily": ("Tavily Web Search", "agent_loop"),
    "ragas": ("Ragas", "evaluation"),
    "trulens_eval": ("TruLens", "evaluation"),
    "deepeval": ("DeepEval", "evaluation"),
    "crewai": ("CrewAI", "agent_loop"),
    "autogen": ("AutoGen", "agent_loop"),
}


class GenAIASTVisitor(ast.NodeVisitor):
    """AST Visitor that traverses Python nodes to inspect AI constructs."""

    def __init__(self, filepath: str):
        self.filepath = filepath
        self.imports: List[Tuple[str, str]] = []  # (module, symbol)
        self.system_prompts: List[SystemPromptInfo] = []
        self.classes: List[str] = []
        self.functions: List[str] = []
        self.calls: List[str] = []
        self.env_lookups: Set[str] = set()

    def visit_Import(self, node: ast.Import):
        for alias in node.names:
            self.imports.append((alias.name, alias.asname or alias.name))
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom):
        mod = node.module or ""
        for alias in node.names:
            self.imports.append((f"{mod}.{alias.name}" if mod else alias.name, alias.asname or alias.name))
        self.generic_visit(node)

    def visit_ClassDef(self, node: ast.ClassDef):
        self.classes.append(node.name)
        self.generic_visit(node)

    def visit_FunctionDef(self, node: ast.FunctionDef):
        self.functions.append(node.name)
        self.generic_visit(node)

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
        self.functions.append(node.name)
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call):
        # Detect os.getenv("API_KEY") or os.environ.get("...")
        if isinstance(node.func, ast.Attribute):
            func_name = node.func.attr
            if func_name in ("getenv", "get") and node.args:
                first_arg = node.args[0]
                if isinstance(first_arg, ast.Constant) and isinstance(first_arg.value, str):
                    self.env_lookups.add(first_arg.value)

            # Record call name for call graph
            self.calls.append(node.func.attr)
        elif isinstance(node.func, ast.Name):
            self.calls.append(node.func.id)

        # Detect SystemMessage(content="...") or PromptTemplate.from_template("...")
        self._check_prompt_call(node)
        self.generic_visit(node)

    def visit_Assign(self, node: ast.Assign):
        # Detect SYSTEM_PROMPT = """You are a helpful..."""
        for target in node.targets:
            target_name = ""
            if isinstance(target, ast.Name):
                target_name = target.id
            elif isinstance(target, ast.Attribute):
                target_name = target.attr

            if target_name and any(p in target_name.lower() for p in ["prompt", "system", "instruction", "persona"]):
                if isinstance(node.value, ast.Constant) and isinstance(node.value.value, str):
                    prompt_str = node.value.value.strip()
                    if len(prompt_str) > 15:
                        self._register_prompt(target_name, prompt_str)

        self.generic_visit(node)

    def _check_prompt_call(self, node: ast.Call):
        call_id = ""
        if isinstance(node.func, ast.Name):
            call_id = node.func.id
        elif isinstance(node.func, ast.Attribute):
            call_id = node.func.attr

        if call_id in ("SystemMessage", "ChatPromptTemplate", "from_messages", "from_template"):
            for arg in node.args:
                if isinstance(arg, ast.Constant) and isinstance(arg.value, str) and len(arg.value) > 20:
                    self._register_prompt(call_id, arg.value)
                elif isinstance(arg, ast.Dict):
                    for val in arg.values:
                        if isinstance(val, ast.Constant) and isinstance(val.value, str) and len(val.value) > 20:
                            self._register_prompt(f"{call_id}_dict", val.value)

    def _register_prompt(self, var_name: str, content: str):
        # Extract template parameters like {query}, {context}
        params = re.findall(r"\{([a-zA-Z0-9_]+)\}", content)
        # Classify prompt
        low = content.lower()
        if "step-by-step" in low or "think" in low:
            p_type = "cot"
        elif "you are" in low or "expert" in low or "assistant" in low:
            p_type = "system"
        elif "do not" in low or "never" in low or "refuse" in low:
            p_type = "guardrail"
        else:
            p_type = "role_play"

        info = SystemPromptInfo(
            source_file=self.filepath,
            variable_name=var_name,
            content=content,
            prompt_type=p_type,
            tokens_estimate=len(content.split()) * 4 // 3,
            parameters=list(set(params)),
        )
        self.system_prompts.append(info)


def scan_codebase(root_path: str) -> IngestionResult:
    """Traverse directory, filter bloat, parse AST, and build IngestionResult."""
    root = Path(root_path).resolve()
    project_name = root.name if root.name else "GenAI-Project"

    total_scanned = 0
    python_parsed = 0
    bloat_ignored = 0
    total_loc = 0

    all_prompts: List[SystemPromptInfo] = []
    framework_map: Dict[str, FrameworkDetection] = {}
    classes_funcs: Dict[str, List[str]] = {}
    call_graph: Dict[str, List[str]] = {}
    env_keys: Set[str] = set()

    for current_dir, dirs, files in os.walk(root):
        # In-place filter out bloat directories
        dirs[:] = [d for d in dirs if d not in BLOAT_DIR_NAMES and not d.startswith(".")]

        rel_dir = os.path.relpath(current_dir, root)
        if any(part in BLOAT_DIR_NAMES for part in rel_dir.split(os.sep)):
            bloat_ignored += len(files) + len(dirs)
            continue

        for filename in files:
            total_scanned += 1
            ext = os.path.splitext(filename)[1].lower()

            if ext in BINARY_EXTENSIONS or filename.startswith("."):
                bloat_ignored += 1
                continue

            filepath = os.path.join(current_dir, filename)
            rel_path = os.path.relpath(filepath, root)

            if ext == ".py":
                python_parsed += 1
                try:
                    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
                        code = f.read()

                    loc = len([line for line in code.splitlines() if line.strip() and not line.strip().startswith("#")])
                    total_loc += loc

                    tree = ast.parse(code, filename=rel_path)
                    visitor = GenAIASTVisitor(rel_path)
                    visitor.visit(tree)

                    all_prompts.extend(visitor.system_prompts)
                    env_keys.update(visitor.env_lookups)

                    classes_funcs[rel_path] = [f"class {c}" for c in visitor.classes] + [f"def {fn}" for fn in visitor.functions]
                    if visitor.functions:
                        call_graph[rel_path] = visitor.calls[:15]

                    # Match frameworks
                    for imp_mod, _ in visitor.imports:
                        imp_lower = imp_mod.lower()
                        for key, (display_name, category) in FRAMEWORK_MAPPINGS.items():
                            if imp_lower.startswith(key):
                                if display_name not in framework_map:
                                    framework_map[display_name] = FrameworkDetection(
                                        framework_name=display_name,
                                        category=category,
                                        imported_symbols=[],
                                        source_files=[],
                                    )
                                if rel_path not in framework_map[display_name].source_files:
                                    framework_map[display_name].source_files.append(rel_path)
                                if imp_mod not in framework_map[display_name].imported_symbols:
                                    framework_map[display_name].imported_symbols.append(imp_mod)

                except Exception as err:
                    # Non-fatal: Record file with parsing warning
                    classes_funcs[rel_path] = [f"/* SyntaxError: {str(err)} */"]

    stats = IngestionStats(
        total_files_scanned=total_scanned,
        python_files_parsed=python_parsed,
        ignored_bloat_files=bloat_ignored,
        ignored_patterns=list(BLOAT_DIR_NAMES),
        total_loc=total_loc,
    )

    return IngestionResult(
        project_name=project_name,
        root_directory=str(root),
        stats=stats,
        system_prompts=all_prompts,
        frameworks=list(framework_map.values()),
        ast_call_graph=call_graph,
        classes_and_functions=classes_funcs,
        raw_env_lookups=sorted(list(env_keys)),
    )
