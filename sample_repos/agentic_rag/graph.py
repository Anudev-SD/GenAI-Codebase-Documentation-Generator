import os
from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from tavily import TavilyClient
from prompts import ROUTER_SYSTEM_PROMPT, GROUNDED_GENERATION_PROMPT

class AgentState(TypedDict):
    query: str
    route: str
    documents: List[str]
    generation: str
    retry_count: int

def route_query_node(state: AgentState) -> AgentState:
    api_key = os.getenv("OPENAI_API_KEY")
    # In real flow: LLM call with ROUTER_SYSTEM_PROMPT
    query = state["query"].lower()
    if "news" in query or "latest" in query:
        state["route"] = "web_search"
    else:
        state["route"] = "vector_search"
    return state

def vector_retrieve_node(state: AgentState) -> AgentState:
    # Query Chroma
    state["documents"] = ["Architecture overview chunk", "Agent state machine chunk"]
    return state

def web_search_fallback_node(state: AgentState) -> AgentState:
    tavily_key = os.getenv("TAVILY_API_KEY")
    client = TavilyClient(api_key=tavily_key)
    results = client.search(query=state["query"])
    state["documents"] = [r["content"] for r in results.get("results", [])]
    return state

def generate_node(state: AgentState) -> AgentState:
    # Grounded generation with GROUNDED_GENERATION_PROMPT
    state["generation"] = f"Answer synthesized from {len(state['documents'])} context snippets."
    return state

def build_workflow():
    workflow = StateGraph(AgentState)
    workflow.add_node("router", route_query_node)
    workflow.add_node("retrieve", vector_retrieve_node)
    workflow.add_node("web_search", web_search_fallback_node)
    workflow.add_node("generate", generate_node)

    workflow.set_entry_point("router")
    workflow.add_conditional_edges(
        "router",
        lambda s: s["route"],
        {
            "vector_search": "retrieve",
            "web_search": "web_search",
        }
    )
    workflow.add_edge("retrieve", "generate")
    workflow.add_edge("web_search", "generate")
    workflow.add_edge("generate", END)
    return workflow.compile()
