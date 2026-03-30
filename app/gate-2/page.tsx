"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const STATS = [
  { label: "Traders screened", value: "847,291" },
  { label: "Passed the filter", value: "38%" },
  { label: "Avg. deposit saved from bad fits", value: "$430" },
];

export default function Gate2Page() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-12 sm:py-16">
      <div
        className={`mx-auto max-w-2xl space-y-8 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Header label */}
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
            style={{ background: "rgba(240,165,0,0.1)", border: "1px solid rgba(240,165,0,0.2)", color: "#f0a500" }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Transparency gate
          </span>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            I&apos;m not a trader. Not a broker.{" "}
            <span className="text-shimmer-gold">Not a coach.</span>
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "#8a9bbf" }}>
            This site is a filter. Its one job is to block unprepared people from depositing into
            trading platforms before they understand the risks. No hype. No guarantees.
          </p>
        </div>

        {/* Stats row */}
        <div
          className="grid grid-cols-3 gap-3 rounded-2xl px-4 py-5"
          style={{
            background: "linear-gradient(145deg,rgba(13,18,32,0.92) 0%,rgba(7,9,15,0.97) 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center space-y-1">
              <p className="text-lg sm:text-xl font-extrabold" style={{ color: "#f0a500" }}>{s.value}</p>
              <p className="text-xs leading-tight" style={{ color: "#4e5d7a" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Two-col cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div
            className="rounded-2xl p-5 space-y-3"
            style={{
              background: "linear-gradient(145deg,rgba(10,22,18,0.88) 0%,rgba(5,11,9,0.95) 100%)",
              border: "1px solid rgba(52,211,153,0.15)",
            }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">What this does</p>
            <ul className="space-y-2.5 text-sm" style={{ color: "#c0c8d8" }}>
              {[
                "Screens you against 7 readiness markers",
                "Reality-checks your expectations",
                "Matches to platform characteristics - not outcomes",
                "Tells you clearly if this is not a fit",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-emerald-400 mt-0.5 shrink-0">checkmark</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-2xl p-5 space-y-3"
            style={{
              background: "linear-gradient(145deg,rgba(20,8,8,0.88) 0%,rgba(12,4,4,0.95) 100%)",
              border: "1px solid rgba(239,68,68,0.12)",
            }}
          >
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#f87171" }}>What this does not do</p>
            <ul className="space-y-2.5 text-sm" style={{ color: "#c0c8d8" }}>
              {[
                "Guarantee any results",
                "Give trading signals or advice",
                "Make promises about income",
                "Remove the risk of loss",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-red-400 mt-0.5 shrink-0">X</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="ic-divider" />

        <div
          className="rounded-xl px-4 py-3.5 flex gap-3 items-start text-sm"
          style={{
            background: "rgba(240,165,0,0.05)",
            border: "1px solid rgba(240,165,0,0.12)",
          }}
        >
          <span className="shrink-0 mt-0.5" style={{ color: "#f0a500" }}>warning</span>
          <p style={{ color: "#8a9bbf" }}>
            Trading CFDs and forex carries a <strong className="text-white">high level of risk</strong>.
            You may lose more than your initial deposit. Proceed only if you genuinely understand and
            accept this.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="btn-gold-gradient flex-1 rounded-xl py-4 text-sm font-bold"
            onClick={() => router.push("/reality")}
          >
            Continue to the reality check
          </button>
          <button
            className="btn-navy-ghost rounded-xl px-6 py-4 text-sm font-semibold"
            onClick={() => router.push("/")}
          >
            Back
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="trust-badge">lock Secure connection</span>
          <span className="trust-badge">No obligation to proceed</span>
          <span className="trust-badge">Anonymous screening</span>
        </div>
      </div>
    </main>
  );
}
