from pathlib import Path
from pypdf import PdfReader


SUPPORTED_EXTENSIONS = {".txt", ".md", ".pdf"}


def load_text_file(file_path: Path) -> str:
    """Load a plain-text or Markdown file."""

    return file_path.read_text(
        encoding="utf-8",
        errors="ignore",
    )


def load_pdf_file(file_path: Path) -> str:
    """Extract text from a PDF file."""

    reader = PdfReader(str(file_path))

    pages = []

    for page in reader.pages:
        text = page.extract_text()

        if text:
            pages.append(text)

    return "\n\n".join(pages)


def load_document(file_path: Path) -> str:
    """Load a single supported document."""

    extension = file_path.suffix.lower()

    if extension in {".txt", ".md"}:
        return load_text_file(file_path)

    if extension == ".pdf":
        return load_pdf_file(file_path)

    raise ValueError(
        f"Unsupported file type: {extension}"
    )


def load_all_documents(documents_dir: str | Path) -> list[dict]:
    """
    Recursively load all supported documents.

    Returns a list of dictionaries containing:
    - source
    - file_type
    - content
    """

    documents_dir = Path(documents_dir)

    if not documents_dir.exists():
        raise FileNotFoundError(
            f"Documents directory does not exist: {documents_dir}"
        )

    documents = []

    for file_path in sorted(documents_dir.rglob("*")):

        if not file_path.is_file():
            continue

        if file_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue

        try:
            content = load_document(file_path)

            if not content.strip():
                print(f"WARNING: Empty document: {file_path}")
                continue

            documents.append(
                {
                    "source": str(
                        file_path.relative_to(documents_dir)
                    ),
                    "file_type": file_path.suffix.lower(),
                    "content": content,
                }
            )

            print(
                f"Loaded: {file_path.relative_to(documents_dir)} "
                f"({len(content):,} characters)"
            )

        except Exception as error:
            print(
                f"WARNING: Failed to load {file_path}: {error}"
            )

    return documents