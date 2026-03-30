"use client";

import { useEffect, useState, useRef } from "react";
import RiskDisclaimer from "@/components/funnel/RiskDisclaimer";
import { useT } from "@/components/LocaleProvider";

const RUNNING_PROFIT_BASE = 1_243_780;

const ACTIVITY_FEED = [
  { name: "Marcus T.", location: "London", amount: "$312", pair: "EUR/USD", ago: "12s ago" },
  { name: "Priya S.",  location: "Dubai",  amount: "$847", pair: "Gold",    ago: "28s ago" },
  { name: "James R.",  location: "Sydney", amount: "$194", pair: "GBP/JPY", ago: "41s ago" },
  { name: "Aisha M.",  location: "Lagos",  amount: "$523", pair: "BTC/USD", ago: "1m ago"  },
  { name: "Tom B.",    location: "Toronto",amount: "$271", pair: "US30",    ago: "1m ago"  },
  { name: "Lena K.",   location: "Berlin", amount: "$688", pair: "EUR/GBP", ago: "2m ago"  },
  { name: "Omar F.",   location: "Riyadh", amount: "$415", pair: "Oil",     ago: "2m ago"  },
  { name: "Sarah C.",  location: "Dublin", amount: "$139", pair: "EUR/USD", ago: "3m ago"  },
  { name: "Raj P.",    location: "Mumbai", amount: "$902", pair: "Nasdaq",  ago: "3m ago"  },
  { name: "Nina W.",   location: "Paris",  amount: "$237", pair: "GBP/USD", ago: "4m ago"  },
];

interface Props {
  onContinue: () => void;
}

