from app.rag.embeddings import embed_text
from app.rag.vector_store import search


DEFAULT_TOP_K = 5


def retrieve(
    query: str,
    document_id: str,
    top_k: int = DEFAULT_TOP_K,
) -> list[dict]:
    """Retrieve relevant chunks from one specific uploaded document."""

    if not query or not query.strip():
        raise ValueError("Query cannot be empty.")

    if not document_id or not document_id.strip():
        raise ValueError("Document ID cannot be empty.")

    if top_k < 1:
        raise ValueError("top_k must be at least 1.")

    query_embedding = embed_text(query)

    results = search(
        document_id=document_id,
        query_embedding=query_embedding,
        top_k=top_k,
    )

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]
    ids = results.get("ids", [[]])[0]

    retrieved_chunks = []

    for index, content in enumerate(documents):
        metadata = metadatas[index]

        retrieved_chunks.append(
            {
                "chunk_id": ids[index],
                "content": content,
                "source": metadata["source"],
                "chunk_index": metadata["chunk_index"],
                "distance": distances[index],
                "document_id": document_id,
            }
        )

    return retrieved_chunks