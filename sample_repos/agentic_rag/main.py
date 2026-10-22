import os
from graph import build_workflow

def main():
    print("Initializing Agentic RAG System...")
    app = build_workflow()
    initial_state = {
        "query": "How does the self-correction router work?",
        "route": "",
        "documents": [],
        "generation": "",
        "retry_count": 0,
    }
    result = app.invoke(initial_state)
    print("Execution complete. Generation:", result["generation"])

if __name__ == "__main__":
    main()
