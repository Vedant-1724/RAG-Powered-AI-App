export default function LoadingState() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" />
        </div>

        <span className="text-sm text-slate-400">
          AskWise AI is thinking...
        </span>
      </div>
    </div>
  );
}