"use client";

/**
 * Section4Reveal  Personalized "profile analysis" result.
 *
 * Psychological levers:
 * • Fake loading/analysis animation → perceived value
 * • Barnum effect copy → feels hyper-personalised to everyone
 * • Social proof with specific numbers → 91% match
 * • Testimonial with photo-placeholder → relatability
 * • FOMO: "people like you who act today..."
 */

import { useEffect, useState } from "react";
import CommentsSection from "@/components/funnel/CommentsSection";
import RiskDisclaimer from "@/components/funnel/RiskDisclaimer";
import { useT } from "@/components/LocaleProvider";

interface Props {
  painChoice: "WATCHING" | "TRIED" | "NO_TIME";
  onContinue: () => void;
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function Section4Reveal({ painChoice, onContinue }: Props) {
  const t = useT();

  const TESTIMONIALS = [
    {
      name: "Marcus T.",
      city: "Toronto",
      initials: "MT",
      color: "bg-violet-700",
      photo: "https://randomuser.me/api/portraits/men/32.jpg",
      text: t.s4_test1_text,
      gain: "+$2,840 last month",
    },
    {
      name: "Priya S.",
      city: "London",
      initials: "PS",
      color: "bg-emerald-700",
      photo: "https://randomuser.me/api/portraits/women/44.jpg",
      text: t.s4_test2_text,
      gain: "+$1,970 last month",
    },
    {
      name: "Daniel R.",
      city: "Sydney",
      initials: "DR",
      color: "bg-blue-700",
      photo: "https://randomuser.me/api/portraits/men/67.jpg",
      text: t.s4_test3_text,
      gain: "+$3,120 last month",
    },
  ];

  const LOADING_STEPS = [
    t.s4_loading_1,
    t.s4_loading_2,
    t.s4_loading_3,
    t.s4_loading_4,
    t.s4_loading_5,
  ];

  const [loadStep, setLoadStep] = useState(0);
  const [done, setDone] = useState(false);
  const [testimonial] = useState(() => rand(TESTIMONIALS));

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setLoadStep(i);
      if (i >= LOADING_STEPS.length - 1) {
        clearInterval(id);
        window.setTimeout(() => setDone(true), 600);
      }
    }, 500);
    return () => clearInterval(id);
  }, []);

  const resultCopy =
    painChoice === "TRIED"
      ? t.s4_result_tried
      : painChoice === "NO_TIME"
      ? t.s4_result_no_time
      : t.s4_result_watching;

  return (
    <div className="space-y-7">
      {/* Loading sequence */}
      <div className="space-y-1">
        {LOADING_STEPS.slice(0, loadStep + 1).map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 text-sm transition-all duration-300 ${
              i < loadStep ? "text-emerald-600" : "text-gray-700"
            }`}
          >
            {i < loadStep ? (
              <span className="text-emerald-400">✓</span>
            ) : (
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-emerald-500" />
            )}
            {step}
          </div>
        ))}
      </div>

      {done && (
        <div className="space-y-7 transition-all duration-500 opacity-100 translate-y-0">
          {/* Match score */}
          <div
            className="relative overflow-hidden rounded-2xl shadow-lg"
            style={{ border: "1px solid rgba(52,211,153,0.25)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/chart-reveal.svg"
              alt="Trading profit charts and graphs"
              className="w-full h-36 sm:h-44 object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/50 to-black/15" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{t.s4_fit_label}</p>
              <p
                className="text-6xl font-black text-emerald-400 glow-emerald animate-scale-in"
                style={{ textShadow: "0 0 30px rgba(52,211,153,0.5)" }}
              >
                91<span className="text-3xl">%</span>
              </p>
              <p className="mt-2 text-sm text-gray-600">{t.s4_fit_sub}</p>
            </div>
          </div>

          {/* Personalised copy */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
              {t.s4_result_headline}
            </h2>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">{resultCopy}</p>
          </div>

          {/* Trading modes feature card */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(240,165,0,0.15)",
            }}
          >
            <div className="px-4 sm:px-5 py-3.5 border-b" style={{ borderColor: "rgba(240,165,0,0.1)" }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#f0a500" }}>{t.s4_modes_label}</p>
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
              {[
                {
                  icon: "🤖",
                  title: t.s4_mode1_title,
                  badge: t.s4_mode1_badge,
                  badgeColor: "rgba(240,165,0,0.15)",
                  badgeText: "#f0a500",
                  desc: t.s4_mode1_desc,
                  highlight: painChoice === "NO_TIME",
                },
                {
                  icon: "📋",
                  title: t.s4_mode2_title,
                  badge: t.s4_mode2_badge,
                  badgeColor: "rgba(52,211,153,0.12)",
                  badgeText: "#34d399",
                  desc: t.s4_mode2_desc,
                  highlight: false,
                },
                {
                  icon: "📊",
                  title: t.s4_mode3_title,
                  badge: t.s4_mode3_badge,
                  badgeColor: "rgba(148,163,184,0.1)",
                  badgeText: "#94a3b8",
                  desc: t.s4_mode3_desc,
                  highlight: false,
                },
              ].map((mode) => (
                <div
                  key={mode.title}
                  className="px-4 sm:px-5 py-4 flex items-start gap-3.5"
                  style={mode.highlight ? { background: "rgba(240,165,0,0.04)" } : undefined}
                >
                  <span className="text-xl shrink-0 mt-0.5">{mode.icon}</span>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-gray-800">{mode.title}</p>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ background: mode.badgeColor, color: mode.badgeText }}
                      >
                        {mode.badge}
                      </span>
                      {mode.highlight && (
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: "rgba(240,165,0,0.2)", color: "#f0a500" }}>
                          {t.s4_mode_recommended}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{mode.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div
            className="rounded-xl p-4 sm:p-5 animate-slide-left"
            style={{
              background: "#f9fafb",
              border: "1px solid rgba(52,211,153,0.15)",
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="relative h-11 w-11 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={testimonial.photo}
                  alt={testimonial.name}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full border-2 border-emerald-700/50 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
                    if (fb) fb.style.display = "flex";
                  }}
                />
                <div
                  className={`hidden h-11 w-11 items-center justify-center rounded-full border-2 border-emerald-700/50 text-sm font-bold text-white ${testimonial.color}`}
                  style={{ position: "absolute", inset: 0 }}
                >
                  {testimonial.initials}
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{testimonial.name}</p>
                <p className="text-xs text-gray-400 truncate">{testimonial.city} · {testimonial.gain}</p>
              </div>
              <span className="ml-auto shrink-0 text-xs font-bold text-emerald-400 bg-emerald-900/40 rounded-full px-2 py-0.5">
                Verified
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed italic">
              &ldquo;{testimonial.text}&rdquo;
            </p>
          </div>

          {/* Stat strip */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { stat: "47K+", label: t.s4_stat1_label },
              { stat: "91%",  label: t.s4_stat2_label },
              { stat: "$0",   label: t.s4_stat3_label },
            ].map((s) => (
              <div
                key={s.stat}
                className="rounded-xl py-3 px-2"
                style={{
                  background: "#f9fafb",
                  border: "1px solid rgba(52,211,153,0.12)",
                }}
              >
                <p
                  className="text-lg font-black"
                  style={{ color: "#34d399", textShadow: "0 0 12px rgba(52,211,153,0.4)" }}
                >
                  {s.stat}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Urgency strip (replaces standalone scarcity step) ──────── */}
          <div
            className="flex items-center justify-between rounded-2xl px-5 py-4"
            style={{
              background: "rgba(240,165,0,0.05)",
              border: "1px solid rgba(240,165,0,0.22)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              <span className="text-sm font-bold text-gray-800">{t.s4_urgency_title}</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-amber-500">{t.s4_urgency_sub1}</p>
              <p className="text-xs text-gray-400">{t.s4_urgency_sub2}</p>
            </div>
          </div>

          {/* ── CTA before comments ──────────────────────────────────── */}
          <button
            onClick={onContinue}
            className="btn-gold-gradient group w-full rounded-2xl px-6 py-4 text-base font-bold text-black shadow-lg flex items-center justify-center gap-2"
          >
            {t.s4_cta}
            <span className="transition-transform duration-150 group-hover:translate-x-1">→</span>
          </button>

          {/* ── Risk disclaimer ───────────────────────────────────────── */}
          <RiskDisclaimer compact />

          {/* ── Community comments ────────────────────────────────────── */}
          <CommentsSection />

          <button
            onClick={onContinue}
            className="btn-gold-gradient group w-full rounded-2xl px-6 py-4 text-base font-bold text-black shadow-lg flex items-center justify-center gap-2"
          >
            {t.s4_cta}
            <span className="transition-transform duration-150 group-hover:translate-x-1">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
