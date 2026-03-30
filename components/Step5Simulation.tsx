"use client";

import { useEffect, useMemo, useState } from "react";
import StepBlock from "@/components/StepBlock";
import ScenarioPicker from "@/components/ScenarioPicker";
import CandlesChart, { Candle } from "@/components/CandlesChart";
import { fetchCandles } from "@/lib/market";
import { humanScenarios } from "@/lib/scenarios";
import { setLocal } from "@/lib/utils";

export default function Step5Simulation() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [splitIndex, setSplitIndex] = useState<number>(0);
  const [choice, setChoice] = useState<"BUY" | "SELL" | "WAIT" | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(7);
  const [timedOut, setTimedOut] = useState(false);
  const [revealCount, setRevealCount] = useState<number>(0);

  const scenario = useMemo(
    () => humanScenarios.find((s) => s.id === selectedId) ?? null,
    [selectedId]
  );

  useEffect(() => {
    if (!scenario) return;
    const start = new Date(new Date(scenario.eventTimeISO).getTime() - scenario.windowMinutes * 60000);
    const end = new Date(new Date(scenario.eventTimeISO).getTime() + scenario.windowMinutes * 60000);

    const load = async () => {
      try {
        const data = await fetchCandles({
          symbol: scenario.instrument,
          interval: scenario.interval,
          start: start.toISOString(),
          end: end.toISOString(),
        });
        setCandles(data);
        const idx = data.findIndex((c) => c.t >= new Date(scenario.eventTimeISO).getTime());
        setSplitIndex(idx > 2 ? idx : Math.floor(data.length / 2));
      } catch {
        setCandles([]);
        setSplitIndex(0);
      }
    };

    load();
    setChoice(null);
    setRevealed(false);
    setTimedOut(false);
    setSecondsLeft(7);
    setRevealCount(0);
  }, [scenario]);

  useEffect(() => {
    if (!scenario || choice) return;
    setSecondsLeft(7);
    const t = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(t);
          setTimedOut(true);
          lockIn("WAIT", true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario, choice]);

  useEffect(() => {
    if (!revealed) return;
    const interval = window.setInterval(() => {
      setRevealCount((prev) => {
        const next = prev + 1;
        if (next >= candles.length) {
          window.clearInterval(interval);
          return candles.length;
        }
        return next;
      });
    }, 180);
    return () => window.clearInterval(interval);
  }, [revealed, candles.length]);

  function lockIn(next: "BUY" | "SELL" | "WAIT", fromTimeout = false) {
    if (choice) return;
    setChoice(next);
    setLocal("funnel.step5", {
      scenario: scenario?.id,
      choice: next,
      timedOut: fromTimeout,
    });
    window.setTimeout(() => {
      setRevealed(true);
      setRevealCount(splitIndex);
    }, 2200);
  }

  const preCandles = candles.slice(0, splitIndex);
  const postCandles = candles.slice(splitIndex);
  const endMoveUp = postCandles.length
    ? postCandles[postCandles.length - 1].c >= preCandles[preCandles.length - 1].c
    : false;
  const matched = choice
    ? choice === "WAIT"
      ? false
      : (choice === "BUY" && endMoveUp) || (choice === "SELL" && !endMoveUp)
    : false;

  return (
    <StepBlock title="Step 5" subtitle="Live Trading Simulation">
      <div className="space-y-4 text-neutral-300">
        <p>Choose a scenario.</p>
        <ScenarioPicker scenarios={humanScenarios} selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      {scenario ? (
        <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <div className="text-xs text-neutral-500">Headline</div>
          <div className="text-neutral-100">{scenario.headline}</div>
          <div className="text-xs text-neutral-500">
            {scenario.timestamp} · {scenario.instrument} · 5m candles
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>Price up to T0</span>
              <span>{secondsLeft}s remaining</span>
            </div>
            <CandlesChart candles={preCandles} />
          </div>

          <div className="space-y-2 text-neutral-300">
            {scenario.context.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>

          <div className="text-neutral-300">{scenario.prompt}</div>

          <div className="grid gap-3 md:grid-cols-3">
            {(["BUY", "SELL", "WAIT"] as const).map((opt) => {
              const active = choice === opt;
              return (
                <button
                  key={opt}
                  onClick={() => lockIn(opt)}
                  disabled={!!choice}
                  className={[
                    "rounded-xl border px-4 py-3 text-left transition",
                    active
                      ? "border-neutral-200 bg-neutral-900"
                      : "border-neutral-800 bg-neutral-950 hover:border-neutral-600",
                    choice ? "opacity-70 cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {choice ? (
            <div className="text-sm text-neutral-400">
              Decision locked. {timedOut ? "Timed out." : "Recorded."}
            </div>
          ) : null}

          {revealed ? (
            <div className="space-y-3">
              <div className="text-neutral-300">
                {choice === "WAIT"
                  ? "No directional call recorded. The next move still happened."
                  : matched
                    ? "Your call matched the next move."
                    : "Your call didn’t match the next move."}
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <div className="text-xs text-neutral-500">Next move (revealed)</div>
                <CandlesChart candles={[...preCandles, ...postCandles]} highlightCount={revealCount} />
              </div>
              <div className="text-neutral-300">The headline is not the trade. The reaction is.</div>
              <div className="space-y-2 text-neutral-400">
                <div>Why this move makes sense:</div>
                {scenario.explainMakesSense.map((line) => (
                  <div key={line}>{line}</div>
                ))}
                <div>Why it could have moved the other way:</div>
                {scenario.explainCanFail.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </StepBlock>
  );
}
