"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AnswerCardProps {
  answer: string;
}

export default function AnswerCard({ answer }: AnswerCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answer);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/20">
      {/* Answer Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400">✦</span>

          <h2 className="font-semibold text-slate-200">
            AI Answer
          </h2>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 transition hover:border-cyan-500/50 hover:text-white"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Answer Content */}
      <div className="px-5 py-6 sm:px-7">
        <div
          className="
            prose
            prose-invert
            prose-slate
            max-w-none

            prose-headings:text-slate-100
            prose-h2:mt-8
            prose-h2:mb-4
            prose-h3:mt-6
            prose-h3:mb-3

            prose-p:text-slate-300
            prose-p:leading-7

            prose-strong:text-white

            prose-a:text-cyan-400
            prose-a:no-underline
            hover:prose-a:underline

            prose-li:text-slate-300
            prose-li:leading-7

            prose-code:text-cyan-300
            prose-code:before:content-none
            prose-code:after:content-none

            prose-pre:border
            prose-pre:border-slate-800
            prose-pre:bg-slate-950

            prose-blockquote:border-cyan-500
            prose-blockquote:text-slate-400

            prose-table:border
            prose-table:border-slate-700

            prose-th:border
            prose-th:border-slate-700
            prose-th:bg-slate-800
            prose-th:px-4
            prose-th:py-3
            prose-th:text-slate-100

            prose-td:border
            prose-td:border-slate-700
            prose-td:px-4
            prose-td:py-3
            prose-td:text-slate-300
          "
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {answer}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  );
}