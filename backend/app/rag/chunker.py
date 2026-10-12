from transformers import AutoTokenizer


CHUNK_SIZE = 220
CHUNK_OVERLAP = 40

TOKENIZER_NAME = "sentence-transformers/all-MiniLM-L6-v2"

_tokenizer = None


def get_tokenizer():
    """
    Load the tokenizer associated with the embedding model.

    The tokenizer is used only for measuring and chunking text.
    The embedding model itself is not loaded at this stage.
    """
    global _tokenizer

    if _tokenizer is None:
        _tokenizer = AutoTokenizer.from_pretrained(TOKENIZER_NAME)

    return _tokenizer


def chunk_text(
    text: str,
    chunk_size: int = CHUNK_SIZE,
    chunk_overlap: int = CHUNK_OVERLAP,
) -> list[str]:
    """
    Split text into overlapping token-based chunks.
    """

    if not text or not text.strip():
        return []

    if chunk_overlap >= chunk_size:
        raise ValueError(
            "chunk_overlap must be smaller than chunk_size."
        )

    tokenizer = get_tokenizer()

    # Convert the entire document into token IDs.
    # We only use the tokenizer here; no neural-network inference occurs.
    token_ids = tokenizer.encode(
        text,
        add_special_tokens=False,
    )

    chunks = []

    start = 0
    step = chunk_size - chunk_overlap

    while start < len(token_ids):

        end = min(
            start + chunk_size,
            len(token_ids),
        )

        chunk_token_ids = token_ids[start:end]

        chunk = tokenizer.decode(
            chunk_token_ids,
            skip_special_tokens=True,
            clean_up_tokenization_spaces=True,
        )

        chunk = chunk.strip()

        if chunk:
            chunks.append(chunk)

        start += step

    return chunks


def chunk_documents(
    documents: list[dict],
    chunk_size: int = CHUNK_SIZE,
    chunk_overlap: int = CHUNK_OVERLAP,
) -> list[dict]:
    """
    Chunk every loaded document while preserving source metadata.
    """

    all_chunks = []

    for document in documents:

        chunks = chunk_text(
            document["content"],
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )

        for index, chunk in enumerate(chunks):

            all_chunks.append(
                {
                    "chunk_id": (
                        f"{document['source']}::chunk_{index}"
                    ),
                    "source": document["source"],
                    "chunk_index": index,
                    "content": chunk,
                }
            )

    return all_chunks