"use client";

import { useEffect, useState } from "react";

// Set NEXT_PUBLIC_CPA_OFFER_URL in .env to enable auto-redirect to broker
const CPA_URL = process.env.NEXT_PUBLIC_CPA_OFFER_URL || "";

/* ── Animated counter ─────────────────────────────────────────── */
function useCounter(target: number, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const steps = 60;
    const inc = target / steps;
    let current = 0;
    const id = setInterval(() => {
      current += inc;
      if (current >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(id);
  }, [target, duration]);
  return val;
}

const STEPS = [
  { icon: "🔐", title: "Identity verified",      sub: "Your details are secure" },
  { icon: "📊", title: "Profile created",         sub: "91% match with profitable traders" },
  { icon: "📞", title: "Specialist being assigned", sub: "You'll receive a call within 24 hrs" },
];

export default function ContinuePage() {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(CPA_URL ? 8 : 0);
  const traders = useCounter(47382, 2000);

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), 100);
    return () => window.clearTimeout(t);
  }, []);

  // Auto-redirect to broker after countdown (only when CPA_URL is configured)
  useEffect(() => {
    if (!CPA_URL) return;
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(id); window.location.href = CPA_URL; return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-start justify-center px-4 py-10 sm:py-16">
      <div
        className={`w-full max-w-xl space-y-8 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="text-center space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="flex justify-center">
            <img
              src="/images/badge-success.svg"
              alt="Success badge"
              className="h-20 w-20 animate-scale-in"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            You&apos;re in &mdash; what happens next
          </h1>
          <p className="text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed">
            Your application has been received. A trading specialist will contact you personally to walk you through getting started.
          </p>
        </div>

        {/* ── Live traders badge ───────────────────────────────────── */}
        <div
          className="rounded-2xl px-5 py-4 text-center glow-emerald"
          style={{
            background: "linear-gradient(145deg,rgba(12,28,18,0.9) 0%,rgba(6,14,9,0.95) 100%)",
            border: "1px solid rgba(52,211,153,0.2)",
          }}
        >
          <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Members already inside</p>
          <p
            className="stat-number text-4xl font-black text-emerald-400"
            style={{ textShadow: "0 0 20px rgba(52,211,153,0.4)" }}
          >
            {traders.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-600 mt-1">and counting</p>
        </div>

        {/* ── Steps ────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl px-4 py-4 animate-slide-left"
              style={{
                animationDelay: `${i * 120}ms`,
                background: "linear-gradient(145deg,rgba(14,20,16,0.88) 0%,rgba(8,12,9,0.95) 100%)",
                border: "1px solid rgba(52,211,153,0.12)",
              }}
            >
              <div
                className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-lg"
                style={{
                  background: "linear-gradient(135deg,rgba(16,185,129,0.2) 0%,rgba(5,150,105,0.1) 100%)",
                  border: "1px solid rgba(52,211,153,0.3)",
                  boxShadow: "0 0 12px rgba(52,211,153,0.15)",
                }}
              >
                {s.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-100">{s.title}</p>
                <p className="text-xs text-neutral-500">{s.sub}</p>
              </div>
              <span className="ml-auto text-emerald-400 text-sm font-bold">✓</span>
            </div>
          ))}
        </div>
        {/* ── Dashboard preview image ──────────────────────────── */}
        <div
          className="overflow-hidden rounded-2xl"
          style={{ border: "1px solid rgba(52,211,153,0.12)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/dashboard-mockup.svg"
            alt="Sample trading dashboard showing portfolio performance"
            className="w-full object-cover rounded-2xl"
            loading="lazy"
          />
          <p className="text-center text-xs text-neutral-600 py-2">Preview: what your dashboard looks like</p>
        </div>
        {/* ── CPA offer CTA ─────────────────────────────────────────── */}
        {CPA_URL ? (
          <div
            className="rounded-2xl p-5 space-y-3 text-center"
            style={{
              background: "linear-gradient(145deg,rgba(12,28,18,0.9) 0%,rgba(6,14,9,0.95) 100%)",
              border: "1px solid rgba(52,211,153,0.25)",
            }}
          >
            <p className="text-sm font-semibold text-neutral-200">Your account is ready  open it now</p>
            <a
              href={CPA_URL}
              className="btn-emerald-gradient inline-flex items-center justify-center gap-2 w-full rounded-2xl px-6 py-4 text-base font-bold text-white shadow-lg"
            >
              Open My Trading Account →
            </a>
            {countdown > 0 && (
              <p className="text-xs text-neutral-500">Redirecting automatically in {countdown}s…</p>
            )}
          </div>
        ) : null}

        {/* ── What to expect ───────────────────────────────────────── */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
          <p className="text-sm font-semibold text-neutral-200">What to expect on your call:</p>
          <ul className="space-y-2.5 text-sm text-neutral-400">
            {[
              "A quick intro  no pressure, no scripts",
              "They'll explain exactly how the platform works",
              "Walk you through your first deposit (min. $250)",
              "Set up your account and answer all your questions",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5 shrink-0">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Tip ──────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-amber-800/30 bg-amber-950/20 px-4 py-3 flex gap-3 items-start">
          <span className="text-lg shrink-0">💡</span>
          <p className="text-xs text-neutral-400 leading-relaxed">
            <strong className="text-neutral-200">Pro tip:</strong> Save the specialist&apos;s number when they call  traders who respond quickly tend to get the best onboarding slots.
          </p>
        </div>

        {/* ── Social proof ─────────────────────────────────────────── */}
        <div className="rounded-2xl border border-neutral-700 bg-neutral-900 p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-emerald-700/50 bg-blue-700 text-sm font-bold text-white">
              LF
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-100">Luca F.</p>
              <p className="text-xs text-neutral-500">Milan, Italy · Week 6</p>
            </div>
            <span className="ml-auto text-xs font-bold text-emerald-400 bg-emerald-900/40 rounded-full px-2 py-0.5">Verified</span>
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed italic">
            &ldquo;The call lasted about 45 minutes. No pressure at all  they just explained everything clearly. By end of week 2 I had made my first withdrawal.&rdquo;
          </p>
        </div>

        <p className="text-center text-xs text-neutral-600 pb-6">
          🔒 Your information is private and will never be shared with third parties.
        </p>
      </div>
    </main>
  );
}

