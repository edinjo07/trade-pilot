"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RealityPage() {
  const router = useRouter();
  const [ack, setAck] = useState(false);

  return (
    <main className="min-h-screen px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-2">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
          >
            &#x26A0; Reality check
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Trading punishes unrealistic expectations.
          </h1>
          <p className="text-sm" style={{ color: "#4e5d7a" }}>Read this before you continue.</p>
        </div>

        <div className="space-y-2.5">
          {[
            "Most people lose because they cannot manage risk.",
            "Automation does not remove uncertainty.",
            "Small capital + high expectations usually ends fast.",
            "Discipline matters more than tools.",
            "If you panic at red numbers, you will self-destruct.",
          ].map((f, i) => (
            <div
              key={i}
              className="flex gap-3 items-start rounded-xl px-4 py-3.5"
              style={{
                background: "linear-gradient(145deg,rgba(20,8,8,0.7) 0%,rgba(14,4,4,0.85) 100%)",
                border: "1px solid rgba(239,68,68,0.1)",
              }}
            >
              <span className="text-red-400 mt-0.5 shrink-0">&#x26A0;</span>
              <p className="text-sm leading-relaxed" style={{ color: "#c0c8d8" }}>{f}</p>
            </div>
          ))}
        </div>

        <div className="ic-divider" />

        <label
          className="flex items-start gap-3 rounded-xl px-4 py-4 cursor-pointer transition"
          style={{
            background: "linear-gradient(145deg,rgba(13,21,44,0.88) 0%,rgba(7,11,22,0.95) 100%)",
            border: ack ? "1px solid rgba(240,165,0,0.35)" : "1px solid rgba(240,165,0,0.12)",
          }}
        >
          <input
            type="checkbox"
            checked={ack}
            onChange={(e) => setAck(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded shrink-0"
            style={{ accentColor: "#f0a500" }}
          />
          <span className="text-sm" style={{ color: "#c0c8d8" }}>
            I understand losses can happen and I am still continuing.
          </span>
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="btn-gold-gradient flex-1 rounded-xl py-3.5 text-sm font-bold disabled:opacity-35 disabled:cursor-not-allowed"
            onClick={() => router.push("/qualify")}
            disabled={!ack}
          >
            Self-qualification &rarr;
          </button>
          <button
            className="btn-navy-ghost rounded-xl px-5 py-3.5 text-sm font-semibold"
            onClick={() => router.push("/")}
          >
            Go back
          </button>
        </div>
      </div>
    </main>
  );
}
