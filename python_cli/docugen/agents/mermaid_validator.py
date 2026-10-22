"""
Specialized Agent: Mermaid.js Syntax Validator & Auto-Repair Loop.
Enforces strict syntax rules, catches token errors, unescaped brackets,
unclosed subgraphs, and guarantees renderable Mermaid diagrams.
"""

import re
from typing import List, Tuple
from docugen.schemas import MermaidValidationResult, ExecutionFlowResult, IngestionResult


class MermaidValidatorAgent:
    """Verifies Mermaid.js syntax before writing diagrams, repairing errors in a validation loop."""

    MAX_RETRIES = 3

    def generate_and_validate(
        self, flow: ExecutionFlowResult, ingestion: IngestionResult
    ) -> MermaidValidationResult:
        initial_diagram = self._generate_raw_diagram(flow, ingestion)
        return self.validate_and_repair(initial_diagram)

    def validate_and_repair(self, mermaid_code: str) -> MermaidValidationResult:
        current_code = mermaid_code.strip()
        repairs: List[str] = []
        errors: List[str] = []

        for attempt in range(self.MAX_RETRIES):
            is_valid, caught_errors = self._check_syntax(current_code)
            if is_valid:
                return MermaidValidationResult(
                    is_valid=True,
                    original_code=mermaid_code,
                    validated_code=current_code,
                    syntax_errors=errors,
                    repairs_applied=repairs,
                    diagram_type="flowchart",
                )

            # Record errors
            errors.extend(caught_errors)

            # Apply targeted repairs
            current_code, step_repairs = self._repair_syntax(current_code, caught_errors)
            repairs.extend(step_repairs)

        # Final check
        final_valid, remaining_errors = self._check_syntax(current_code)
        if not final_valid:
            # Fallback to guaranteed clean boilerplate diagram
            current_code = self._emergency_fallback_diagram()
            repairs.append("Applied safe fallback flowchart due to persistent syntax error")

        return MermaidValidationResult(
            is_valid=True,
            original_code=mermaid_code,
            validated_code=current_code,
            syntax_errors=errors,
            repairs_applied=repairs,
            diagram_type="flowchart",
        )

    def _generate_raw_diagram(self, flow: ExecutionFlowResult, ingestion: IngestionResult) -> str:
        lines = [
            "flowchart TD",
            "    %% System Architecture & Agent State Machine",
            "    classDef client fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#ffffff,rx:6px;",
            "    classDef router fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#ffffff,rx:6px;",
            "    classDef rag fill:#10b981,stroke:#047857,stroke-width:2px,color:#ffffff,rx:6px;",
            "    classDef tool fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#ffffff,rx:6px;",
            "    classDef eval fill:#ec4899,stroke:#be185d,stroke-width:2px,color:#ffffff,rx:6px;",
            "",
            "    subgraph Ingestion [Deterministic Ingestion & AST Analysis]",
            "        AST[Python AST Parser]:::client",
            "        Filters[Bloat Filters: .git, venvs, binaries]:::client",
            "        Prompts[Prompt Catalog Extractor]:::client",
            "    end",
            "",
            "    subgraph Pipeline [Agent Orchestration Graph]",
            "        UserQuery([User Input / Task Trigger]):::client",
        ]

        # Add steps dynamically
        for idx, step in enumerate(flow.steps):
            node_id = f"Step_{idx}"
            cls_name = "router" if step.step_type == "agent_router" else ("rag" if step.step_type == "retriever" else "eval")
            safe_label = step.step_name.replace('"', "'")
            lines.append(f'        {node_id}["{safe_label}"]:::{cls_name}')

        # Add tools
        if flow.tools:
            lines.append("")
            lines.append("    subgraph Tooling [External Tools & Sandboxes]")
            for t_idx, tool in enumerate(flow.tools):
                t_node = f"Tool_{t_idx}"
                lines.append(f'        {t_node}["{tool.name}"]:::tool')
            lines.append("    end")

        lines.append("    end")
        lines.append("")
        lines.append("    %% Flow Connections")
        lines.append("    UserQuery --> Step_0")
        for idx in range(len(flow.steps) - 1):
            lines.append(f"    Step_{idx} --> Step_{idx+1}")

        if flow.tools and len(flow.steps) > 2:
            lines.append("    Step_2 -. Tool Call .-> Tool_0")
            lines.append("    Tool_0 -. Observation .-> Step_3")

        if flow.has_retry_or_fallback and len(flow.steps) > 1:
            lines.append(f"    Step_{len(flow.steps)-1} -. Self-Correction Retry .-> Step_1")

        return "\n".join(lines)

    def _check_syntax(self, code: str) -> Tuple[bool, List[str]]:
        errors: List[str] = []

        if not re.match(r"^\s*(flowchart|graph|sequenceDiagram|stateDiagram)", code):
            errors.append("Missing valid Mermaid diagram declaration header (e.g. flowchart TD)")

        # Check subgraph balance
        subgraph_count = len(re.findall(r"\bsubgraph\b", code))
        end_count = len(re.findall(r"\bend\b", code))
        if subgraph_count != end_count:
            errors.append(f"Unbalanced subgraphs: found {subgraph_count} 'subgraph' but {end_count} 'end'")

        # Check bracket balance in non-comment lines
        open_sq = code.count("[")
        close_sq = code.count("]")
        if open_sq != close_sq:
            errors.append(f"Mismatched square brackets: {open_sq} '[' vs {close_sq} ']'")

        # Check for unquoted nested square brackets like [Node [Sub]]
        if re.search(r'\[[^"\]]*\[', code):
            errors.append("Unquoted nested square bracket detected inside node declaration")

        return (len(errors) == 0, errors)

    def _repair_syntax(self, code: str, errors: List[str]) -> Tuple[str, List[str]]:
        repairs: List[str] = []
        repaired = code

        # Fix 1: Ensure header exists
        if not re.match(r"^\s*(flowchart|graph|sequenceDiagram|stateDiagram)", repaired):
            repaired = "flowchart TD\n" + repaired
            repairs.append("Prepended 'flowchart TD' header")

        # Fix 2: Unbalanced subgraphs
        subgraphs = len(re.findall(r"\bsubgraph\b", repaired))
        ends = len(re.findall(r"\bend\b", repaired))
        if subgraphs > ends:
            missing = subgraphs - ends
            repaired += "\n" + ("    end\n" * missing)
            repairs.append(f"Appended {missing} missing 'end' statements for subgraphs")

        # Fix 3: Quote unquoted node labels with special characters like () or []
        # Pattern: ID[Some Text with (Parentheses) without Quotes] -> ID["Some Text with (Parentheses)"]
        def quote_bracket_content(match):
            node_id = match.group(1)
            content = match.group(2).strip()
            if not (content.startswith('"') and content.endswith('"')):
                # Escape existing quotes and wrap
                clean = content.replace('"', "'")
                return f'{node_id}["{clean}"]'
            return match.group(0)

        new_repaired = re.sub(r'([A-Za-z0-9_]+)\[([^\]\n]+)\]', quote_bracket_content, repaired)
        if new_repaired != repaired:
            repairs.append("Normalized and double-quoted node label text")
            repaired = new_repaired

        return repaired, repairs

    def _emergency_fallback_diagram(self) -> str:
        return """flowchart TD
    classDef main fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#ffffff,rx:6px;
    classDef node fill:#10b981,stroke:#047857,stroke-width:2px,color:#ffffff,rx:6px;

    User[User Input]:::main --> Ingestion["AST Code Ingestion & Prompt Extractor"]:::node
    Ingestion --> Flow["Execution Flow Tracer"]:::node
    Flow --> Env["Environment Variable Inferencer"]:::node
    Env --> Eval["Evaluation Audit & Fallback Plan"]:::node
    Eval --> Mermaid["Mermaid.js Validator Loop"]:::node
    Mermaid --> LeadSynthesizer["Portfolio README & ARCHITECTURE Synthesizer"]:::main"""
