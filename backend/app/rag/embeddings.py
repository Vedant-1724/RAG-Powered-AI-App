from typing import Sequence

import torch
from sentence_transformers import SentenceTransformer


MODEL_NAME = "all-MiniLM-L6-v2"
EMBEDDING_DIMENSION = 384
DEFAULT_BATCH_SIZE = 32

_device = "cuda" if torch.cuda.is_available() else "cpu"

_model = None


def get_embedding_model() -> SentenceTransformer:
    """
    Load and return the Sentence Transformer embedding model.

    The model is loaded only once and reused for subsequent calls.
    """
    global _model

    if _model is None:
        print(f"Loading embedding model: {MODEL_NAME}")
        print(f"Embedding device: {_device}")

        _model = SentenceTransformer(
            MODEL_NAME,
            device=_device,
        )

    return _model


def embed_texts(
    texts: Sequence[str],
    batch_size: int = DEFAULT_BATCH_SIZE,
) -> list[list[float]]:
    """
    Generate embeddings for a collection of texts.

    Embeddings are generated in batches to avoid excessive
    memory usage with large document collections.
    """

    if not texts:
        return []

    model = get_embedding_model()

    embeddings = model.encode(
        list(texts),
        batch_size=batch_size,
        show_progress_bar=True,
        normalize_embeddings=True,
        convert_to_numpy=True,
    )

    return embeddings.tolist()


def embed_text(text: str) -> list[float]:
    """
    Generate an embedding for a single text string.
    """

    if not text or not text.strip():
        raise ValueError("Text cannot be empty.")

    embeddings = embed_texts([text])

    return embeddings[0]


def get_embedding_dimension() -> int:
    """
    Return the expected embedding dimension.
    """
    return EMBEDDING_DIMENSION