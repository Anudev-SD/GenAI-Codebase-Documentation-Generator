"""
Specialized Agent: Evaluation Metrics Extractor & Auditor.
Parses real evaluation logs (Ragas, TruLens, DeepEval JSONs) or gracefully
falls back to synthesizing an 'Intended Evaluation Plan'.
"""

import json
import os
from pathlib import Path
from typing import List, Optional
from docugen.schemas import (
    IngestionResult,
    EvaluationAuditResult,
    EvalMetricEntry,
)

EVAL_FILE_CANDIDATES = [
    "eval_results.json",
    "ragas_eval.json",
    "ragas_results.json",
    "benchmark.json",
    "evaluation_metrics.json",
    "trulens_eval.json",
    "metrics.json",
]


class EvalExtractorAgent:
    """Extracts benchmark metrics or constructs an Intended Evaluation Plan."""

    def audit(self, ingestion: IngestionResult) -> EvaluationAuditResult:
        root = Path(ingestion.root_directory)
        found_eval_file: Optional[Path] = None

        # Search for evaluation JSON files
        for candidate in EVAL_FILE_CANDIDATES:
            p = root / candidate
            if p.exists() and p.is_file():
                found_eval_file = p
                break
            # Also check tests/ or evals/ subfolders
            for sub in ["tests", "evals", "evaluation", "benchmarks"]:
                p_sub = root / sub / candidate
                if p_sub.exists() and p_sub.is_file():
                    found_eval_file = p_sub
                    break
            if found_eval_file:
                break

        if found_eval_file:
            try:
                with open(found_eval_file, "r", encoding="utf-8") as f:
                    data = json.load(f)

                entries = self._parse_json_metrics(data, str(found_eval_file.name))
                if entries:
                    fw_detected = "Ragas" if any("ragas" in e.metric_name.lower() for e in entries) else "Custom Benchmark"
                    return EvaluationAuditResult(
                        has_real_eval_data=True,
                        eval_framework=fw_detected,
                        metrics=entries,
                        overall_summary=f"Extracted {len(entries)} benchmark metrics from `{found_eval_file.name}`.",
                        is_fallback_plan=False,
                        recommended_eval_dataset=f"Gold standard test dataset configured in `{found_eval_file.name}`",
                        test_run_command="pytest tests/test_eval.py --ragas-report",
                    )
            except Exception:
                pass

        # Fallback: Synthesize Intended Evaluation Plan
        return self._generate_intended_plan(ingestion)

    def _parse_json_metrics(self, data: dict, filename: str) -> List[EvalMetricEntry]:
        entries: List[EvalMetricEntry] = []
        # Support dict mapping metric -> score, or nested {"metrics": {...}}
        metric_dict = data.get("metrics", data)

        for key, val in metric_dict.items():
            if isinstance(val, (int, float)):
                score_float = float(val)
                # Normalize if on 0-100 scale
                if score_float > 1.0 and score_float <= 100.0:
                    score_float = score_float / 100.0

                cat = "generation"
                low_k = key.lower()
                if "precision" in low_k or "recall" in low_k or "retriev" in low_k:
                    cat = "retrieval"
                elif "latency" in low_k or "time" in low_k:
                    cat = "latency"
                elif "cost" in low_k:
                    cat = "cost"
                elif "harm" in low_k or "toxic" in low_k or "bias" in low_k:
                    cat = "safety"

                entries.append(EvalMetricEntry(
                    metric_name=key.replace("_", " ").title(),
                    score=round(score_float, 3),
                    target=0.85,
                    category=cat,
                    benchmark_source=filename,
                ))

        return entries

    def _generate_intended_plan(self, ingestion: IngestionResult) -> EvaluationAuditResult:
        fw_names = {f.framework_name for f in ingestion.frameworks}
        is_rag = any(f.category == "vector_store" for f in ingestion.frameworks)

        planned_metrics = [
            EvalMetricEntry(
                metric_name="Context Precision (Ragas)",
                score=None,
                target=0.88,
                category="retrieval",
                benchmark_source="Intended Plan (Golden Evaluation Set)",
            ),
            EvalMetricEntry(
                metric_name="Context Recall (Ragas)",
                score=None,
                target=0.85,
                category="retrieval",
                benchmark_source="Intended Plan (Golden Evaluation Set)",
            ),
            EvalMetricEntry(
                metric_name="Faithfulness / Hallucination Rate",
                score=None,
                target=0.95,
                category="generation",
                benchmark_source="Intended Plan (LLM-as-a-Judge)",
            ),
            EvalMetricEntry(
                metric_name="Answer Relevancy",
                score=None,
                target=0.90,
                category="generation",
                benchmark_source="Intended Plan (Semantic Similarity)",
            ),
            EvalMetricEntry(
                metric_name="P95 End-to-End Latency",
                score=None,
                target=0.75,
                category="latency",
                benchmark_source="Intended Plan (Target: < 2.5s)",
            ),
        ]

        summary = (
            "No historical evaluation JSON found in repository. Synthesized an 'Intended Evaluation Plan' "
            "following industry-standard Ragas and TruLens triad methodologies (Retrieval Precision, Faithfulness, "
            "and Relevancy) ready for CI/CD integration."
        )

        return EvaluationAuditResult(
            has_real_eval_data=False,
            eval_framework="Ragas Triad (Intended)",
            metrics=planned_metrics,
            overall_summary=summary,
            is_fallback_plan=True,
            recommended_eval_dataset="50 Curated Golden Q&A Ground-Truth pairs with relevant doc passages",
            test_run_command="python -m pytest evals/test_ragas_benchmarks.py --cov",
        )
