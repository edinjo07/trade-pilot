"use client";

import { useState, useEffect } from "react";
import RiskDisclaimer from "@/components/funnel/RiskDisclaimer";
import { useT } from "@/components/LocaleProvider";

// ── Pain point data ───────────────────────────────────────────────────────────

const PAIN_POINTS = [
  {
    icon: "💸",
    title: "Taxes take 20–45% of everything you earn",
    body: "Before you see a penny, governments take their slice. The average worker loses nearly a third of their income before it ever touches their bank account.",
    stat: "£12,570 lost annually on an average UK salary just to tax.",
  },
  {
    icon: "📈",
    title: "Inflation is silently destroying your savings",
    body: "Your bank pays you 0.1%. Inflation runs at 4–6%. Every year your savings sit still, they lose real value. Saving harder doesn't fix this problem.",
    stat: "£10,000 saved today is worth £9,400 in real terms next year.",
  },
  {
    icon: "⛽",
    title: "Fuel, food, energy costs never stop rising",
    body: "The price of everything you need keeps climbing. Your income doesn't keep pace. The gap between what you earn and what you spend grows wider every year.",
    stat: "Average UK household bills rose by £1,800+ in a single year.",
  },
  {
    icon: "⏰",
    title: "Self-employed? You don't have time to trade",
    body: "Running your own business already consumes 60+ hours a week. Sitting in front of charts watching candles move isn't an option. Yet your money is still working against you.",
    stat: "67% of self-employed people have no active investment strategy.",
  },
  {
    icon: "🏦",
    title: "Your money in the bank is losing value every day",
    body: "Banks don't reward loyalty they reward your deposits by paying you almost nothing. Meanwhile they lend that same money out at 8–25% interest. You're doing them a favour.",
    stat: "High street banks average 0.1–1.5% interest vs 5%+ inflation.",
  },
  {
    icon: "👴",
    title: "Pension payouts barely cover the basics",
    body: "Decades of contributions. A lifetime of work. And a pension that barely covers rent, food, and heating. The retirement you were promised doesn't stretch as far as it should.",
    stat: "Average UK pension income: £13,000/year. Average living cost: £17,000.",
  },
];

// ── Famous automation advocates ───────────────────────────────────────────────

