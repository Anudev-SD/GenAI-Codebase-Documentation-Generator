"""
Pydantic v2 schemas enforcing strict data contracts across all pipeline stages.
"""

from typing import List, Dict, Optional, Any, Literal
from pydantic import BaseModel, Field, field_validator, model_validator


class SystemPromptInfo(BaseModel):
    """Extracted system prompt from AST or prompt catalog."""
    source_file: str = Field(..., description="File where the prompt was discovered")
    variable_name: Optional[str] = Field(None, description="Variable or identifier name")
    content: str = Field(..., description="Raw prompt text or template")
    prompt_type: Literal["system", "few_shot", "cot", "role_play", "guardrail"] = Field(
        default="system", description="Classification of the prompt"
    )
    tokens_estimate: int = Field(default=0, description="Estimated token count")
    parameters: List[str] = Field(default_factory=list, description="Template variables like {query}, {context}")


class FrameworkDetection(BaseModel):
    """Detected Generative AI frameworks, vector stores, and providers."""
    framework_name: str = Field(..., description="e.g. LangChain, LangGraph, LlamaIndex, LiteLLM")
    category: Literal["orchestration", "agent_loop", "vector_store", "llm_client", "evaluation", "memory"] = Field(
        ..., description="Architectural category"
    )
    imported_symbols: List[str] = Field(default_factory=list, description="Symbols imported via AST")
    source_files: List[str] = Field(default_factory=list, description="Files where imports occur")
    version_hint: Optional[str] = Field(None, description="Inferred or declared version")


class IngestionStats(BaseModel):
    """File scanning and bloat-filtering telemetry."""
    total_files_scanned: int = Field(..., ge=0)
    python_files_parsed: int = Field(..., ge=0)
    ignored_bloat_files: int = Field(..., ge=0)
    ignored_patterns: List[str] = Field(default_factory=list)
    total_loc: int = Field(default=0, ge=0)


class IngestionResult(BaseModel):
    """Deterministic output from Python AST ingestion layer."""
    project_name: str = Field(..., description="Repository or package name")
    root_directory: str = Field(..., description="Scanned directory path")
    stats: IngestionStats
    system_prompts: List[SystemPromptInfo] = Field(default_factory=list)
    frameworks: List[FrameworkDetection] = Field(default_factory=list)
    ast_call_graph: Dict[str, List[str]] = Field(
        default_factory=dict, description="Caller -> Callee function calls mapped via AST"
    )
    classes_and_functions: Dict[str, List[str]] = Field(
        default_factory=dict, description="File -> Defined Classes & Functions"
    )
    raw_env_lookups: List[str] = Field(
        default_factory=list, description="Literal os.getenv / os.environ keys found in AST"
    )


class ToolCallDefinition(BaseModel):
    """External tool, API, or sandbox invoked in agent loop."""
    name: str = Field(...)
    description: str = Field(...)
    source_file: str = Field(...)
    risk_level: Literal["low", "medium", "high"] = Field(default="low")


class ExecutionStep(BaseModel):
    """Single node or transition in the GenAI pipeline."""
    step_id: str = Field(..., description="e.g. retrieve_docs, check_relevance, call_llm")
    step_name: str = Field(...)
    step_type: Literal["retriever", "reranker", "llm_node", "agent_router", "tool_execution", "human_in_loop", "fallback"] = Field(...)
    inputs: List[str] = Field(default_factory=list)
    outputs: List[str] = Field(default_factory=list)
    description: str = Field(...)


class ExecutionFlowResult(BaseModel):
    """Agent 1 output: Traced execution flow and agent loop state machine."""
    architecture_pattern: Literal["linear_rag", "agentic_rag", "multi_agent_graph", "plan_and_solve", "react_loop", "chain_of_thought"] = Field(
        ..., description="Detected high-level GenAI architectural pattern"
    )
    workflow_summary: str = Field(..., description="High-level description of data and control flow")
    steps: List[ExecutionStep] = Field(default_factory=list)
    tools: List[ToolCallDefinition] = Field(default_factory=list)
    has_state_machine: bool = Field(default=False)
    has_retry_or_fallback: bool = Field(default=False)


class EnvVarDefinition(BaseModel):
    """Inferred environment variable requirement."""
    name: str = Field(..., description="e.g. OPENAI_API_KEY, PINECONE_API_KEY")
    service: str = Field(..., description="Associated provider or tool")
    required: bool = Field(default=True)
    description: str = Field(...)
    example_value: str = Field(...)
    inferred_from: str = Field(..., description="AST import or os.getenv invocation")


class EnvInferenceResult(BaseModel):
    """Agent 2 output: Comprehensive environment variable spec."""
    required_vars: List[EnvVarDefinition] = Field(default_factory=list)
    optional_vars: List[EnvVarDefinition] = Field(default_factory=list)
    dotenv_template: str = Field(..., description="Ready-to-use .env.example content")


class EvalMetricEntry(BaseModel):
    """Extracted or planned evaluation benchmark metric."""
    metric_name: str = Field(..., description="e.g. Ragas Faithfulness, Context Precision, Answer Relevancy")
    score: Optional[float] = Field(None, ge=0.0, le=1.0, description="Real score if extracted from logs")
    target: float = Field(default=0.85, ge=0.0, le=1.0, description="Target benchmark threshold")
    category: Literal["retrieval", "generation", "safety", "latency", "cost"] = Field(default="generation")
    benchmark_source: str = Field(..., description="e.g. ragas_eval.json, TruLens, or Intended Benchmark")


class EvaluationAuditResult(BaseModel):
    """Agent 3 output: Real metrics from eval logs or fallback Intended Evaluation Plan."""
    has_real_eval_data: bool = Field(..., description="True if real logs or JSON eval files were parsed")
    eval_framework: Optional[str] = Field(None, description="e.g. Ragas, TruLens, DeepEval, Promptfoo")
    metrics: List[EvalMetricEntry] = Field(default_factory=list)
    overall_summary: str = Field(...)
    is_fallback_plan: bool = Field(default=False)
    recommended_eval_dataset: Optional[str] = Field(None, description="Recommended golden evaluation dataset")
    test_run_command: str = Field(..., description="CLI command to run evals, e.g. pytest tests/eval_rag.py")


class MermaidValidationResult(BaseModel):
    """Agent 4 output: Syntax validation and repair loop result."""
    is_valid: bool = Field(..., description="Whether Mermaid.js syntax passes validation")
    original_code: str = Field(..., description="Initial Mermaid syntax")
    validated_code: str = Field(..., description="Cleaned, syntax-verified Mermaid diagram")
    syntax_errors: List[str] = Field(default_factory=list, description="Errors caught during parse checks")
    repairs_applied: List[str] = Field(default_factory=list, description="Auto-repairs executed")
    diagram_type: Literal["flowchart", "sequenceDiagram", "stateDiagram-v2"] = Field(default="flowchart")


class DocumentationBundle(BaseModel):
    """Lead Synthesizer output: Complete GitHub documentation artifacts."""
    readme_markdown: str = Field(..., description="Full portfolio-ready README.md")
    architecture_markdown: str = Field(..., description="Detailed ARCHITECTURE.md")
    mermaid_diagram: str = Field(..., description="Standalone verified Mermaid diagram")
    env_example: str = Field(..., description="Sanitized .env.example file")
    summary: str = Field(..., description="Executive summary of generated documentation")
