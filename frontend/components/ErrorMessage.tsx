interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({
  message,
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-900/50 bg-red-950/30 p-5"
    >
      <div className="flex gap-3">
        <span className="text-red-400">!</span>

        <div>
          <h2 className="font-semibold text-red-300">
            Something went wrong
          </h2>

          <p className="mt-1 text-sm text-red-400/80">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}