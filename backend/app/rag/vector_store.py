from pathlib import Path
import re

import chromadb


CHROMA_DIR = Path(__file__).resolve().parents[2] / "data" / "chroma"

_client = None


def get_chroma_client():
    """Create or return the persistent ChromaDB client."""
    global _client

    if _client is None:
        CHROMA_DIR.mkdir(parents=True, exist_ok=True)
        _client = chromadb.PersistentClient(path=str(CHROMA_DIR))

    return _client


def _collection_name(document_id: str) -> str:
    """Create a valid, document-specific ChromaDB collection name."""
    safe_id = re.sub(r"[^a-zA-Z0-9_-]", "-", document_id).lower()
    safe_id = safe_id.strip("-_")

    if not safe_id:
        raise ValueError("Invalid document ID.")

    # ChromaDB collection names have length constraints.
    safe_id = safe_id[:50]
    return f"doc-{safe_id}"


def get_collection(document_id: str):
    """Get the isolated collection for one uploaded document."""
    return get_chroma_client().get_or_create_collection(
        name=_collection_name(document_id),
        metadata={"description": "Document-specific RAG chunks"},
    )


def add_chunks(
    document_id: str,
    chunks: list[dict],
    embeddings: list[list[float]],
) -> None:
    """Store chunks only in the specified document collection."""
    if len(chunks) != len(embeddings):
        raise ValueError("Chunks and embeddings must have equal lengths.")

    if not chunks:
        return

    collection = get_collection(document_id)

    collection.upsert(
        ids=[chunk["chunk_id"] for chunk in chunks],
        documents=[chunk["content"] for chunk in chunks],
        metadatas=[
            {
                "source": chunk["source"],
                "chunk_index": int(chunk["chunk_index"]),
                "document_id": document_id,
            }
            for chunk in chunks
        ],
        embeddings=embeddings,
    )


def search(
    document_id: str,
    query_embedding: list[float],
    top_k: int = 5,
) -> dict:
    """Search only the collection belonging to the requested document."""
    collection = get_collection(document_id)
    count = collection.count()

    if count == 0:
        return {
            "ids": [[]],
            "documents": [[]],
            "metadatas": [[]],
            "distances": [[]],
        }

    return collection.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, count),
        include=["documents", "metadatas", "distances"],
    )


def get_collection_count(document_id: str) -> int:
    """Return the number of chunks stored for one document."""
    return get_collection(document_id).count()


def delete_document(document_id: str) -> None:
    """Delete the collection for one document."""
    client = get_chroma_client()
    name = _collection_name(document_id)

    try:
        client.delete_collection(name=name)
    except Exception:
        # A missing collection is already effectively deleted.
        pass