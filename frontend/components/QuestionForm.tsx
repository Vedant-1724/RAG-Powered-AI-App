"use client";

import { FormEvent, useState } from "react";

const MAX_LENGTH = 2000;
const MIN_LENGTH = 5;

interface QuestionFormProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

export default function QuestionForm({
  onSubmit,
  isLoading,
}: QuestionFormProps) {
  const [question, setQuestion] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setValidationError("Please enter a question.");
      return;
    }

    if (trimmedQuestion.length < MIN_LENGTH) {
      setValidationError(
        `Please enter at least ${MIN_LENGTH} characters.`
      );
      return;
    }

    if (trimmedQuestion.length > MAX_LENGTH) {
      setValidationError(
        `Your question must be under ${MAX_LENGTH} characters.`
      );
      return;
    }

    setValidationError("");
    onSubmit(trimmedQuestion);
  };

  const handleChange = (value: string) => {
    setQuestion(value);

    if (validationError) {
      setValidationError("");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/20 transition focus-within:border-cyan-500/50">
        <div className="px-5 pt-5">
          <label
            htmlFor="question"
            className="text-sm font-semibold uppercase tracking-wider text-slate-400"
          >
            Your Question
          </label>

          <textarea
            id="question"
            value={question}
            onChange={(event) => handleChange(event.target.value)}
            placeholder="Ask a technical question..."
            maxLength={MAX_LENGTH}
            disabled={isLoading}
            rows={5}
            className="mt-4 w-full resize-none border-0 bg-transparent text-base leading-7 text-white outline-none placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg"
          />
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 px-5 py-4">
          <span
            className={`text-xs ${
              question.length >= MAX_LENGTH
                ? "text-red-400"
                : "text-slate-600"
            }`}
          >
            {question.length} / {MAX_LENGTH}
          </span>

          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Generating..." : "✦ Ask Question"}
          </button>
        </div>
      </div>

      {validationError && (
        <p className="mt-3 px-1 text-sm text-red-400">
          {validationError}
        </p>
      )}
    </form>
  );
}