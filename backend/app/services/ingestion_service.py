
import hashlib
import io
from pathlib import Path

from pypdf import PdfReader

from app.rag.chunker import chunk_text
from app.rag.embeddings import embed_texts
from app.rag.vector_store import add_chunks, delete_document


MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024
MAX_PDF_PAGES = 300


def ingest_document(
    file_bytes: bytes,
    filename: str,
    document_id: str,
) -> dict:
    """Validate, extract, chunk, embed, and store a PDF or TXT document."""
    if not file_bytes:
        raise ValueError("The uploaded file is empty.")

    if len(file_bytes) > MAX_UPLOAD_SIZE_BYTES:
        raise ValueError("The file exceeds the 10 MB upload limit.")

    safe_filename = Path(filename).name

    if not safe_filename or safe_filename in {".", ".."}:
        raise ValueError("Invalid filename.")

    extension = Path(safe_filename).suffix.lower()

    if extension not in {".pdf", ".txt"}:
        raise ValueError("Only PDF and TXT files are supported.")

    page_count = 0

    if extension == ".pdf":
        try:
            reader = PdfReader(io.BytesIO(file_bytes), strict=True)

            if reader.is_encrypted:
                raise ValueError("Password-protected PDFs are not supported.")

            page_count = len(reader.pages)

            if page_count == 0:
                raise ValueError("The PDF contains no pages.")

            if page_count > MAX_PDF_PAGES:
                raise ValueError("The PDF exceeds the 300-page limit.")

            page_texts = []

            for page_number, page in enumerate(reader.pages, start=1):
                text = page.extract_text() or ""
                if text.strip():
                    page_texts.append(f"[Page {page_number}]\n{text}")

            full_text = "\n\n".join(page_texts)

        except ValueError:
            raise
        except Exception as exc:
            raise ValueError(
                "The PDF could not be read. Please upload a valid PDF."
            ) from exc

        if not full_text.strip():
            raise ValueError(
                "No extractable text was found in the PDF. "
                "Scanned PDFs requiring OCR are not supported."
            )

    else:
        try:
            full_text = file_bytes.decode("utf-8-sig").strip()
        except UnicodeDecodeError as exc:
            raise ValueError(
                "The TXT file must use UTF-8 text encoding."
            ) from exc

        if not full_text:
            raise ValueError("The TXT file contains no readable text.")

    chunks_text = chunk_text(full_text)

    if not chunks_text:
        raise ValueError("No text chunks could be created from this file.")

    chunks = [
        {
            "chunk_id": f"{document_id}-{index}",
            "source": safe_filename,
            "chunk_index": index,
            "content": content,
        }
        for index, content in enumerate(chunks_text)
    ]

    embeddings = embed_texts([chunk["content"] for chunk in chunks])

    # Replace any existing collection only after extraction and embedding succeed.
    delete_document(document_id)
    add_chunks(document_id, chunks, embeddings)

    return {
        "document_id": document_id,
        "filename": safe_filename,
        "pages": page_count,
        "chunks": len(chunks),
        "sha256": hashlib.sha256(file_bytes).hexdigest(),
    }
