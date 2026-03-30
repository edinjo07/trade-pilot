"use client";

import { useEffect, useMemo, useState } from "react";
import type { FunnelSessionClient } from "@/lib/funnel/types";

export default function Panel2Bridge(props: {
  session: FunnelSessionClient | null;
  onContinue: () => void;
  onBack: () => void;
}) {
  const s = props.session;
  const pressureChoice = s?.derived?.pressureChoice ?? "n/a";
  const systemChoice = "WAIT";
  const [mode, setMode] = useState<"HUMAN" | "SYSTEM">("HUMAN");
  const [autoScenarioId, setAutoScenarioId] = useState<"cpi" | "ecb">("cpi");
  const [logLines, setLogLines] = useState<string[]>([]);
  const [showExecution, setShowExecution] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [revealCount, setRevealCount] = useState(0);
  const [darken, setDarken] = useState(false);

  const autoScenarios = useMemo(
    () => ({
      cpi: {
        headline: "US CPI comes in hotter than expected",
        tags: ["Inflation surprise: Positive (hot)", "CPI actual > forecast"],
        log: [
          "[INIT] Loading event context",
          "[PARSE] Headline detected: CPI release",
          "[READ] Actual CPI > Forecast CPI",
          "[INFER] Rate-cut odds decreasing",
          "[INFER] Real yields trending higher",
          "[CLASSIFY] Risk regime: RISK_OFF",
          "[EVALUATE] Equity sensitivity to rates: HIGH",
          "[EVALUATE] Gold sensitivity to real yields: HIGH",
          "[DECISION] Constraint threshold reached",
        ],
        execution: ["[EXECUTE] SELL SPY", "[EXECUTE] SELL XAUUSD"],
        stamp: "Execution complete. Rules applied. No discretion.",
        legA: {
          label: "SPY",
          t0: [62, 63, 64, 63, 62, 61, 60, 61, 60, 59, 60, 59, 58, 59],
          future: [58, 57, 56, 55, 56, 55, 54, 55, 54, 53, 52, 53],
          direction: "SELL" as const,
        },
        legB: {
          label: "XAUUSD",
          t0: [70, 71, 70, 69, 70, 69, 68, 69, 68, 67, 68, 67, 66, 67],
          future: [66, 65, 64, 63, 64, 63, 62, 63, 62, 61, 62, 61],
          direction: "SELL" as const,
        },
        whyFits: [
          "Hot CPI → fewer rate cuts expected → yields/real yields up.",
          "Higher discount rates hit equities; higher real yields can pressure gold first.",
        ],
        whyFails: [
          "DRAW: Leg divergence observed.",
          "REALITY: Reactions are not guaranteed.",
        ],
      },
      ecb: {
        headline: "ECB cuts rates; avoids committing to more cuts",
        tags: ["Cut = dovish", "Guidance less dovish than expected"],
        log: [
          "[INIT] Loading event context",
          "[PARSE] Central bank decision detected: ECB",
          "[READ] Rate cut confirmed",
          "[READ] No commitment to accelerated easing",
          "[INFER] Guidance less dovish than priced",
          "[CLASSIFY] FX reaction bias: EUR_SUPPORTIVE",
          "[EVALUATE] Gold sensitivity to USD strength: MODERATE",
          "[DECISION] Constraint threshold reached",
        ],
        execution: ["[EXECUTE] BUY EURUSD", "[EXECUTE] SELL XAUUSD"],
        stamp: "Execution complete. Rules applied. No discretion.",
        legA: {
          label: "EURUSD",
          t0: [50, 51, 50, 51, 52, 51, 52, 53, 52, 53, 54, 53],
          future: [54, 55, 56, 55, 56, 55, 56, 55, 54, 55, 54, 55],
          direction: "BUY" as const,
        },
        legB: {
          label: "XAUUSD",
          t0: [72, 71, 72, 71, 70, 71, 70, 69, 70, 69, 68, 69],
          future: [68, 67, 66, 65, 66, 65, 64, 65, 64, 63, 64, 63],
          direction: "SELL" as const,
        },
        whyFits: [
          "If the cut is priced in and guidance is less dovish, EUR can firm.",
          "Stabilizing rate expectations can pressure gold on the first move.",
        ],
        whyFails: [
          "If US data dominates, EURUSD can ignore the ECB.",
          "Gold can rise even with EUR strength if risk sentiment deteriorates.",
        ],
      },
    }),
    []
  );

  const auto = autoScenarios[autoScenarioId];
  const totalSeriesLength = auto.legA.t0.length + auto.legA.future.length;

  useEffect(() => {
    if (mode !== "SYSTEM") {
      setLogLines([]);
      setShowExecution(false);
      setShowReveal(false);
      setRevealCount(0);
      setDarken(false);
      return;
    }

    setDarken(true);
    setLogLines([]);
    setShowExecution(false);
    setShowReveal(false);
    setRevealCount(0);

    const timers: number[] = [];
    const perLine = 450;
    const extraDelayAt = new Map<number, number>([
      [5, 1500],
      [7, 900],
    ]);

    let time = 0;
    auto.log.forEach((line, idx) => {
      time += perLine;
      const extra = extraDelayAt.get(idx) ?? 0;
      time += extra;
      const t = window.setTimeout(() => {
        setLogLines((prev) => [...prev, line]);
      }, time);
      timers.push(t);
    });

    const execAt = time + 800;
    timers.push(
      window.setTimeout(() => {
        setShowExecution(true);
      }, execAt)
    );

    const revealAt = execAt + 900;
    let revealInterval: number | null = null;
    timers.push(
      window.setTimeout(() => {
        setShowReveal(true);
        setRevealCount(auto.legA.t0.length);
        revealInterval = window.setInterval(() => {
          setRevealCount((prev) => {
            const next = prev + 1;
            if (next >= totalSeriesLength) {
              if (revealInterval) window.clearInterval(revealInterval);
              return totalSeriesLength;
            }
            return next;
          });
        }, 220);
      }, revealAt)
    );

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      if (revealInterval) window.clearInterval(revealInterval);
    };
  }, [mode, auto, totalSeriesLength]);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="text-sm text-neutral-500">Continue · Step 2/4</div>
        <div className="text-2xl md:text-3xl font-semibold">Structure revelation</div>
        <p className="text-neutral-300 leading-relaxed">
          What you just experienced isn’t a mistake. It’s how decisions feel when clarity comes too late.
        </p>
      </div>

      <div
        className={[
          "rounded-xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 transition-opacity",
          mode === "SYSTEM" ? "opacity-70" : "opacity-100",
        ].join(" ")}
      >
        <div className="text-neutral-300 leading-relaxed">
          The problem isn’t choosing wrong. The problem is having to choose at all  before certainty exists.
        </div>

        <div className="text-neutral-300 leading-relaxed">
          A rule-based system would face the same uncertainty. Not with better insight. Not with intuition.
        </div>
        <div className="text-neutral-300 leading-relaxed">
          Only with constraints.
        </div>
        <div className="text-neutral-300 leading-relaxed">
          It doesn’t think. It doesn’t predict. It doesn’t adapt.
        </div>
        <div className="text-neutral-300 leading-relaxed">
          It executes predefined rules  even when the outcome is uncomfortable.
        </div>

        <div className="grid gap-3 md:grid-cols-2 text-sm text-neutral-300">
          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
            <div className="text-neutral-500">Your decision</div>
            <div className="mt-1">{pressureChoice}</div>
          </div>
          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
            <div className="text-neutral-500">System decision</div>
            <div className="mt-1">{systemChoice}</div>
          </div>
        </div>

        <div className="text-neutral-300 leading-relaxed">
          The outcome would still be uncertain. Sometimes favorable. Sometimes not.
        </div>
        <div className="text-neutral-300 leading-relaxed">Structure doesn’t remove risk.</div>

        <div className="text-neutral-200 font-medium">
          It reduces the damage caused by hesitation, impulse, and escalation.
        </div>

        <div className="text-neutral-300 leading-relaxed">
          Trading doesn’t become easy with tools. It becomes survivable with structure, guidance, and
          constraints.
        </div>

        <div className="text-neutral-300 leading-relaxed">
          You don’t have to figure this out alone.
        </div>

        <div className="text-neutral-300 leading-relaxed">
          This only works if decisions don’t disappear once they’re made. Patterns matter  but only when
          they’re tracked.
        </div>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 space-y-4">
        <div className="text-sm text-neutral-500">Mode</div>
        <div className="inline-flex rounded-xl border border-neutral-800 p-1">
          {(["HUMAN", "SYSTEM"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={[
                "px-4 py-2 rounded-lg text-sm transition",
                mode === m
                  ? "bg-neutral-100 text-neutral-950"
                  : "text-neutral-300 hover:text-neutral-100",
              ].join(" ")}
            >
              {m === "HUMAN" ? "Human Mode" : "System Mode (Pair Trades)"}
            </button>
          ))}
        </div>

        {mode === "SYSTEM" ? (
          <div className={[
            "space-y-4 relative",
            darken ? "bg-black/10 rounded-xl p-4" : "",
          ].join(" ")}>
            <div>
              <div className="text-lg font-medium">System Mode</div>
              <div className="text-sm text-neutral-400">
                A rule-based reaction engine reads the same information you just saw.
              </div>
              <div className="text-sm text-neutral-500 mt-1">
                This system doesn’t predict. It reacts under constraints.
              </div>
            </div>

            <div className="text-sm text-neutral-500">System reads the event</div>
            <div className="grid gap-3 md:grid-cols-2">
              <button
                onClick={() => setAutoScenarioId("cpi")}
                className={[
                  "rounded-xl border px-4 py-4 text-left transition",
                  autoScenarioId === "cpi"
                    ? "border-neutral-300 bg-neutral-900"
                    : "border-neutral-800 bg-neutral-950 hover:border-neutral-600",
                ].join(" ")}
              >
                <div className="text-sm text-neutral-400">AUTO SCENARIO 1</div>
                <div className="mt-1 text-neutral-100 font-medium">Hot CPI Shock</div>
                <div className="mt-1 text-xs text-neutral-500">SPY + XAUUSD</div>
              </button>
              <button
                onClick={() => setAutoScenarioId("ecb")}
                className={[
                  "rounded-xl border px-4 py-4 text-left transition",
                  autoScenarioId === "ecb"
                    ? "border-neutral-300 bg-neutral-900"
                    : "border-neutral-800 bg-neutral-950 hover:border-neutral-600",
                ].join(" ")}
              >
                <div className="text-sm text-neutral-400">AUTO SCENARIO 2</div>
                <div className="mt-1 text-neutral-100 font-medium">ECB Cut + Cautious Guidance</div>
                <div className="mt-1 text-xs text-neutral-500">EURUSD + XAUUSD</div>
              </button>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
              <div className="text-xs text-neutral-500">Headline</div>
              <div className="text-neutral-100 mt-1">{auto.headline}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {auto.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-neutral-700 px-2 py-1 text-xs text-neutral-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
              <div className="text-xs text-neutral-500">System log</div>
              <div className="mt-2 space-y-1 text-sm text-neutral-300 font-mono">
                {logLines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
                {showExecution ? null : <div className="text-neutral-600">▌</div>}
              </div>
              {showExecution ? (
                <div className="mt-3 space-y-1 text-sm font-semibold text-neutral-100">
                  {auto.execution.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>
              ) : null}
              {showExecution ? (
                <div className="mt-2 text-xs text-neutral-500">{auto.stamp}</div>
              ) : null}
            </div>

            {showReveal ? (
              <div className="grid gap-3 md:grid-cols-2">
                <PairLegCard
                  title={`${auto.legA.label}  Intraday reaction (5-minute candles)`}
                  leg={auto.legA}
                  revealCount={revealCount}
                />
                <PairLegCard
                  title={`${auto.legB.label}  Intraday reaction (5-minute candles)`}
                  leg={auto.legB}
                  revealCount={revealCount}
                />
              </div>
            ) : null}

            <div className="space-y-2 text-neutral-400 text-sm">
              <div>Why this pair makes sense:</div>
              {auto.whyFits.map((line) => (
                <div key={line}>{line}</div>
              ))}
              <div>Why it can still fail:</div>
              {auto.whyFails.map((line) => (
                <div key={line}>{line}</div>
              ))}
              <div className="border-t border-neutral-800 pt-2 text-neutral-300">
                This system doesn’t remove uncertainty. It limits escalation.
              </div>
              <div className="text-neutral-400">
                Structure reacts. It does not predict.
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-neutral-400">
            Human Mode keeps your decision in focus. Switch to System Mode to see how a ruleset would
            react using two legs.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button className="text-sm text-neutral-500 hover:text-neutral-300 transition" onClick={props.onBack}>
          Back
        </button>

        <button
          className="rounded-xl bg-neutral-100 text-neutral-950 px-5 py-3 hover:bg-neutral-200 transition"
          onClick={props.onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function PairLegCard(props: {
  title: string;
  revealCount: number;
  leg: {
    label: string;
    t0: number[];
    future: number[];
    direction: "BUY" | "SELL";
  };
}) {
  const { leg, title, revealCount } = props;
  const fullSeries = [...leg.t0, ...leg.future];
  const visibleSeries = fullSeries.slice(0, Math.max(2, revealCount));
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 space-y-2">
      <div className="text-xs text-neutral-500">{title}</div>
      <Sparkline series={visibleSeries} />
      <div className="text-xs text-neutral-500">T0 → T0+ window</div>
    </div>
  );
}

function Sparkline({ series }: { series: number[] }) {
  const width = 220;
  const height = 64;
  const step = series.length > 1 ? width / (series.length - 1) : width;
  const points = series
    .map((v, i) => `${i * step},${height - (v / 100) * height}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-2 h-12 w-full">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-neutral-400"
        points={points}
      />
    </svg>
  );
}

