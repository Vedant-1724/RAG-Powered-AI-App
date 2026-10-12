# AskWise AI — RAG-Powered Document Q&A

AskWise AI is a full-stack Retrieval-Augmented Generation (RAG) application that lets users upload a PDF or TXT document and ask questions about its contents. It retrieves relevant text chunks from the uploaded document and uses Google's Gemini model to generate an answer grounded in that context.

**Live application:** https://rag-powered-ai-app.vercel.app  
**Backend API:** https://adequate-intuition-production-c392.up.railway.app  
**API documentation:** https://adequate-intuition-production-c392.up.railway.app/docs  
**GitHub repository:** https://github.com/Vedant-1724/RAG-Powered-AI-App

> The live URLs above are based on the deployment details available when this README was prepared. Update them if your hosting provider changes a URL.

## Features

- Upload PDF and TXT documents (the UI supports files up to 10 MB).
- Extract document text and split it into chunks for retrieval.
- Generate embeddings and store/retrieve document chunks using ChromaDB.
- Ask natural-language questions about an uploaded document.
- Generate answers using Google Gemini with instructions to stay grounded in retrieved context.
- Display retrieved source chunks alongside the answer.
- Return a context-aware response when the uploaded document does not contain the requested information.
- FastAPI backend with interactive OpenAPI/Swagger documentation.
- Next.js frontend with Markdown-formatted answers and user-facing loading/error states.
- Retry handling for selected transient Gemini API errors.

## Architecture

```text
User
 |
 v
Next.js frontend (Vercel)
 |
 | /api/upload and /api/ask
 v
FastAPI backend (Railway)
 |
 +--> Document loader (PDF/TXT)
 |
 +--> Text chunker
 |
 +--> Embedding model
 |
 +--> ChromaDB vector store
 |
 +--> Retriever: relevant document chunks
 |
 +--> Google Gemini: context-grounded answer
 |
 v
Answer + retrieved source chunks
```

The frontend uses Next.js API routes to forward requests to the backend. The backend handles document ingestion, embeddings, retrieval, and answer generation.

## Technology stack

### Frontend
- Next.js
- React
- TypeScript
- `react-markdown` for rendering Markdown answers
- CSS

### Backend
- Python
- FastAPI
- Uvicorn
- Google Gen AI SDK / Gemini
- Sentence Transformers for embeddings
- ChromaDB for vector storage
- PDF and text document processing libraries

See `backend/requirements.txt` and `frontend/package.json` for the exact dependency lists.

## Repository structure

```text
RAG-Powered-AI-App/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ask.py
│   │   │   ├── schemas.py
│   │   │   └── upload.py
│   │   ├── core/
│   │   │   └── config.py
│   │   ├── rag/
│   │   │   ├── chunker.py
│   │   │   ├── document_loader.py
│   │   │   ├── embeddings.py
│   │   │   ├── generator.py
│   │   │   ├── rag_pipeline.py
│   │   │   ├── retriever.py
│   │   │   └── vector_store.py
│   │   ├── services/
│   │   │   └── ingestion_service.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ask/route.ts
│   │   │   └── upload/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── AnswerCard.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── LoadingState.tsx
│   │   └── QuestionForm.tsx
│   ├── package.json
│   └── next.config.ts
├── .gitignore
└── README.md
```

This tree lists the principal source files; supporting configuration and lock files may also be present.

## Prerequisites

- Python 3.11 (the project was developed with Python 3.11.9)
- Node.js and npm
- Git
- A Google Gemini API key

## Run locally

Open two terminals from the repository root.

### 1. Configure the backend

In Terminal 1:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
```

Open `backend/.env` and replace the placeholder API key with your own Gemini API key:

```dotenv
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
CORS_ORIGINS=http://localhost:3000
```

Keep the real API key private. Do not commit `.env` to Git.

Start the backend from the `backend` directory:

```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend URLs:
- API root: http://127.0.0.1:8000/
- Health endpoint: http://127.0.0.1:8000/health
- Swagger documentation: http://127.0.0.1:8000/docs

### 2. Configure the frontend

In Terminal 2, from the repository root:

```powershell
cd frontend
npm install
```

Create `frontend/.env.local` with:

```dotenv
BACKEND_API_URL=http://127.0.0.1:8000
```

Start the frontend:

```powershell
npm run dev
```

Open http://localhost:3000 in your browser.

> `BACKEND_API_URL` is used by server-side Next.js API routes. Do not rename it to a `NEXT_PUBLIC_` variable or expose backend secrets in browser-side code.

## Environment variables

| Variable | Used by | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | Backend | Secret API key used to access Gemini. |
| `GEMINI_MODEL` | Backend | Gemini model identifier configured for answer generation. |
| `CORS_ORIGINS` | Backend | Allowed frontend origin(s); use the actual frontend URL in deployment. |
| `BACKEND_API_URL` | Frontend | Base URL of the FastAPI backend used by Next.js API routes. |

