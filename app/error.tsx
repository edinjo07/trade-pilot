"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console  replace with your error-reporting service if needed
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-neutral-950 flex items-center justify-center px-6">
      <div
        className="w-full max-w-md rounded-2xl p-8 text-center space-y-5"
        style={{
          background: "linear-gradient(145deg,rgba(20,8,8,0.9) 0%,rgba(12,4,4,0.95) 100%)",
          border: "1px solid rgba(239,68,68,0.15)",
        }}
      >
        <p
          className="text-5xl font-black"
          style={{ color: "#f87171", textShadow: "0 0 40px rgba(239,68,68,0.3)" }}
        >
          ⚠
        </p>
        <h1 className="text-xl font-bold text-white">Something went wrong</h1>
        <p className="text-sm text-neutral-400">
          An unexpected error occurred. Please try again or return home.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="btn-emerald-gradient inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white w-full"
          >
            Try again
          </button>
          <a
            href="/"
            className="text-xs text-neutral-500 hover:text-neutral-400 underline"
          >
            Go back to home
          </a>
        </div>
        {error.digest && (
          <p className="text-[10px] text-neutral-700 font-mono">ref: {error.digest}</p>
        )}
      </div>
    </main>
  );
}
