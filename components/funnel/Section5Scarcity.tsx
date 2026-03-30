"use client";

/**
 * Section5Scarcity  Urgency & scarcity gate before the lead form.
 *
 * Psychological levers:
 * • Real-looking countdown (20 min  regenerates from sessionStorage so it
 *   persists on refresh but doesn't look reset)
 * • Spot counter that slowly counts down
 * • "Consequence of waiting" messaging
 * • One clear CTA
 */

import { useEffect, useState } from "react";
import { useT } from "@/components/LocaleProvider";

interface Props {
  onContinue: () => void;
}

const TOTAL_SECONDS = 20 * 60; // 20 minutes

function getOrInitDeadline(): number {
  try {
    const stored = sessionStorage.getItem("__fd_dl");
    if (stored) {
      const dl = Number(stored);
      if (dl > Date.now()) return dl;
    }
    const dl = Date.now() + TOTAL_SECONDS * 1000;
    sessionStorage.setItem("__fd_dl", String(dl));
    return dl;
  } catch {
    return Date.now() + TOTAL_SECONDS * 1000;
  }
}

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function Section5Scarcity({ onContinue }: Props) {
  const t = useT();
  const [spotsLeft] = useState(() => Math.floor(Math.random() * 4) + 2); // 2–5
  const [secondsLeft, setSecondsLeft] = useState<number>(TOTAL_SECONDS);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const deadline = getOrInitDeadline();

    function tick() {
      const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) setExpired(true);
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const urgencyColor = secondsLeft < 300 ? "text-red-400" : "text-amber-400";

  return (
    <div className="space-y-6">

      {/* ── Hero urgency image ──────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/chart-scarcity.svg"
          alt="Live candlestick chart showing urgent spot availability and market movement"
          className="w-full h-36 sm:h-44 object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-5 py-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">
            {spotsLeft === 1 ? t.s5_spots_one : t.s5_spots_many.replace("{n}", String(spotsLeft))}
          </p>
          <div className="flex gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors duration-500 ${
                  i < spotsLeft ? "bg-amber-400" : "bg-neutral-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Countdown */}
      <div
        className="rounded-2xl p-4 sm:p-5 text-center glow-amber"
        style={{
          background: "#fffbeb",
          border: "1px solid rgba(251,191,36,0.30)",
        }}
      >
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">
          {t.s5_countdown_label}
        </p>
        {expired ? (
          <p className="text-2xl font-black text-red-400 glow-red">{t.s5_expired}</p>
        ) : (
          <p
            className={`stat-number text-5xl font-black ${urgencyColor}`}
            style={{ textShadow: secondsLeft < 300 ? "0 0 20px rgba(248,113,113,0.5)" : "0 0 20px rgba(251,191,36,0.4)" }}
          >
            {fmtTime(secondsLeft)}
          </p>
        )}
        <p className="mt-2 text-xs text-gray-400">
          {t.s5_expired_sub}
        </p>
      </div>

      {/* Spot counter */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-gray-800">{t.s5_spots_title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{t.s5_spots_sub}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-red-400">{spotsLeft}</p>
          <p className="text-xs text-gray-400">{t.s5_spots_total}</p>
        </div>
      </div>

      {/* Why act now */}
      <div className="space-y-3">
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
          {t.s5_what_happens}
        </h2>
        <ul className="space-y-2 text-sm text-gray-500">
          {[t.s5_c1, t.s5_c2, t.s5_c3, t.s5_c4].map((c, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">✗</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Pre-qualification checklist ─────────────────────────────────── */}
      <div
        className="rounded-2xl p-4 sm:p-5 space-y-3"
        style={{
          background: "#ffffff",
          border: "1px solid rgba(240,165,0,0.18)",
        }}
      >
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#f0a500" }}>
          {t.s5_qualify_label}
        </p>
        <div className="space-y-2.5">
          {[
            { check: true,  text: t.s5_q1 },
            { check: true,  text: t.s5_q2 },
            { check: true,  text: t.s5_q3 },
            { check: "deposit", text: t.s5_q4 },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span
                className="shrink-0 mt-0.5 text-sm font-black"
                style={{ color: item.check === "deposit" ? "#f0a500" : "#34d399" }}
              >
                {item.check === "deposit" ? "$" : "✓"}
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 pt-1 border-t" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
          {t.s5_qualify_footer}
        </p>
      </div>

      <button
        onClick={onContinue}
        className="
          btn-gold-gradient group w-full rounded-2xl px-6 py-4
          text-base font-bold text-black shadow-lg
          flex items-center justify-center gap-2
        "
      >
        {t.s5_cta}
        <span className="transition-transform duration-150 group-hover:translate-x-1">→</span>
      </button>

      <p className="text-center text-xs text-gray-400">
        {t.s5_cta_sub}
      </p>
    </div>
  );
}
