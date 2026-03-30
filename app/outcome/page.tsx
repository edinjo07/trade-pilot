"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function OutcomeContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const result = (sp.get("result") || "fail").toLowerCase();
  const isPass = result === "pass";

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-5">
        {/* Emoji badge */}
        <div className="text-center">
          <span className="inline-block text-5xl mb-2">
            {isPass ? "✅" : "⛔"}
          </span>
        </div>

        {/* Result card */}
        <div
          className="rounded-2xl p-6 text-center space-y-4"
          style={{
            background: isPass
              ? "linear-gradient(145deg,rgba(10,22,18,0.92) 0%,rgba(5,11,9,0.97) 100%)"
              : "linear-gradient(145deg,rgba(20,8,8,0.92) 0%,rgba(12,4,4,0.97) 100%)",
            border: isPass
              ? "1px solid rgba(52,211,153,0.22)"
              : "1px solid rgba(239,68,68,0.22)",
          }}
        >
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            {isPass ? "You passed the risk filter." : "Not a fit right now."}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "#8a9bbf" }}>
            {isPass
              ? "This doesn't mean you'll win. It means you're less likely to make the most common mistakes."
              : "Based on your answers, a trading platform is likely to harm you financially. That's not an insult  it's protection."}
          </p>

          <div className="flex flex-col gap-2.5 pt-1">
            {isPass ? (
              <button
                className="btn-gold-gradient w-full rounded-xl py-3.5 text-sm font-bold"
                onClick={() => router.push("/match")}
              >
                See the neutral match →
              </button>
            ) : (
              <>
                <button
                  className="w-full rounded-xl py-3 text-sm font-semibold transition"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#8a9bbf" }}
                  onClick={() => router.push("/why-deposits-fail")}
                >
                  Read: Why most deposits fail
                </button>
                <button
                  className="text-xs underline opacity-50 hover:opacity-70 transition py-2"
                  style={{ color: "#4e5d7a" }}
                  onClick={() => router.push("/")}
                >
                  Leave this page
                </button>
              </>
            )}
          </div>
        </div>

        {/* Trust row */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="trust-badge">🔒 Secure</span>
          <span className="trust-badge">No obligation</span>
        </div>
      </div>
    </main>
  );
}

export default function OutcomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <OutcomeContent />
    </Suspense>
  );
}
