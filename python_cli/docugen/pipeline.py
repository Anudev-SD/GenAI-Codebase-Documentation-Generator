"""
Modular Agent Pipeline & State Machine for GenAI Documentation Generation.
Enforces strict Pydantic v2 schemas across all transitions with step logging.
"""

from typing import Optional, List, Callable, Any
from pydantic import BaseModel, Field

from docugen.schemas import (
    IngestionResult,
    ExecutionFlowResult,
    EnvInferenceResult,
    EvaluationAuditResult,
    MermaidValidationResult,
    DocumentationBundle,
)
from docugen.ingestion import scan_codebase
from docugen.agents.flow_tracer import FlowTracerAgent
from docugen.agents.env_inferencer import EnvInferencerAgent
from docugen.agents.eval_extractor import EvalExtractorAgent
from docugen.agents.mermaid_validator import MermaidValidatorAgent
from docugen.agents.synthesizer import LeadSynthesizerAgent


class PipelineState(BaseModel):
    """Pydantic v2 state passed strictly between all agent steps."""
    root_path: str
    current_stage: str = "initialized"
    ingestion: Optional[IngestionResult] = None
    flow: Optional[ExecutionFlowResult] = None
    env: Optional[EnvInferenceResult] = None
    evaluation: Optional[EvaluationAuditResult] = None
    mermaid: Optional[MermaidValidationResult] = None
    documentation: Optional[DocumentationBundle] = None
    logs: List[str] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)


class DocuGenPipeline:
    """State-machine orchestrator coordinating the 5 specialized agents."""

    def __init__(self, on_step_callback: Optional[Callable[[str, Any], None]] = None):
        self.flow_tracer = FlowTracerAgent()
        self.env_inferencer = EnvInferencerAgent()
        self.eval_extractor = EvalExtractorAgent()
        self.mermaid_validator = MermaidValidatorAgent()
        self.synthesizer = LeadSynthesizerAgent()
        self.on_step_callback = on_step_callback

    def _notify(self, stage: str, data: Any):
        if self.on_step_callback:
            self.on_step_callback(stage, data)

    def run(self, root_path: str) -> PipelineState:
        state = PipelineState(root_path=root_path)

        # Step 1: Deterministic AST Ingestion
        state.current_stage = "ast_ingestion"
        self._notify("stage_started", {"stage": "ast_ingestion", "msg": "Parsing AST and filtering bloat..."})
        state.ingestion = scan_codebase(root_path)
        state.logs.append(
            f"Ingestion complete: {state.ingestion.stats.python_files_parsed} Python files parsed, "
            f"{state.ingestion.stats.ignored_bloat_files} bloat items ignored."
        )
        self._notify("stage_completed", {"stage": "ast_ingestion", "result": state.ingestion})

        # Step 2: Execution Flow Tracer Agent
        state.current_stage = "flow_tracing"
        self._notify("stage_started", {"stage": "flow_tracing", "msg": "Tracing execution flow and agent loop..."})
        state.flow = self.flow_tracer.trace(state.ingestion)
        state.logs.append(f"Flow traced: Pattern '{state.flow.architecture_pattern}', {len(state.flow.steps)} steps.")
        self._notify("stage_completed", {"stage": "flow_tracing", "result": state.flow})

        # Step 3: Environment Variable Inferencer Agent
        state.current_stage = "env_inference"
        self._notify("stage_started", {"stage": "env_inference", "msg": "Inferring environment credentials..."})
        state.env = self.env_inferencer.infer(state.ingestion)
        state.logs.append(f"Inferred {len(state.env.required_vars)} required env vars.")
        self._notify("stage_completed", {"stage": "env_inference", "result": state.env})

        # Step 4: Evaluation Audit & Fallback Plan Agent
        state.current_stage = "eval_audit"
        self._notify("stage_started", {"stage": "eval_audit", "msg": "Auditing eval metrics or synthesizing Intended Plan..."})
        state.evaluation = self.eval_extractor.audit(state.ingestion)
        status_label = "real logs" if state.evaluation.has_real_eval_data else "Intended Evaluation Plan"
        state.logs.append(f"Evaluation audit: Loaded {len(state.evaluation.metrics)} metrics ({status_label}).")
        self._notify("stage_completed", {"stage": "eval_audit", "result": state.evaluation})

        # Step 5: Mermaid.js Syntax Validator & Auto-Repair Loop
        state.current_stage = "mermaid_validation"
        self._notify("stage_started", {"stage": "mermaid_validation", "msg": "Validating and repairing Mermaid.js syntax..."})
        state.mermaid = self.mermaid_validator.generate_and_validate(state.flow, state.ingestion)
        state.logs.append(f"Mermaid validation: Passed={state.mermaid.is_valid}, Repairs={len(state.mermaid.repairs_applied)}.")
        self._notify("stage_completed", {"stage": "mermaid_validation", "result": state.mermaid})

        # Step 6: Lead Synthesizer Agent
        state.current_stage = "lead_synthesis"
        self._notify("stage_started", {"stage": "lead_synthesis", "msg": "Assembling portfolio README and ARCHITECTURE.md..."})
        state.documentation = self.synthesizer.synthesize(
            state.ingestion, state.flow, state.env, state.evaluation, state.mermaid
        )
        state.logs.append("Lead Synthesizer: Documentation generated successfully.")
        self._notify("stage_completed", {"stage": "lead_synthesis", "result": state.documentation})

        state.current_stage = "completed"
        return state
