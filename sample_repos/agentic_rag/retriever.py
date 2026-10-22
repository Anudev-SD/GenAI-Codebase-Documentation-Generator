import os
import chromadb
from typing import List, Dict

class KnowledgeRetriever:
    """Retriever connected to ChromaDB vector store."""
    def __init__(self):
        persist_dir = os.getenv("CHROMA_PERSIST_DIR", "./.chroma_db")
        self.client = chromadb.PersistentClient(path=persist_dir)
        self.collection = self.client.get_or_create_collection("genai_docs")

    def retrieve(self, query: str, top_k: int = 4) -> List[Dict]:
        results = self.collection.query(query_texts=[query], n_results=top_k)
        return results["documents"][0] if results["documents"] else []
