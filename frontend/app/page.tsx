
"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import ReactMarkdown from "react-markdown";

type Source = {
  source: string;
  chunk_index: number;
};

type UploadResult = {
  document_id: string;
  filename: string;
  pages: number;
  chunks: number;
};

type AskResult = {
  document_id: string;
  question: string;
  answer: string;
  sources: Source[];
};

type ApiError = {
  detail?: string | Array<{ msg?: string }>;
};

async function readResponse(response: Response): Promise<unknown> {
  return response.json().catch(() => ({}));
}

function getErrorMessage(
  statusCode: number,
  data: unknown,
  fallback: string
): string {
  const detail = (data as ApiError | null)?.detail;

  if ([429, 500, 502, 503, 504].includes(statusCode)) {
    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }

    return "The AI service is temporarily busy or unavailable. Please wait a little and try again.";
  }

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => item.msg)
      .filter((message): message is string => Boolean(message));

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  return fallback;
}

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [document, setDocument] = useState<UploadResult | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<AskResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  async function handleUpload() {
    if (!file) {
      setError("Please select a PDF or TXT file first.");
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension !== "pdf" && extension !== "txt") {
      setError("Only PDF and TXT files are supported.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("The maximum file size is 10 MB.");
      return;
    }

    if (file.size === 0) {
      setError("The selected file is empty.");
      return;
    }

    setIsUploading(true);
    setError("");
    setUploadMessage("");
    setDocument(null);
    setAnswer(null);
    setQuestion("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await readResponse(response);
      const data = result as Partial<UploadResult> & ApiError;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            response.status,
            data,
            "The document could not be uploaded."
          )
        );
      }

      if (
        typeof data.document_id !== "string" ||
        typeof data.filename !== "string"
      ) {
        throw new Error("The server returned an invalid upload response.");
      }

      setDocument(data as UploadResult);
      setUploadMessage(
        `Document processed successfully: ${data.chunks ?? 0} text chunk(s) created.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload the document. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!document) {
      setError("Upload a document before asking a question.");
      return;
    }

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setError("Please enter a question.");
      return;
    }

    setIsAsking(true);
    setError("");
    setAnswer(null);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: document.document_id,
          question: trimmedQuestion,
        }),
      });

      const result = await readResponse(response);
      const data = result as Partial<AskResult> & ApiError;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            response.status,
            data,
            "Unable to answer your question. Please try again."
          )
        );
      }

      if (typeof data.answer !== "string" || !data.answer.trim()) {
        throw new Error(
          "The AI service returned an empty answer. Please try again."
        );
      }

      setAnswer({
        document_id: data.document_id ?? document.document_id,
        question: data.question ?? trimmedQuestion,
        answer: data.answer,
        sources: Array.isArray(data.sources) ? data.sources : [],
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to get an answer. Please try again."
      );
    } finally {
      setIsAsking(false);
    }
  }

  function handleFileChange(selectedFile: File | null) {
    setFile(selectedFile);
    setDocument(null);
    setAnswer(null);
    setQuestion("");
    setError("");
    setUploadMessage("");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-5 py-10 sm:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            AskWise <span className="text-cyan-400">AI</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
            Upload a PDF or text document and ask questions about its
            contents. Answers are grounded in the uploaded document.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-7">
          <h2 className="text-lg font-semibold">
            1. Upload your document
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Supported formats: PDF and TXT · Maximum file size: 10 MB
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              onChange={(event) =>
                handleFileChange(event.target.files?.[0] ?? null)
              }
              disabled={isUploading || isAsking}
              className="block w-full min-w-0 rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
            />

            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || isUploading || isAsking}
              className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Upload document"}
            </button>
          </div>

          {file && (
            <p className="mt-3 break-all text-sm text-slate-400">
              Selected: {file.name}
            </p>
          )}

          {uploadMessage && (
            <p
              role="status"
              className="mt-4 rounded-xl border border-emerald-800 bg-emerald-950/40 p-3 text-sm text-emerald-300"
            >
              {uploadMessage}
            </p>
          )}

          {document && (
            <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950/70 p-4">
              <p className="font-medium text-white">{document.filename}</p>

              <p className="mt-1 break-all text-xs text-slate-500">
                Document ID: {document.document_id}
              </p>

              <p className="mt-2 text-sm text-slate-400">
                {document.pages > 0
                  ? `${document.pages} page(s)`
                  : "Text document"}{" "}
                · {document.chunks} chunk(s)
              </p>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-7">
          <h2 className="text-lg font-semibold">
            2. Ask your document
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {document
              ? `Ask questions about ${document.filename}.`
              : "Upload a document first to enable question answering."}
          </p>

          <form onSubmit={handleAsk} className="mt-5 space-y-4">
            <label htmlFor="question" className="sr-only">
              Your question
            </label>

            <textarea
              id="question"
              value={question}
              onChange={(event) => {
                setQuestion(event.target.value);
                if (error) setError("");
              }}
              placeholder="Ask a question about your uploaded document..."
              rows={3}
              maxLength={2000}
              disabled={!document || isAsking || isUploading}
              className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={
                  !document ||
                  !question.trim() ||
                  isAsking ||
                  isUploading
                }
                className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAsking ? "Thinking..." : "Ask question"}
              </button>
            </div>
          </form>
        </section>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm leading-6 text-red-300"
          >
            {error}
          </div>
        )}

        {isAsking && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-300"
          >
            Searching your document and generating an answer...
          </div>
        )}

        {answer && (
          <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-7">
            <h2 className="text-lg font-semibold">Answer</h2>

            <div className="prose prose-invert mt-4 max-w-none break-words text-sm leading-7 prose-headings:text-white prose-p:text-slate-200 prose-strong:text-white prose-li:text-slate-200 prose-ul:my-3 prose-ol:my-3">
              <ReactMarkdown>{answer.answer}</ReactMarkdown>
            </div>

            <div className="mt-6 border-t border-slate-800 pt-5">
              <h3 className="text-sm font-semibold text-slate-300">
                Retrieved sources
              </h3>

              {answer.sources.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {answer.sources.map((source, index) => (
                    <li
                      key={`${source.source}-${source.chunk_index}-${index}`}
                      className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-400"
                    >
                      <span className="break-all font-medium text-slate-200">
                        {source.source}
                      </span>

                      <span className="ml-2 text-slate-500">
                        Chunk {source.chunk_index}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  No source chunks were returned.
                </p>
              )}
            </div>
          </section>
        )}

        <footer className="mt-auto pt-10 text-center text-sm text-slate-600">
          AskWise AI · Powered by FastAPI, ChromaDB and Gemini
        </footer>
      </div>
    </main>
  );
}
