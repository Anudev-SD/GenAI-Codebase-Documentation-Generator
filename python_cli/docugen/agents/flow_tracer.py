"""
Specialized Agent: Execution Flow Tracer.
Traces RAG pipelines, agent loops, tool invocations, and state machines.
"""

from typing import List
from docugen.schemas import (
    IngestionResult,
    ExecutionFlowResult,
    ExecutionStep,
    ToolCallDefinition,
)


class FlowTracerAgent:
    """Analyzes AST symbols, framework combinations, and call trees to determine execution flow."""

    def trace(self, ingestion: IngestionResult) -> ExecutionFlowResult:
        fw_names = {f.framework_name for f in ingestion.frameworks}
        categories = {f.category for f in ingestion.frameworks}

        # Check architecture pattern
        has_langgraph = "LangGraph" in fw_names
        has_vector_store = "vector_store" in categories
        has_crewai = "CrewAI" in fw_names
        has_autogen = "AutoGen" in fw_names
        has_litellm = "LiteLLM" in fw_names

        tools: List[ToolCallDefinition] = []
        steps: List[ExecutionStep] = []
        pattern = "linear_rag"
        has_state_machine = False
        has_fallback = False

        # Identify tools from AST function calls and file names
        for file, calls in ingestion.ast_call_graph.items():
            for c in calls:
                c_low = c.lower()
                if "tavily" in c_low or "search" in c_low:
                    tools.append(ToolCallDefinition(
                        name="Tavily Web Search",
                        description="Executes live web search queries for dynamic context retrieval",
                        source_file=file,
                        risk_level="low",
                    ))
                elif "sandbox" in c_low or "exec" in c_low or "run_code" in c_low:
                    tools.append(ToolCallDefinition(
                        name="Python Code Sandbox",
                        description="Isolated execution environment for generated Python code snippets",
                        source_file=file,
                        risk_level="high",
                    ))
                elif "sql" in c_low or "db_query" in c_low:
                    tools.append(ToolCallDefinition(
                        name="SQL Database Connector",
                        description="Structured relational query executor with read/write safety",
                        source_file=file,
                        risk_level="medium",
                    ))

        # Deduplicate tools
        unique_tools = []
        seen_names = set()
        for t in tools:
            if t.name not in seen_names:
                unique_tools.append(t)
                seen_names.add(t.name)

        if has_langgraph or has_crewai or has_autogen:
            pattern = "agentic_rag" if has_vector_store else "multi_agent_graph"
            has_state_machine = True
            has_fallback = True

            steps = [
                ExecutionStep(
                    step_id="query_intake",
                    step_name="User Intent & Router Node",
                    step_type="agent_router",
                    inputs=["user_query", "session_state"],
                    outputs=["intent_classification", "routed_node"],
                    description="Validates incoming query and routes to either vector retrieval, tool call, or direct LLM reasoning.",
                ),
                ExecutionStep(
                    step_id="context_retrieval",
                    step_name="Dense Vector Retrieval",
                    step_type="retriever",
                    inputs=["search_query", "top_k"],
                    outputs=["raw_document_chunks", "similarity_scores"],
                    description="Queries vector store using dense embeddings to extract relevant context chunks.",
                ),
                ExecutionStep(
                    step_id="relevance_eval",
                    step_name="Relevance Grader & Self-Correction",
                    step_type="agent_router",
                    inputs=["raw_document_chunks", "user_query"],
                    outputs=["filtered_chunks", "needs_web_search"],
                    description="Evaluates context relevance. Triggers fallback web search if vector store returns low confidence.",
                ),
                ExecutionStep(
                    step_id="tool_loop",
                    step_name="Dynamic Tool Execution",
                    step_type="tool_execution",
                    inputs=["tool_name", "parameters"],
                    outputs=["tool_result_state"],
                    description="Executes external tools (e.g. web search, sandbox, APIs) when self-correction flags knowledge gaps.",
                ),
                ExecutionStep(
                    step_id="answer_synthesis",
                    step_name="Grounded Generation Node",
                    step_type="llm_node",
                    inputs=["filtered_chunks", "tool_results", "system_prompt"],
                    outputs=["grounded_response", "citations"],
                    description="Generates final answer strictly conditioned on validated context and system prompts.",
                ),
                ExecutionStep(
                    step_id="hallucination_guard",
                    step_name="Hallucination & Grounding Check",
                    step_type="fallback",
                    inputs=["grounded_response", "context_chunks"],
                    outputs=["verified_response", "state_update"],
                    description="Self-reflective verification ensuring response faithfulness before returning to user.",
                ),
            ]
            summary = "Cyclic state-machine orchestration featuring router logic, dense vector retrieval, dynamic tool fallback, and self-corrective hallucination grading."
        elif has_vector_store:
            pattern = "linear_rag"
            steps = [
                ExecutionStep(
                    step_id="ingest_embed",
                    step_name="Query Embedding Generator",
                    step_type="retriever",
                    inputs=["query"],
                    outputs=["query_vector"],
                    description="Embeds incoming user prompt using embedding model.",
                ),
                ExecutionStep(
                    step_id="vector_search",
                    step_name="Vector Store Similarity Search",
                    step_type="retriever",
                    inputs=["query_vector", "top_k"],
                    outputs=["context_documents"],
                    description="Retrieves top-K semantic nearest neighbors from vector database.",
                ),
                ExecutionStep(
                    step_id="llm_synthesis",
                    step_name="Context-Augmented Generation",
                    step_type="llm_node",
                    inputs=["context_documents", "query", "system_prompt"],
                    outputs=["final_answer"],
                    description="Synthesizes coherent response using augmented prompt context.",
                ),
            ]
            summary = "High-throughput linear RAG pipeline with dense vector indexing, similarity search, and context-augmented synthesis."
        elif has_litellm:
            pattern = "react_loop"
            has_state_machine = True
            steps = [
                ExecutionStep(
                    step_id="thought_action",
                    step_name="ReAct Thought & Plan Node",
                    step_type="agent_router",
                    inputs=["task_description", "history"],
                    outputs=["thought", "tool_action"],
                    description="Decomposes complex tasks into sequential tool actions.",
                ),
                ExecutionStep(
                    step_id="execute_action",
                    step_name="Tool Execution Node",
                    step_type="tool_execution",
                    inputs=["tool_action"],
                    outputs=["observation"],
                    description="Invokes external tool or code sandbox and captures output.",
                ),
                ExecutionStep(
                    step_id="final_answer",
                    step_name="Result Compiler",
                    step_type="llm_node",
                    inputs=["observations", "goal"],
                    outputs=["final_output"],
                    description="Compiles observations into validated output.",
                ),
            ]
            summary = "ReAct reasoning loop with iterative thought-action-observation cycles and LiteLLM multi-provider failover."
        else:
            pattern = "chain_of_thought"
            steps = [
                ExecutionStep(
                    step_id="input_prompt",
                    step_name="Prompt Ingestion & Template Formatting",
                    step_type="llm_node",
                    inputs=["raw_prompt"],
                    outputs=["formatted_messages"],
                    description="Injects system prompt instructions and prepares model parameters.",
                ),
                ExecutionStep(
                    step_id="llm_inference",
                    step_name="Model Inference & Reasoning",
                    step_type="llm_node",
                    inputs=["formatted_messages"],
                    outputs=["raw_generation"],
                    description="Executes model call with temperature, top_p, and stop tokens.",
                ),
            ]
            summary = "Direct inference pipeline conditioned by system prompts and structured prompt templates."

        return ExecutionFlowResult(
            architecture_pattern=pattern,
            workflow_summary=summary,
            steps=steps,
            tools=unique_tools,
            has_state_machine=has_state_machine,
            has_retry_or_fallback=has_fallback,
        )
