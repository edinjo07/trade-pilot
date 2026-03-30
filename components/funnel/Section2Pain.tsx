"use client";

/**
 * Section2Pain  Identify the visitor's pain point.
 * Makes them feel seen and sets up the solution frame.
 *
 * Psychological levers:
 * • "Yes ladder"  both options validate their reality and advance them
 * • Running ticker showing what they "missed" today
 * • Micro-commitment: choosing a pain option is a soft yes
 */

import { useEffect, useState } from "react";
import { useT } from "@/components/LocaleProvider";

interface Props {
  onChoice: (choice: "WATCHING" | "TRIED" | "NO_TIME") => void;
}

const MISSED_BASE = 312;

export default function Section2Pain({ onChoice }: Props) {
  const t = useT();
  const [missed, setMissed] = useState(MISSED_BASE);

  useEffect(() => {
    const id = setInterval(() => {
      setMissed((p) => p + Math.floor(Math.random() * 18) + 4);
    }, 1600);
    return () => clearInterval(id);
  }, []);

  const options = [
    {
      id: "WATCHING" as const,
      emoji: "👀",
      headline: t.s2_opt1_head,
      sub: t.s2_opt1_sub,
    },
    {
      id: "TRIED" as const,
      emoji: "😤",
      headline: t.s2_opt2_head,
      sub: t.s2_opt2_sub,
    },
    {
      id: "NO_TIME" as const,
      emoji: "⏱️",
      headline: t.s2_opt3_head,
      sub: t.s2_opt3_sub,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* ── Step indicator ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {[t.s2_step1, t.s2_step2, t.s2_step3].map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={
                i === 0
                  ? { background: "linear-gradient(135deg,#f0a500,#d4840a)", color: "#000" }
                  : { background: "rgba(0,0,0,0.07)", color: "#9ca3af" }
              }
            >
              {i + 1}
            </div>
            <span
              className="text-xs font-medium hidden sm:block"
              style={{ color: i === 0 ? "#f0a500" : "#9ca3af" }}
            >
              {label}
            </span>
            {i < 2 && <div className="h-px flex-1 bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* ── Hero: candlestick chart SVG with missed money overlay ────────── */}
      <div
        className="relative overflow-hidden rounded-2xl border shadow-2xl shadow-black/60"
        style={{ borderColor: "rgba(251,191,36,0.20)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/chart-urgency.svg"
          alt="Forex candlestick chart showing market price movements"
          className="w-full h-36 sm:h-44 object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
        {/* missed money counter */}
        <div className="absolute inset-0 flex flex-col items-start justify-center px-5 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-0.5">
            {t.s2_missed_label}
          </p>
          <p className="stat-number text-3xl sm:text-4xl font-black text-shimmer-amber">
            +${missed.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-gray-400">{t.s2_missed_sub}</p>
        </div>
        {/* Scan-line effect */}
        <div className="absolute inset-0 scan-overlay pointer-events-none" />
      </div>

      <div>
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{t.s2_question_label}</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug">
          {t.s2_headline}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {t.s2_subtext}
        </p>
      </div>

      <div className="grid gap-4">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onChoice(o.id)}
            className="group flex items-start gap-4 rounded-2xl border p-4 sm:p-5 text-left active:scale-[0.99] transition-all duration-200"
            style={{
              background: "#ffffff",
              borderColor: "rgba(0,0,0,0.1)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,211,153,0.4)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.1)"; }}
          >
            <span className="shrink-0 mt-0.5 text-2xl leading-none">{o.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 leading-snug text-sm sm:text-base">{o.headline}</p>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">{o.sub}</p>
            </div>
            <span className="shrink-0 ml-2 mt-1 text-gray-400 group-hover:text-emerald-500 transition-colors">→</span>
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400">{t.s2_footer}</p>
    </div>
  );
}