Use `.env.example` only for non-secret placeholders. Store real credentials in local ignored environment files or your hosting provider's environment-variable/secret settings.

## Deployment

### Backend — Railway

1. Connect the GitHub repository to Railway.
2. Set the service's **Root Directory** to `/backend`.
3. Configure these variables in Railway:
   - `GEMINI_API_KEY` — your real Gemini API key
   - `GEMINI_MODEL` — the model identifier supported by your Gemini API account
   - `CORS_ORIGINS` — the deployed frontend origin, for example `https://rag-powered-ai-app.vercel.app`
4. Deploy the service and inspect build/deploy logs if it fails.
5. Verify the root URL, `/health`, and `/docs`.

Never put the actual Gemini API key in source code, the container image, or GitHub.

### Frontend — Vercel

1. Import the GitHub repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Select the **Next.js** framework preset.
4. Keep the default Next.js build and output settings unless the project requires otherwise.
5. Add `BACKEND_API_URL` as an environment variable for Production and Preview as appropriate. Set it to the Railway backend URL, without a trailing slash.
6. Deploy and test both upload and question answering from the deployed website.

After changing environment variables, trigger a new deployment so the changes are applied.

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | Basic API status message. |
| `GET` | `/health` | Health check. |
| `POST` | `/api/upload` | Upload and process a document. |
| `POST` | `/api/ask` | Ask a question about an uploaded document. |

For exact request and response schemas, use the interactive API documentation at `/docs`. The upload endpoint returns a document identifier and processing metadata. The ask endpoint uses the document identifier to retrieve relevant context and return an answer with source information.

## How to use the application

1. Open the frontend.
2. Select a PDF or TXT file within the upload size limit.
3. Upload the document and wait for processing to finish.
4. Enter a question that can be answered from the uploaded document.
5. Submit the question.
6. Read the generated answer and review the retrieved source chunks.
7. If the information is not present in the document, the system is designed to say that the context does not contain the answer rather than inventing one.

## Troubleshooting

### The frontend cannot reach the backend
- Confirm the Railway service is deployed and online.
- Open the backend `/health` endpoint.
- Verify `BACKEND_API_URL` in Vercel or `frontend/.env.local`.
- Redeploy/restart after changing environment variables.

### Upload fails
- Confirm the file is PDF or TXT and does not exceed the UI's 10 MB limit.
- Check Railway runtime logs for extraction or ingestion errors.
- Try a small text file to distinguish PDF parsing issues from API connectivity issues.

### Gemini returns an error
- Verify `GEMINI_API_KEY` is valid and configured in Railway.
- Check that `GEMINI_MODEL` is available to your API account.
- Check quota, billing, rate limits, and Gemini service status.
- Transient upstream errors can still occur; retry handling does not guarantee uninterrupted availability.

### Deployment build fails
- Read the first relevant error in Railway or Vercel build logs.
- Check that Railway uses `/backend` and Vercel uses `frontend` as their respective root directories.
- Ensure dependency files are committed and secrets or local virtual environments are not tracked.

## Security, limitations, and production considerations

- **Protect secrets:** never commit `.env`, `.env.local`, or real API keys.
- **Treat uploaded documents as private:** do not upload confidential or sensitive files to an unauthenticated demo.
- **Authentication and isolation:** before public production use, implement authentication, authorization, request limits, and per-user document access controls. Do not assume a document ID alone provides sufficient access control.
- **Persistence:** verify persistence behavior for the deployed vector database and uploaded-file storage. Local container storage may be ephemeral and can be lost on restart or redeployment; use durable storage if documents must persist.
- **Quotas and costs:** Gemini API use and hosting may have quotas or charges. Add monitoring and rate limits before broad public use.
- **Reliability:** retry logic can help with temporary provider errors, but it cannot prevent all outages or quota failures.
- **Grounding:** RAG reduces unsupported answers but cannot guarantee every generated response is correct. Check source chunks for important decisions.

This project is a learning and portfolio application. Harden the controls above before treating it as a production service for untrusted users or sensitive documents.

## Future improvements

- Add authentication and per-user document collections.
- Add durable document and vector storage.
- Add automated backend and frontend tests in CI.
- Add file deletion and document-management controls.
- Add rate limiting, usage monitoring, and cost controls.
- Improve retrieval evaluation, chunking, and source citations.
- Add support for additional document formats if needed.

## License

No license is specified in this README. Add a `LICENSE` file and update this section if you intend to publish the project under a particular open-source license.

---

Built as a full-stack RAG project to explore document ingestion, embeddings, vector search, and grounded LLM responses.
