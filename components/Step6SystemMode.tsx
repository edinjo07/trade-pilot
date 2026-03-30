"use client";

import { useEffect, useMemo, useState } from "react";
import StepBlock from "@/components/StepBlock";
import CandlesChart, { Candle } from "@/components/CandlesChart";
import SystemLog from "@/components/SystemLog";
import { fetchCandles } from "@/lib/market";
import { systemScenarios } from "@/lib/scenarios";
import { setLocal } from "@/lib/utils";

export default function Step6SystemMode() {
  const [mode, setMode] = useState<"HUMAN" | "SYSTEM">("SYSTEM");
  const [scenarioId, setScenarioId] = useState(systemScenarios[0].id);
  const [showExecution, setShowExecution] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [revealCount, setRevealCount] = useState(0);
  const [candlesA, setCandlesA] = useState<Candle[]>([]);
  const [candlesB, setCandlesB] = useState<Candle[]>([]);

  const scenario = useMemo(
    () => systemScenarios.find((s) => s.id === scenarioId) ?? systemScenarios[0],
    [scenarioId]
  );

  useEffect(() => {
    if (mode !== "SYSTEM") return;
    setShowExecution(false);
    setShowReveal(false);
    setRevealCount(0);

    const load = async () => {
      const start = new Date(new Date(scenario.eventTimeISO).getTime() - scenario.windowMinutes * 60000);
      const end = new Date(new Date(scenario.eventTimeISO).getTime() + scenario.windowMinutes * 60000);

      const [a, b] = await Promise.all([
        fetchCandles({
          symbol: scenario.legs[0].symbol,
          interval: scenario.interval,
          start: start.toISOString(),
          end: end.toISOString(),
        }),
        fetchCandles({
          symbol: scenario.legs[1].symbol,
          interval: scenario.interval,
          start: start.toISOString(),
          end: end.toISOString(),
        }),
      ]);

      setCandlesA(a);
      setCandlesB(b);
    };

    load().catch(() => {
      setCandlesA([]);
      setCandlesB([]);
    });
  }, [scenario, mode]);

  useEffect(() => {
    if (!showExecution) return;
    const t = window.setTimeout(() => {
      setShowReveal(true);
      setLocal("funnel.step6", { scenario: scenario.id });
    }, 700);
    return () => window.clearTimeout(t);
  }, [showExecution, scenario.id]);

  useEffect(() => {
    if (!showReveal) return;
    const interval = window.setInterval(() => {
      setRevealCount((prev) => {
        const next = prev + 1;
        const max = Math.max(candlesA.length, candlesB.length);
        if (next >= max) {
          window.clearInterval(interval);
          return max;
        }
        return next;
      });
    }, 200);
    return () => window.clearInterval(interval);
  }, [showReveal, candlesA.length, candlesB.length]);

  return (
    <StepBlock title="Step 6" subtitle="System Mode">
      <div className="space-y-2 text-neutral-300">
        <p>A rule-based reaction engine reads the same information you just saw.</p>
        <p>This system doesn’t predict. It reacts under constraints.</p>
      </div>

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
        <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <div className="grid gap-3 md:grid-cols-2">
            {systemScenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => setScenarioId(s.id)}
                className={[
                  "rounded-xl border px-4 py-4 text-left transition",
                  scenarioId === s.id
                    ? "border-neutral-200 bg-neutral-900"
                    : "border-neutral-800 bg-neutral-950 hover:border-neutral-600",
                ].join(" ")}
              >
                <div className="text-sm text-neutral-400">AUTO SCENARIO</div>
                <div className="mt-1 text-neutral-100 font-medium">{s.title}</div>
                <div className="mt-1 text-xs text-neutral-500">{s.legs.map((l) => l.label).join(" + ")}</div>
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
            <div className="text-xs text-neutral-500">Headline</div>
            <div className="text-neutral-100 mt-1">{scenario.headline}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {scenario.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-neutral-700 px-2 py-1 text-xs text-neutral-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
            <div className="text-xs text-neutral-500">System log</div>
            <SystemLog
              lines={scenario.logs}
              pauses={{ 5: 1200, 7: 700 }}
              intervalMs={700}
              onComplete={() => setShowExecution(true)}
            />
            {showExecution ? (
              <div className="mt-3 space-y-1 text-sm font-semibold text-neutral-100">
                {scenario.execution.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            ) : null}
            {showExecution ? (
              <div className="mt-2 text-xs text-neutral-500">{scenario.stamp}</div>
            ) : null}
          </div>

          {showReveal ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
                <div className="text-xs text-neutral-500">{scenario.legs[0].label}  Intraday reaction (5-minute candles)</div>
                <CandlesChart candles={candlesA} highlightCount={revealCount} />
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
                <div className="text-xs text-neutral-500">{scenario.legs[1].label}  Intraday reaction (5-minute candles)</div>
                <CandlesChart candles={candlesB} highlightCount={revealCount} />
              </div>
            </div>
          ) : null}

          <div className="space-y-2 text-neutral-400 text-sm">
            <div>Why this reaction makes sense:</div>
            {scenario.explainMakesSense.map((line) => (
              <div key={line}>{line}</div>
            ))}
            <div>Why it can still fail:</div>
            {scenario.explainCanFail.map((line) => (
              <div key={line}>{line}</div>
            ))}
            <div className="border-t border-neutral-800 pt-2 text-neutral-300">
              This system doesn’t remove uncertainty. It limits escalation.
            </div>
            <div className="text-neutral-400">Structure reacts. It does not predict.</div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-neutral-400">
          Human Mode keeps your decision in focus. Switch to System Mode to see how a ruleset reacts using two legs.
        </div>
      )}
    </StepBlock>
  );
}
