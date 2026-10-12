# AI-C1 — RAG-Powered AI App

A full-stack Retrieval-Augmented Generation (RAG) application that lets users upload their own documents and ask questions grounded in their contents.

## Overview

AI-C1 combines document processing, semantic search, prompt engineering, and a modern web interface to deliver document-grounded answers using Google's Gemini API.

## Features

- Upload PDF, TXT, and Markdown documents.
- Extract text and split documents into overlapping chunks.
- Generate semantic embeddings for document passages.
- Retrieve relevant passages for each question.
- Generate answers using retrieved context and Gemini.
- Display source documents and supporting passages.
- Handle questions that cannot be answered from the uploaded content.
- Provide loading indicators, validation, and clear error messages.
- Keep API credentials on the server.
- Isolate document retrieval by upload session.
- Deploy the frontend on Vercel and the backend on Google Cloud Run.

## Architecture

```text
User
 |
 v
Next.js Frontend (Vercel)
 |
 v
FastAPI Backend (Google Cloud Run)
 |
 +--> Document Loader (PDF / TXT / Markdown)
 |
 +--> Text Chunking
 |
 +--> Embedding Generation
 |
 +--> Session-Scoped Vector Retrieval
 |
 +--> Gemini Answer Generation
 |
 v
Answer + Sources
```

## Technology Stack

### Frontend
- Next.js
- React
- TypeScript

### Backend
- Python
- FastAPI
- Pydantic

### AI and Retrieval
- Google Gemini API
- Sentence Transformers
- ChromaDB

### Deployment
- Vercel
- Google Cloud Run

## Project Structure

```text
AI-C1 - RAG-Powered AI App/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── rag/
│   │   └── services/
│   └── tests/
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ask/
│   │   │   └── upload/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
├── docs/
├── .gitignore
└── README.md
```

## Setup

Setup instructions will be added after the backend and frontend implementations are complete.

## Security

- Store API keys in environment variables.
- Never commit `.env` files or credentials.
- Validate uploaded files and enforce upload limits.
- Scope retrieval to the relevant user's upload session.
- Do not expose internal credentials or sensitive server configuration to the frontend.

## Evaluation

The application will be tested to verify that:
1. A user can upload a supported document.
2. The application can answer questions using facts in that document.
3. Answers identify their supporting sources.
4. Questions unrelated to the document do not result in fabricated facts.
5. One upload session cannot retrieve another session's private documents.

## Project Status

Implementation in progress.