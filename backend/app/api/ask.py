
import logging

from fastapi import APIRouter, HTTPException, status

from app.api.schemas import AskRequest, AskResponse
from app.rag.generator import GeminiServiceError
from app.rag.rag_pipeline import answer_question

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/ask", response_model=AskResponse)
def ask_question(request: AskRequest) -> AskResponse:
    document_id = request.document_id.strip()
    question = request.question.strip()

    if not document_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A document ID is required.",
        )

    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter a question.",
        )

    try:
        result = answer_question(
            question=question,
            document_id=document_id,
        )

        return AskResponse(
            document_id=document_id,
            **result,
        )

    except GeminiServiceError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=str(exc),
        ) from None

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from None

    except HTTPException:
        raise

    except Exception:
        logger.exception("Unexpected error while answering a document question.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while answering your question. Please try again.",
        ) from None