export default function Section1Hook({ onContinue }: Props) {
  const t = useT();
  const [viewers, setViewers]       = useState(214);
  const [profit, setProfit]         = useState(RUNNING_PROFIT_BASE);
  const [visible, setVisible]       = useState(false);
  const [pulse, setPulse]           = useState(false);
  const [countIn, setCountIn]       = useState(false);
  const [started, setStarted]       = useState(0);   // strong call counter
  const [mindAnswer, setMindAnswer] = useState<"nothing" | "works" | null>(null);
  const [feedIdx, setFeedIdx]       = useState(0);
  const [feedVisible, setFeedVisible] = useState(true);
  const feedTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), 80);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setCountIn(true), 400);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    // Strong call: slowly count up "people who started today"
    const base = 47 + Math.floor(Math.random() * 12);
    setStarted(base);
    const id = setInterval(() => {
      setStarted((v) => v + (Math.random() > 0.65 ? 1 : 0));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setViewers((v) => Math.max(190, Math.min(260, v + (Math.random() > 0.5 ? 1 : -1))));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setProfit((p) => p + Math.floor(Math.random() * 820) + 140);
      setPulse(true);
      window.setTimeout(() => setPulse(false), 400);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  // Spider web: cycle activity feed with fade transition
  useEffect(() => {
    feedTimer.current = setInterval(() => {
      setFeedVisible(false);
      window.setTimeout(() => {
        setFeedIdx((i) => (i + 1) % ACTIVITY_FEED.length);
        setFeedVisible(true);
      }, 350);
    }, 3200);
    return () => { if (feedTimer.current) clearInterval(feedTimer.current); };
  }, []);

  return (
    <div
      className={`space-y-6 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* ── Sponsored banner ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 rounded-xl overflow-hidden border border-gray-200/60 bg-gray-50/50 px-2 py-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/dashboard-mockup.svg"
          alt="Sponsored"
          className="h-10 w-10 rounded-lg object-cover shrink-0"
        />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Sponsored</span>
      </div>

      {/* ── Live badge ───────────────────────────────────────────────────── */}
      <div className="animate-fade-in flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-600/50 bg-red-600/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-red-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
          </span>
          {t.live}
        </span>
        <span className="text-xs text-gray-400">{t.watching.replace("{n}", String(viewers))}</span>
      </div>

      {/* ── Headline ─────────────────────────────────────────────────────── */}
      <div className="animate-fade-in-up space-y-3 delay-100">
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-gray-900">
          {t.s1_headline}
        </h1>
        <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
          {t.s1_subtext}
        </p>
      </div>

      {/* ── Above-fold CTA ───────────────────────────────────────────────── */}
      <button
        onClick={onContinue}
        className="animate-fade-in-up delay-150 btn-gold-gradient group w-full rounded-2xl px-6 py-4 text-base font-extrabold text-black flex items-center justify-center gap-2"
        style={{ boxShadow: "0 4px 28px rgba(240,165,0,0.40)" }}
      >
        {t.s1_cta_above}
        <span className="transition-transform duration-150 group-hover:translate-x-1.5">→</span>
      </button>

      {/* ── Hero chart image + live profit overlay ────────────────────────── */}
      <div
        className="animate-fade-in-up delay-200 relative overflow-hidden rounded-2xl border shadow-2xl shadow-black/70"
        style={{ borderColor: "rgba(52,211,153,0.22)" }}
      >
        {/* Local SVG as primary hero  crisp at all sizes, no external dep */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/app-screenshot.svg"
          alt="Live trading app showing real-time EUR/USD chart and open positions"
          className="w-full h-44 sm:h-56 md:h-64 object-cover object-top"
          loading="eager"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

        {/* Live profit counter */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-500 mb-0.5">
            {t.s1_profit_label}
          </p>
          <p
            className={`stat-number text-3xl sm:text-4xl font-black text-emerald-400 transition-all duration-200 ${
              pulse ? "scale-[1.06] brightness-125" : "scale-100"
            } ${countIn ? "animate-count-up" : ""}`}
          >
            ${profit.toLocaleString()}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">{t.s1_profit_sublabel}</p>
        </div>

        {/* Top-right badge */}
        <div className="absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-bold text-black shadow-lg" style={{ background: "linear-gradient(135deg,#f0a500,#d4840a)", boxShadow: "0 2px 12px rgba(240,165,0,0.4)" }}>
          {t.s1_real_accounts}
        </div>

        {/* Scan-line scanning animation */}
        <div className="absolute inset-0 scan-overlay pointer-events-none" />
      </div>

      {/* Risk disclaimer */}
      <RiskDisclaimer compact />

      {/* ── STRONG CALL: The Challenge ────────────────────────────────────── */}
      <div
        className="animate-fade-in-up delay-300 rounded-2xl overflow-hidden"
        style={{
          background: "#ffffff",
          border: "1px solid rgba(240,165,0,0.2)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        }}
      >
          <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(240,165,0,0.15)" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#f0a500" }}>
                {t.s1_challenge_title}
              </span>
              <span className="text-xs text-gray-400">{viewers} watching</span>
          </div>
        </div>
        <div className="px-5 py-5 space-y-3">
            <p className="text-lg sm:text-xl font-extrabold text-gray-900 leading-snug">
            {t.s1_challenge_headline.split("{n}")[0]}
            <span
              className="font-black tabular-nums"
              style={{ color: "#f0a500" }}
            >
              {started}
            </span>
            {t.s1_challenge_headline.split("{n}")[1]}
          </p>
            <p className="text-sm text-gray-500 leading-relaxed">
            {t.s1_challenge_sub}
          </p>
          <div className="flex items-center gap-2 pt-1">
              <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.07)" }}>
              <div
                className="h-full rounded-full transition-all duration-[4000ms]"
                style={{ width: `${Math.min(100, (started / 100) * 100)}%`, background: "linear-gradient(90deg,#f0a500,#f5b523)" }}
              />
            </div>
              <span className="text-xs text-gray-400 shrink-0">{t.s1_daily_cap}</span>
          </div>
        </div>
      </div>

      {/* ── MIND GAME: The Gap Test ───────────────────────────────────────── */}
      <div
        className="animate-fade-in-up delay-350 rounded-2xl p-5 space-y-4"
        style={{
          background: "#ffffff",
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{t.s1_mind_label}</p>
        <p className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
          {t.s1_mind_question}
        </p>

        {mindAnswer === null ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMindAnswer("nothing")}
              className="rounded-xl border px-4 py-3.5 text-sm font-semibold text-gray-700 text-left transition-all duration-200 hover:border-amber-500/60 active:scale-95"
              style={{ background: "rgba(0,0,0,0.02)", borderColor: "rgba(0,0,0,0.1)" }}
            >
              <span className="block text-xl mb-1.5">😴</span>
              {t.s1_mind_nothing}
            </button>
            <button
              onClick={() => setMindAnswer("works")}
              className="rounded-xl border px-4 py-3.5 text-sm font-semibold text-gray-700 text-left transition-all duration-200 hover:border-amber-500/60 active:scale-95"
              style={{ background: "rgba(0,0,0,0.02)", borderColor: "rgba(0,0,0,0.1)" }}
            >
              <span className="block text-xl mb-1.5">📈</span>
              {t.s1_mind_works}
            </button>
          </div>
        ) : mindAnswer === "nothing" ? (
          <div
            className="rounded-xl p-4 space-y-2"
            style={{ background: "rgba(240,165,0,0.06)", border: "1px solid rgba(240,165,0,0.2)" }}
          >
            <p className="text-sm font-bold" style={{ color: "#f0a500" }}>
              {t.s1_mind_nothing_title}
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              {t.s1_mind_nothing_body}
            </p>
            <p className="text-xs font-semibold text-gray-700">
              {t.s1_mind_nothing_footer}
            </p>
            <button
              onClick={onContinue}
              className="mt-1 w-full rounded-xl px-4 py-3 text-sm font-bold text-black transition-all duration-150 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg,#f0a500,#d4840a)", boxShadow: "0 2px 14px rgba(240,165,0,0.35)" }}
            >
              See Trading Pilot in action →
            </button>
          </div>
        ) : (
          <div
            className="rounded-xl p-4 space-y-2"
            style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.18)" }}
          >
            <p className="text-sm font-bold text-emerald-400">
              {t.s1_mind_works_title}
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              {t.s1_mind_works_body}
            </p>
            <button
              onClick={onContinue}
              className="mt-1 w-full rounded-xl px-4 py-3 text-sm font-bold text-black transition-all duration-150 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg,#f0a500,#d4840a)", boxShadow: "0 2px 14px rgba(240,165,0,0.35)" }}
            >
              Take me to the live demo →
            </button>
          </div>
        )}
      </div>

      {/* ── SPIDER WEB: Live Activity Feed ───────────────────────────────── */}
      <div
        className="animate-fade-in-up delay-400 rounded-2xl overflow-hidden"
        style={{
          background: "#ffffff",
          border: "1px solid rgba(0,0,0,0.07)",
        }}
      >
          <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-gray-500">{t.s1_activity_title}</span>
            </div>
            <span className="text-xs text-gray-400">{t.s1_activity_verified}</span>
        </div>

        {/* cycling row */}
        <div
          className="px-4 py-3.5 flex items-center justify-between transition-opacity duration-300"
          style={{ opacity: feedVisible ? 1 : 0 }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-black text-black"
              style={{ background: "linear-gradient(135deg,#f0a500,#d4840a)" }}
            >
              {ACTIVITY_FEED[feedIdx].name[0]}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700">
                {ACTIVITY_FEED[feedIdx].name}{" "}
                <span className="font-normal text-gray-400">
                  from {ACTIVITY_FEED[feedIdx].location}
                </span>
              </p>
              <p className="text-xs text-gray-400">{ACTIVITY_FEED[feedIdx].pair} · {ACTIVITY_FEED[feedIdx].ago}</p>
            </div>
          </div>
          <span className="text-sm font-black text-emerald-400">
            +{ACTIVITY_FEED[feedIdx].amount}
          </span>
        </div>

        {/* static rows below - always visible */}
        <div className="border-t divide-y" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
          {ACTIVITY_FEED.slice(1, 4).map((item, i) => (
            <div key={i} className="px-4 py-2.5 flex items-center justify-between" style={{ opacity: 0.45 - i * 0.1 }}>
              <div className="flex items-center gap-2.5">
                <div
                  className="h-6 w-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-black"
                  style={{ background: "linear-gradient(135deg,rgba(240,165,0,0.7),rgba(212,132,10,0.7))" }}
                >
                  {item.name[0]}
                </div>
                <p className="text-xs text-gray-500">
                  {item.name} <span className="text-gray-400">{item.pair}</span>
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-600">+{item.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Trust strip ──────────────────────────────────────────────────── */}
      <div className="animate-fade-in-up delay-500 grid grid-cols-3 gap-2 text-center">
        {[
          { icon: "✅", line1: t.s1_trust_t1, line2: t.s1_trust_t2 },
          { icon: "🌍", line1: t.s1_trust_c1, line2: t.s1_trust_c2 },
          { icon: "🆓", line1: t.s1_trust_f1, line2: t.s1_trust_f2 },
        ].map((item) => (
          <div
            key={item.line1}
            className="rounded-xl border py-3 px-2 transition-colors duration-200"
            style={{
              background: "#ffffff",
              borderColor: "rgba(240,165,0,0.18)",
            }}
          >
            <p className="text-base">{item.icon}</p>
            <p className="mt-0.5 text-xs font-bold text-gray-700">{item.line1}</p>
            <p className="text-xs text-gray-400">{item.line2}</p>
          </div>
        ))}
      </div>

      {/* ── Deposit transparency block ────────────────────────────────── */}
      <div
        className="animate-fade-in-up delay-600 rounded-2xl p-4 sm:p-5"
        style={{
          background: "#ffffff",
          border: "1px solid rgba(240,165,0,0.18)",
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0 mt-0.5">💡</span>
          <div className="space-y-2">
            <p className="text-sm font-bold text-gray-900">
              {t.s1_deposit_title}
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              {t.s1_deposit_body}
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { label: t.s1_deposit_own1, sub: t.s1_deposit_own2 },
                { label: t.s1_deposit_with1, sub: t.s1_deposit_with2 },
                { label: t.s1_deposit_reg1, sub: t.s1_deposit_reg2 },
              ].map((i) => (
                <div key={i.label} className="rounded-lg p-2 text-center" style={{ background: "rgba(240,165,0,0.04)", border: "1px solid rgba(240,165,0,0.12)" }}>
                  <p className="text-xs font-bold text-gray-700">{i.label}</p>
                  <p className="text-xs text-gray-400">{i.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Primary CTA ──────────────────────────────────────────────────── */}
      <button
        onClick={onContinue}
        className="animate-fade-in-up delay-700 btn-gold-gradient group w-full rounded-2xl px-6 py-4 text-base font-bold text-black flex items-center justify-center gap-2"
      >
        {t.s1_cta_main}
        <span className="transition-transform duration-150 group-hover:translate-x-1.5">→</span>
      </button>

      <p className="animate-fade-in delay-700 text-center text-xs text-gray-400">
        {t.s1_cta_sub}
      </p>
    </div>
  );
}
