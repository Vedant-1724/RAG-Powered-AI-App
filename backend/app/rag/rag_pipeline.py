from app.rag.generator import generate_answer
from app.rag.retriever import retrieve


DEFAULT_TOP_K = 5


def build_context(retrieved_chunks: list[dict]) -> str:
    """Build grounded context from retrieved document chunks."""
    context_parts = []

    for index, chunk in enumerate(retrieved_chunks, start=1):
        context_parts.append(
            f"[Source {index}]\n"
            f"Document: {chunk['source']}\n"
            f"Page/Chunk: {chunk['chunk_index']}\n"
            f"Content:\n{chunk['content']}"
        )

    return "\n\n".join(context_parts)


def answer_question(
    question: str,
    document_id: str,
    top_k: int = DEFAULT_TOP_K,
) -> dict:
    """Retrieve document-specific context and generate a grounded answer."""

    if not question or not question.strip():
        raise ValueError("Question cannot be empty.")

    if not document_id or not document_id.strip():
        raise ValueError("Document ID cannot be empty.")

    retrieved_chunks = retrieve(
        query=question,
        document_id=document_id,
        top_k=top_k,
    )

    if not retrieved_chunks:
        return {
            "question": question,
            "answer": (
                "I couldn't find relevant information in this document "
                "to answer that question."
            ),
            "sources": [],
        }

    context = build_context(retrieved_chunks)

    answer = generate_answer(
        question=question,
        context=context,
    )

    sources = [
        {
            "source": chunk["source"],
            "chunk_index": chunk["chunk_index"],
        }
        for chunk in retrieved_chunks
    ]

    return {
        "question": question,
        "answer": answer,
        "sources": sources,
    }