const ADVOCATES = [
  {
    name: "Jim Simons",
    title: "Renaissance Technologies quantitative trading legend",
    quote: "The Medallion Fund, run entirely by mathematical algorithms, averaged 66% annual returns over 30 years the greatest investing track record in history.",
    tag: "66% annual returns · Purely algorithmic",
    icon: "📐",
  },
  {
    name: "Ray Dalio",
    title: "Bridgewater Associates world's largest hedge fund",
    quote:
      "Dalio built Bridgewater on a system he calls 'The Machine' a set of algorithms and principles that remove human emotion from every investment decision.",
    tag: "$160B AUM · Algorithm-first",
    icon: "⚙️",
  },
  {
    name: "Warren Buffett",
    title: "Berkshire Hathaway world's most famous investor",
    quote:
      "\"The stock market is a device for transferring money from the impatient to the patient.\" Systems enforce patience. Humans almost never can.",
    tag: "Discipline over emotion · Rules-based thinking",
    icon: "🧠",
  },
  {
    name: "Paul Tudor Jones",
    title: "Tudor Investment Corp macro trading legend",
    quote:
      "Jones pioneered computer-driven systematic strategies in the 1980s and has consistently advocated for rules-based, emotion-free trade execution.",
    tag: "Systematic strategies since the '80s",
    icon: "📊",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function SectionPainIntro({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const t = useT();
  const PAIN_POINTS = [
    { icon: "💸", title: t.s2b_p1_title, body: t.s2b_p1_body, stat: t.s2b_p1_stat },
    { icon: "📈", title: t.s2b_p2_title, body: t.s2b_p2_body, stat: t.s2b_p2_stat },
    { icon: "⛽", title: t.s2b_p3_title, body: t.s2b_p3_body, stat: t.s2b_p3_stat },
    { icon: "⏰", title: t.s2b_p4_title, body: t.s2b_p4_body, stat: t.s2b_p4_stat },
    { icon: "🏦", title: t.s2b_p5_title, body: t.s2b_p5_body, stat: t.s2b_p5_stat },
    { icon: "👴", title: t.s2b_p6_title, body: t.s2b_p6_body, stat: t.s2b_p6_stat },
  ];
  const [revealed, setRevealed] = useState(false);
  const [counter, setCounter] = useState(0);

  // Animate entry
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Live "lost to inflation" counter
  useEffect(() => {
    // £5,000 of value lost per second globally to inflation (illustrative)
    const interval = setInterval(() => {
      setCounter((c) => c + Math.floor(Math.random() * 120 + 80));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={[
        "space-y-8 transition-opacity duration-500",
        revealed ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      {/* ── Step indicator ── */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="bg-gray-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
        <span>{t.s2b_step_label}</span>
        <span className="flex-1 border-t border-gray-200" />
        <span className="bg-gray-100 rounded-full px-2 py-0.5">{t.s2b_step_duration}</span>
      </div>

      {/* ── Opening headline ── */}
      <div className="space-y-3">
        <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
          {t.s2b_headline}<br />
          <span className="text-red-500">{t.s2b_headline_em}</span>,<br />
          {t.s2b_headline_end}
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          {t.s2b_subtext}
        </p>
      </div>

      {/* ── Live counter ── */}
      <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-4">
        <div className="text-xs text-red-400 uppercase tracking-widest font-semibold mb-1">
          {t.s2b_counter_label}
        </div>
        <div className="text-3xl font-extrabold text-red-600 font-mono tabular-nums">
          £{counter.toLocaleString()}
        </div>
        <div className="text-xs text-red-400 mt-1">
          {t.s2b_counter_sub}
        </div>
      </div>

      {/* ── Pain cards ── */}
      <div className="space-y-3">
        {PAIN_POINTS.map((p) => (
          <div
            key={p.title}
            className="rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">{p.icon}</span>
              <div className="space-y-1.5 min-w-0">
                <div className="font-bold text-gray-900 text-sm leading-snug">
                  {p.title}
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">{p.body}</p>
                <div className="text-xs text-gray-400 italic border-t border-gray-100 pt-1.5">
                  📌 {p.stat}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── The pivot ── */}
      <div className="rounded-2xl bg-gray-900 text-white px-5 py-6 space-y-4">
        <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
          {t.s2b_why_headline}
        </div>
                <p className="text-base font-semibold leading-relaxed">
          {t.s2b_why_text1}
        </p>
                <p className="text-sm text-gray-400">
          {t.s2b_why_text2}
        </p>
         <p className="text-sm font-bold text-white">{t.s2b_why_text3}</p>
 </div>

 {/* ── TradePilot intro ── */}
 <div className="space-y-4">
 <div className="text-center space-y-1">
 <div className="inline-block rounded-full bg-gray-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gray-500">{t.s2b_solution_label}</div>
 <h3 className="text-xl font-extrabold text-gray-900">{t.s2b_tp_headline}</h3>
 <p className="text-gray-500 text-sm">
 {t.s2b_tp_sub}
 </p>
 </div>

 {/* Claude AI badge */}
 <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 flex items-start gap-3">
 <span className="text-2xl shrink-0">🧠</span>
 <div>
 <div className="font-bold text-violet-800 text-sm">{t.s2b_claude_title}</div>
 <p className="text-violet-600 text-xs leading-relaxed mt-0.5">
 {t.s2b_claude_body}
 </p>
 </div>
 </div>

 {/* Three simple facts */}
 <div className="space-y-3">
 {[
            { num: "01", heading: t.s2b_fact1_heading, detail: t.s2b_fact1_detail },
            { num: "02", heading: t.s2b_fact2_heading, detail: t.s2b_fact2_detail },
            { num: "03", heading: t.s2b_fact3_heading, detail: t.s2b_fact3_detail },
          ].map((item) => (
 <div
 key={item.num}
 className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white px-4 py-4"
 >
 <div className="text-3xl font-extrabold text-gray-200 shrink-0 leading-none mt-0.5">
 {item.num}
 </div>
 <div className="space-y-1">
 <div className="font-bold text-gray-900 text-sm">
 {item.heading}
 </div>
 <p className="text-gray-500 text-xs leading-relaxed">
 {item.detail}
 </p>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* ── Famous advocates ── */}
 <div className="space-y-3">
 <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold text-center">{t.s2b_advocates_label}</div>
 <div className="space-y-3">
 {ADVOCATES.map((a) => (
 <div
 key={a.name}
 className="rounded-xl border border-gray-200 bg-white px-4 py-4 space-y-2"
 >
 <div className="flex items-start gap-3">
 <span className="text-2xl shrink-0">{a.icon}</span>
 <div>
 <div className="font-bold text-gray-900 text-sm">{a.name}</div>
 <div className="text-xs text-gray-400">{a.title}</div>
 </div>
 </div>
 <p className="text-xs text-gray-600 leading-relaxed italic border-l-2 border-gray-200 pl-3">
 {a.quote}
 </p>
 <div className="inline-block rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wide">
 {a.tag}
 </div>
 </div>
 ))}
 </div>
 <p className="text-center text-xs text-gray-400 leading-relaxed">
 {t.s2b_adv_disclaimer}
 </p>
 </div>

 {/* ── CTA ── */}
 <div className="space-y-3 pb-4">
 <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-4 text-center space-y-1">
 <p className="text-sm font-bold text-gray-900">
 {t.s2b_cta_box_p1}
 </p>
 <p className="text-xs text-gray-500">
 {t.s2b_cta_box_p2}
 </p>
 </div>
 <button
 onClick={onContinue}
 className="w-full rounded-xl bg-gray-900 py-4 text-base font-bold text-white shadow-lg transition hover:bg-gray-800 active:scale-[.98]"
 >
          {t.s2b_cta}
        </button>
 <p className="text-center text-xs text-gray-400">
          {t.s2b_cta_sub}
        </p>
      </div>

      {/* Risk disclaimer */}
      <RiskDisclaimer />
    </div>
  );
}
