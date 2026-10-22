# 🤖 GenDocuAgent (CLI)

> **Python CLI powered by Typer, Pydantic v2, and a multi-agent AST pipeline** that scans Generative AI codebases to auto-generate portfolio-ready `README.md`, `ARCHITECTURE.md`, and validated Mermaid.js diagrams.

---

## ⚡ Installation

```bash
# Clone and install in editable mode
pip install -e ./python_cli

# Or install dependencies directly
pip install typer pydantic rich
```

---

## 🚀 Quick Usage

### 1. Ingest Codebase with Deterministic AST
```bash
python -m docugen.cli scan ./sample_repos/agentic_rag
```

### 2. Generate Full Portfolio Documentation Suite
```bash
python -m docugen.cli generate ./sample_repos/agentic_rag --output-dir ./docs_output
```

### 3. Validate and Auto-Repair Mermaid.js Diagrams
```bash
python -m docugen.cli validate-mermaid --file ./docs_output/architecture.mmd
```

### 4. Audit Evaluation Metrics or Generate Intended Fallback Plan
```bash
python -m docugen.cli eval-audit ./sample_repos/agentic_rag
```

---

## 🧩 Architecture

- **Deterministic Ingestion**: Standard library Python `ast.NodeVisitor` parses system prompts, function calls, class hierarchies, and imports while skipping `.git`, `venv`, and binary bloat.
- **Pydantic v2 Strict Schemas**: Enforces strongly-typed data transfers between all pipeline stages.
- **Specialized Agents**:
  - `FlowTracerAgent`: Traces RAG pipelines, agent loops, and tool invocations.
  - `EnvInferencerAgent`: Maps imports and AST lookups to `.env.example` templates.
  - `EvalExtractorAgent`: Scans for Ragas/TruLens JSON benchmarks with Intended Evaluation Plan fallback.
  - `MermaidValidatorAgent`: Cyclic syntax check and auto-repair loop.
  - `LeadSynthesizerAgent`: Produces GitHub-ready README.md and ARCHITECTURE.md.
