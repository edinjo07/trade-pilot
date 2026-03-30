"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CHECKS = [
  { ok: true,  label: "FCA / ASIC / CySEC regulation" },
  { ok: true,  label: "Stop-loss and risk controls built in" },
  { ok: true,  label: "Transparent fees and spreads" },
  { ok: true,  label: "Withdrawal freedom - no lock-in" },
  { ok: true,  label: "Demo account available" },
  { ok: false, label: "Guaranteed profits" },
  { ok: false, label: "No-risk trading" },
];

export default function MatchPage() {
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
        {/* Badge */}
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
            style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Neutral matching
          </span>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            We match by <span className="text-shimmer">characteristics</span>, not outcomes.
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: "#8a9bbf" }}>
            This is not a recommendation. It is a neutral match based on what we know about
            different trading platforms versus what you told us about yourself.
          </p>
        </div>

        {/* Dashboard image */}
        <div
          className="relative overflow-hidden rounded-2xl border shadow-2xl shadow-black/70"
          style={{ borderColor: "rgba(52,211,153,0.18)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/dashboard-mockup.svg"
            alt="TradePilot trading dashboard showing portfolio performance and live trade data"
            className="w-full h-44 sm:h-56 object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-5 py-3">
            <p className="text-xs text-neutral-400">Example platform dashboard - for illustration only</p>
          </div>
        </div>

        {/* Criteria grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div
            className="rounded-2xl p-5 space-y-3"
            style={{
              background: "linear-gradient(145deg,rgba(10,22,18,0.88) 0%,rgba(5,11,9,0.95) 100%)",
              border: "1px solid rgba(52,211,153,0.12)",
            }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">What we verify</p>
            <ul className="space-y-2 text-sm" style={{ color: "#c0c8d8" }}>
              {CHECKS.filter((c) => c.ok).map((c) => (
                <li key={c.label} className="flex gap-2">
                  <span className="text-emerald-400 mt-0.5 shrink-0">&#10003;</span>
                  <span>{c.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-2xl p-5 space-y-3"
            style={{
              background: "linear-gradient(145deg,rgba(20,14,4,0.88) 0%,rgba(12,8,2,0.95) 100%)",
              border: "1px solid rgba(251,191,36,0.12)",
            }}
          >
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#fbbf24" }}>Not included in any match</p>
            <ul className="space-y-2 text-sm" style={{ color: "#c0c8d8" }}>
              {CHECKS.filter((c) => !c.ok).map((c) => (
                <li key={c.label} className="flex gap-2">
                  <span className="text-red-400 mt-0.5 shrink-0">&#10007;</span>
                  <span>{c.label}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs leading-relaxed pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", color: "#4e5d7a" }}>
              No legitimate broker offers this. If you see one that does, that is a red flag.
            </p>
          </div>
        </div>

        {/* Risk reminder */}
        <div className="ic-divider" />
        <div
          className="rounded-xl px-4 py-3.5 text-sm space-y-1"
          style={{ background: "rgba(240,165,0,0.04)", border: "1px solid rgba(240,165,0,0.1)" }}
        >
          <p className="font-bold" style={{ color: "#f0a500" }}>Important reminder</p>
          <p style={{ color: "#8a9bbf" }}>
            Past performance of any platform means nothing for future results. You can still lose
            your entire deposit. Please only trade with capital you can genuinely afford to lose.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="btn-emerald-gradient flex-1 rounded-xl py-4 text-sm font-bold text-white"
            onClick={() => router.push("/proceed")}
          >
            Proceed to platform options &#8594;
          </button>
          <button
            className="btn-navy-ghost rounded-xl px-5 py-4 text-sm font-semibold"
            onClick={() => router.push("/qualify")}
          >
            Back
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="trust-badge">&#128274; Secure</span>
          <span className="trust-badge">No obligation</span>
          <span className="trust-badge">Results vary</span>
        </div>
      </div>
    </main>
  );
}
