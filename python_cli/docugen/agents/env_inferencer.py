"""
Specialized Agent: Environment Variable Inferencer.
Cross-references AST literal lookups with detected frameworks to generate
a production-grade .env.example with security guidance and defaults.
"""

from typing import List, Dict, Set
from docugen.schemas import (
    IngestionResult,
    EnvInferenceResult,
    EnvVarDefinition,
)

PROVIDER_ENV_RULES = {
    "Google GenAI SDK": [
        ("GEMINI_API_KEY", "Google Gemini API credentials", "AIzaSy...", True),
    ],
    "OpenAI SDK": [
        ("OPENAI_API_KEY", "OpenAI API authentication key", "sk-proj-...", True),
        ("OPENAI_MODEL", "Default OpenAI chat model", "gpt-4o", False),
    ],
    "Anthropic SDK": [
        ("ANTHROPIC_API_KEY", "Anthropic Claude API token", "sk-ant-...", True),
    ],
    "LiteLLM": [
        ("LITELLM_MODEL", "Target proxy model name", "gemini/gemini-2.5-flash", False),
    ],
    "Pinecone": [
        ("PINECONE_API_KEY", "Pinecone vector database API key", "pcsk_...", True),
        ("PINECONE_INDEX_NAME", "Target Pinecone vector index", "genai-knowledge-index", True),
        ("PINECONE_ENVIRONMENT", "Pinecone cloud region", "us-east-1", False),
    ],
    "ChromaDB": [
        ("CHROMA_PERSIST_DIR", "Local persistent vector storage directory", "./.chroma_data", False),
    ],
    "Qdrant": [
        ("QDRANT_URL", "Qdrant cluster endpoint", "https://xyz.cloud.qdrant.io:6333", True),
        ("QDRANT_API_KEY", "Qdrant cloud cluster API key", "qdrant_key_...", True),
    ],
    "Weaviate": [
        ("WEAVIATE_URL", "Weaviate cluster URL", "https://xyz.weaviate.network", True),
        ("WEAVIATE_API_KEY", "Weaviate cluster API key", "weaviate_key_...", True),
    ],
    "Tavily Web Search": [
        ("TAVILY_API_KEY", "Tavily Search API key for real-time web retrieval", "tvly-...", True),
    ],
    "LangChain": [
        ("LANGCHAIN_TRACING_V2", "Enable LangSmith telemetry and traces", "true", False),
        ("LANGCHAIN_API_KEY", "LangSmith tracing API key", "lsv2_pt_...", False),
        ("LANGCHAIN_PROJECT", "LangSmith project workspace tag", "rag-portfolio-eval", False),
    ],
    "LangGraph": [
        ("LANGGRAPH_CHECKPOINT_DB", "SQLite or Postgres URI for state checkpointing", "sqlite:///checkpoints.db", False),
    ],
}


class EnvInferencerAgent:
    """Infers required and optional environment variables with sanitized templates."""

    def infer(self, ingestion: IngestionResult) -> EnvInferenceResult:
        fw_names = {f.framework_name for f in ingestion.frameworks}
        required_list: List[EnvVarDefinition] = []
        optional_list: List[EnvVarDefinition] = []
        added_keys: Set[str] = set()

        # 1. Inspect direct AST os.getenv / os.environ discoveries
        for raw_key in ingestion.raw_env_lookups:
            if raw_key in added_keys:
                continue
            is_req = "key" in raw_key.lower() or "secret" in raw_key.lower() or "token" in raw_key.lower()
            var_def = EnvVarDefinition(
                name=raw_key,
                service="Application Config",
                required=is_req,
                description=f"Runtime environment variable referenced in AST ({raw_key})",
                example_value=f"YOUR_{raw_key}",
                inferred_from="os.getenv() in source code",
            )
            if is_req:
                required_list.append(var_def)
            else:
                optional_list.append(var_def)
            added_keys.add(raw_key)

        # 2. Add framework-specific conventions
        for fw in fw_names:
            if fw in PROVIDER_ENV_RULES:
                for key, desc, example, is_req in PROVIDER_ENV_RULES[fw]:
                    if key not in added_keys:
                        var_def = EnvVarDefinition(
                            name=key,
                            service=fw,
                            required=is_req,
                            description=desc,
                            example_value=example,
                            inferred_from=f"Import of {fw} library",
                        )
                        if is_req:
                            required_list.append(var_def)
                        else:
                            optional_list.append(var_def)
                        added_keys.add(key)

        # Fallback if empty
        if not required_list and not optional_list:
            required_list.append(EnvVarDefinition(
                name="AI_PROVIDER_API_KEY",
                service="Core Model",
                required=True,
                description="LLM provider API key for generation and embeddings",
                example_value="sk-your-model-key",
                inferred_from="Generative AI baseline requirement",
            ))

        # Build clean .env.example string
        lines = [
            "# ==================================================================",
            f"# {ingestion.project_name} - Environment Configuration Template",
            "# Copy this file to .env and populate with your credentials",
            "# ==================================================================",
            "",
            "# --- REQUIRED CREDENTIALS ---",
        ]
        for v in required_list:
            lines.append(f"# {v.description} (Inferred from: {v.inferred_from})")
            lines.append(f"{v.name}={v.example_value}")
            lines.append("")

        if optional_list:
            lines.append("# --- OPTIONAL SETTINGS & TELEMETRY ---")
            for v in optional_list:
                lines.append(f"# {v.description}")
                lines.append(f"{v.name}={v.example_value}")
                lines.append("")

        dotenv_text = "\n".join(lines)

        return EnvInferenceResult(
            required_vars=required_list,
            optional_vars=optional_list,
            dotenv_template=dotenv_text,
        )
