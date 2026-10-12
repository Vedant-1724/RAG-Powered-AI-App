from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    document_id: str = Field(
        min_length=1,
        max_length=100,
    )
    question: str = Field(
        min_length=1,
        max_length=2000,
    )


class SourceResponse(BaseModel):
    source: str
    chunk_index: int


class AskResponse(BaseModel):
    document_id: str
    question: str
    answer: str
    sources: list[SourceResponse]


class UploadResponse(BaseModel):
    document_id: str
    filename: str
    pages: int
    chunks: int