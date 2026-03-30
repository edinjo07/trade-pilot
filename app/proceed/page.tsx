"use client";

import { useMemo } from "react";

export default function ProceedPage() {
  const url = useMemo(() => {
    return process.env.NEXT_PUBLIC_CPA_OFFER_URL || "";
  }, []);

  const disabled = !url;

  const reminders = [
    "Read the platform fees and conditions carefully.",
    "Never deposit money you need for essential expenses.",
    "If you feel emotional or pressured, stop and come back later.",
  ];

  return (
    <main className="min-h-screen px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-md space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">One last check</h1>
          <p className="text-sm" style={{ color: "#4e5d7a" }}>Proceed only if you accept the terms and risk.</p>
        </div>

        <div className="space-y-2.5">
          {reminders.map((r, i) => (
            <div
              key={i}
              className="flex gap-3 items-start rounded-xl px-4 py-3.5"
              style={{
                background: "linear-gradient(145deg,rgba(13,21,44,0.88) 0%,rgba(7,11,22,0.95) 100%)",
                border: "1px solid rgba(240,165,0,0.1)",
              }}
            >
              <span className="shrink-0 mt-0.5" style={{ color: "#f0a500" }}>&#x2713;</span>
              <p className="text-sm leading-relaxed" style={{ color: "#c0c8d8" }}>{r}</p>
            </div>
          ))}
        </div>

        <div className="ic-divider" />

        <div className="space-y-2">
          {!disabled ? (
            <a
              href={url}
              className="btn-gold-gradient flex items-center justify-center gap-2 w-full rounded-xl py-4 text-sm font-bold"
              rel="noopener"
            >
              Proceed to registration &rarr;
            </a>
          ) : (
            <>
              <button
                className="flex items-center justify-center w-full rounded-xl py-4 text-sm font-bold cursor-not-allowed opacity-40"
                style={{ border: "1px solid rgba(255,255,255,0.06)", color: "#4e5d7a" }}
                disabled
              >
                Proceed to registration
              </button>
              <p className="text-center text-xs" style={{ color: "#4e5d7a" }}>
                Set NEXT_PUBLIC_CPA_OFFER_URL in .env to activate.
              </p>
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
          <span className="trust-badge">&#x1F512; Secure connection</span>
          <span className="trust-badge">No hidden fees</span>
        </div>
      </div>
    </main>
  );
}
