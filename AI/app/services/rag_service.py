import re
import math
from collections import Counter
from app.services.llm_service import generate_response

class CareerVectorStore:
    """
    In-memory semantic vector store supporting document chunking,
    TF-IDF term-frequency embedding vectors, and cosine similarity ranking.
    Zero external database dependency, instant indexing, resilient execution.
    """
    def __init__(self):
        self.documents = [] # list of {"id": str, "text": str, "vector": dict, "metadata": dict}
        self.doc_freqs = Counter()
        self.num_docs = 0

    def add_document(self, doc_id: str, text: str, metadata: dict = None):
        if not text or not text.strip():
            return
        
        chunks = self.chunk_text(text, chunk_size=200, overlap=40)
        for idx, chunk in enumerate(chunks):
            tokens = self.tokenize(chunk)
            if not tokens:
                continue
            tf = Counter(tokens)
            chunk_id = f"{doc_id}_chunk_{idx}"
            self.documents.append({
                "id": chunk_id,
                "text": chunk,
                "tf": tf,
                "metadata": metadata or {}
            })
            for term in set(tokens):
                self.doc_freqs[term] += 1
            self.num_docs += 1

    def chunk_text(self, text: str, chunk_size: int = 200, overlap: int = 40) -> list:
        words = text.split()
        if len(words) <= chunk_size:
            return [text]
        chunks = []
        i = 0
        while i < len(words):
            chunk = " ".join(words[i:i + chunk_size])
            chunks.append(chunk)
            i += (chunk_size - overlap)
        return chunks

    def tokenize(self, text: str) -> list:
        return re.findall(r"\b[a-zA-Z0-9_]{2,}\b", text.lower())

    def search(self, query: str, top_k: int = 3) -> list:
        query_tokens = self.tokenize(query)
        if not query_tokens or self.num_docs == 0:
            return []

        q_tf = Counter(query_tokens)
        q_vec = {}
        for term, count in q_tf.items():
            idf = math.log((self.num_docs + 1) / (self.doc_freqs.get(term, 0) + 1)) + 1
            q_vec[term] = count * idf

        q_norm = math.sqrt(sum(v ** 2 for v in q_vec.values()))
        if q_norm == 0:
            return []

        scored_docs = []
        for doc in self.documents:
            doc_vec = {}
            for term, count in doc["tf"].items():
                idf = math.log((self.num_docs + 1) / (self.doc_freqs.get(term, 0) + 1)) + 1
                doc_vec[term] = count * idf

            doc_norm = math.sqrt(sum(v ** 2 for v in doc_vec.values()))
            if doc_norm == 0:
                continue

            dot_product = sum(q_vec.get(term, 0) * doc_vec.get(term, 0) for term in doc_vec)
            score = dot_product / (q_norm * doc_norm)
            if score > 0.05:
                scored_docs.append({
                    "id": doc["id"],
                    "text": doc["text"],
                    "score": round(score, 4),
                    "metadata": doc["metadata"]
                })

        scored_docs.sort(key=lambda x: x["score"], reverse=True)
        return scored_docs[:top_k]

# Global shared instance for session document storage
global_vector_store = CareerVectorStore()

# Seed with standard career and hiring domain knowledge
CAREER_KNOWLEDGE_BASE = [
    "ATS systems screen resumes using keyword matching against target job descriptions. Resumes should use standard section titles such as Experience, Skills, Education, and Projects without graphic tables or multi-column text that confuses OCR parsers.",
    "The Google XYZ formula for resume bullet points states: Accomplished [X], as measured by [Y], by doing [Z]. For example: Reduced database query latency by 45% (Y) by implementing Redis cache-aside architecture and composite B-tree indexing (Z).",
    "In technical interviews, interviewers assess problem-solving structure, edge case identification, Big-O algorithmic time and space complexity, and clean code principles before final correctness.",
    "System design interviews for senior software engineers require analyzing functional and non-functional requirements, estimating scale (QPS, storage, bandwidth), defining high-level API schemas, choosing data stores, and designing for high availability and partition tolerance (CAP theorem)."
]

for idx, entry in enumerate(CAREER_KNOWLEDGE_BASE):
    global_vector_store.add_document(f"kb_seed_{idx}", entry, {"type": "knowledge_base"})

def index_user_resume(user_id: str, resume_text: str):
    """Index or update user's resume in the vector store."""
    global_vector_store.add_document(f"user_{user_id}_resume", resume_text, {"userId": user_id, "type": "user_resume"})

def query_rag(query: str, user_id: str = None, top_k: int = 3) -> dict:
    """
    Search vector store for relevant context and generate an augmented AI answer.
    """
    relevant_chunks = global_vector_store.search(query, top_k=top_k)
    context_text = "\n\n".join([f"- {chunk['text']}" for chunk in relevant_chunks])

    system_prompt = f"""
You are CareerAI with RAG (Retrieval-Augmented Generation). Use the following verified career and resume context when applicable to answer the user:
---
{context_text if context_text else 'No specific document chunks found; rely on expert software career principles.'}
---
Provide a clear, concrete, and highly actionable response.
"""
    answer = generate_response(prompt=query, system_prompt=system_prompt, temperature=0.5)

    return {
        "query": query,
        "answer": answer,
        "retrievedContexts": relevant_chunks
    }
