"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FunnelSessionClient } from "@/lib/funnel/types";
import type { Action } from "@/lib/funnel/reducer";

type Choice = "BUY" | "SELL" | "WAIT";
type Scenario = {
  id: string;
  instrument: "XAUUSD" | "XAGUSD" | "EURUSD" | "SPY";
  headline: string;
  timestamp: string;
  horizon: "1h" | "4h" | "1d";
  label: string;
  prompt: string;
  context: string[];
  t0Series: number[];
  futureSeries: number[];
  explanationUp: string;
  explanationDown: string;
};

export default function Section5AdaptiveQuiz({
  state,
  dispatch,
}: {
  state: FunnelSessionClient;
  dispatch: React.Dispatch<Action>;
}) {
  const startedAtRef = useRef<number>(Date.now());
  const [choice, setChoice] = useState<Choice | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [outcomeLine, setOutcomeLine] = useState<string | null>(null);
  const [recorded, setRecorded] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(7);
  const startingBalance = 1000;

  const scenarios = useMemo<Scenario[]>(
    () => [
      {
        id: "xau_cpi_hot",
        instrument: "XAUUSD",
        label: "Gold  US CPI surprise",
        headline: "US CPI comes in hotter than expected",
        timestamp: "Apr 10, 2024 · 08:30 ET",
        horizon: "4h",
        prompt: "You have 7 seconds. Based on this headline, what’s the first move you’d speculate?",
        context: [
          "Hot CPI often pushes rate-cut expectations down, yields up, USD up.",
          "Gold tends to struggle when real yields rise (opportunity cost).",
        ],
        t0Series: [68, 69, 70, 69, 71, 70, 72, 73, 72, 74, 73, 75, 74, 76, 75, 77],
        futureSeries: [76, 74, 73, 72, 71, 70, 69, 70, 69, 68, 67, 68, 67, 66, 67, 66, 65, 66, 65, 64],
        explanationUp:
          "Sometimes inflation headlines trigger hedge demand and risk-off flows, lifting gold.",
        explanationDown:
          "Hot CPI can reprice yields and the USD quickly, pressuring gold in the first move.",
      },
      {
        id: "eurusd_ecb_cut",
        instrument: "EURUSD",
        label: "EUR/USD  ECB cut (cautious guidance)",
        headline: "ECB cuts rates for the first time since 2019; euro ticks up as guidance stays cautious",
        timestamp: "Jun 6, 2024",
        horizon: "1h",
        prompt: "7 seconds. What’s the first move you’d speculate for EUR/USD?",
        context: [
          "A rate cut can weaken a currency  unless the cut is fully priced.",
          "The euro rose after the cut as investors weighed cautious guidance.",
        ],
        t0Series: [51, 52, 51, 50, 51, 52, 51, 52, 53, 52, 53, 54, 53, 54, 55, 54],
        futureSeries: [55, 56, 57, 56, 57, 58, 57, 58, 57, 56, 57, 56, 55, 56, 55, 54, 55, 54, 55, 54],
        explanationUp:
          "A priced-in cut plus cautious guidance can support the euro short-term.",
        explanationDown:
          "If the press conference stresses growth weakness or more cuts, EUR can fade.",
      },
      {
        id: "spy_earnings",
        instrument: "SPY",
        label: "SPY  Hot CPI hits stocks",
        headline: "Hotter-than-expected CPI knocks stocks lower as rate-cut hopes cool",
        timestamp: "Apr 10, 2024 · US session",
        horizon: "4h",
        prompt: "7 seconds. First move on SPY?",
        context: [
          "Sticky inflation lifts expected rates and discount rates.",
          "Equities often sell off quickly on rate repricing shocks.",
        ],
        t0Series: [52, 53, 52, 51, 52, 53, 52, 53, 52, 51, 52, 51, 50, 51, 50, 49],
        futureSeries: [48, 47, 46, 47, 45, 44, 45, 44, 43, 44, 43, 42, 43, 42, 41, 42, 41, 40, 41, 40],
        explanationUp:
          "Dip buyers and positioning can create sharp rebounds even after bad CPI.",
        explanationDown:
          "Rates repricing hits equities fast; risk-off flows dominate the first move.",
      },
    ],
    []
  );

  const scenario = useMemo(
    () => scenarios.find((s) => s.id === selectedScenarioId) ?? null,
    [scenarios, selectedScenarioId]
  );
  const movedUp = scenario
    ? scenario.futureSeries[scenario.futureSeries.length - 1] >=
      scenario.t0Series[scenario.t0Series.length - 1]
    : false;
  const balance = scenario && choice
    ? computeBalance(
        startingBalance,
        scenario.t0Series[scenario.t0Series.length - 1],
        scenario.futureSeries[scenario.futureSeries.length - 1],
        choice
      )
    : startingBalance;
  const pnl = balance - startingBalance;
  const pnlPct = (pnl / startingBalance) * 100;
  const pnlPositive = pnl >= 0;
  const pnlColor = pnlPositive ? "text-emerald-400" : "text-red-400";
  const balanceSeries = useMemo(
    () => (choice ? buildBalanceSeries(startingBalance, balance) : [startingBalance]),
    [choice, startingBalance, balance]
  );

  useEffect(() => {
    startedAtRef.current = Date.now();
    setChoice(null);
    setRevealed(false);
    setFinished(false);
    setOutcomeLine(null);
    setRecorded(false);
    setSecondsLeft(7);
  }, [state.sessionId, selectedScenarioId]);

  useEffect(() => {
    if (!scenario || choice) return;
    setSecondsLeft(7);
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          lockIn("WAIT", true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario, choice]);

  useEffect(() => {
    if (!choice || revealed) return;
    const revealTimer = window.setTimeout(() => {
      setRevealed(true);
    }, 2200);
    return () => window.clearTimeout(revealTimer);
  }, [choice, revealed]);

  useEffect(() => {
    if (!revealed || finished) return;
    const finishTimer = window.setTimeout(() => {
      setFinished(true);
      dispatch({ type: "S5_FINISH" });
    }, 2100);
    return () => window.clearTimeout(finishTimer);
  }, [revealed, finished, dispatch]);

  function lockIn(next: Choice, fromTimeout = false) {
    if (choice || !scenario) return;
    const endFuture = scenario.futureSeries[scenario.futureSeries.length - 1];
    const endT0 = scenario.t0Series[scenario.t0Series.length - 1];
    const movedUp = endFuture >= endT0;
    const matched =
      (next === "BUY" && movedUp) || (next === "SELL" && !movedUp);

    setChoice(next);
    setOutcomeLine(
      next === "WAIT"
        ? fromTimeout
          ? "No decision recorded in time. The next move still happened."
          : "No directional call recorded. The next move still happened."
        : matched
          ? "Your call matched the next move."
          : "Your call didn’t match the next move."
    );
    setRecorded(true);
    dispatch({
      type: "PATCH_DERIVED",
      patch: { pressureChoice: next, pressureTimeMs: Date.now() - startedAtRef.current },
    });
    void logEvent(state.sessionId, "pressure_choice", {
      choice: next,
      tMs: Date.now() - startedAtRef.current,
    });
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="text-lg md:text-xl font-medium text-neutral-200">
          You’ve noticed the patterns. Now you decide inside uncertainty.
        </div>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 md:p-7 space-y-4">
        {!scenario ? (
          <div className="space-y-4">
            <div className="text-sm text-neutral-500">Choose a scenario</div>
            <div className="grid gap-3 md:grid-cols-3">
              {scenarios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedScenarioId(s.id)}
                  className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-4 text-left hover:border-neutral-600 transition"
                >
                  <div className="text-sm text-neutral-400">{s.instrument}</div>
                  <div className="mt-2 text-neutral-100 font-medium">{s.label}</div>
                  <div className="mt-1 text-xs text-neutral-500">{s.timestamp}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-4 space-y-2">
              <div className="text-xs text-neutral-500">Headline</div>
              <div className="text-neutral-100">{scenario.headline}</div>
              <div className="text-xs text-neutral-500">
                {scenario.timestamp} · {scenario.instrument} · Horizon {scenario.horizon}
              </div>
            </div>

            <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <div>Price movement (up to now)</div>
                <div>{secondsLeft}s remaining</div>
              </div>
              <Sparkline series={scenario.t0Series} />
            </div>

            <div className="space-y-1 text-neutral-300">
              {scenario.context.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>

            <div className="text-neutral-300 leading-relaxed">{scenario.prompt}</div>

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
                        ? "border-neutral-300 bg-neutral-900"
                        : "border-neutral-800 bg-neutral-950 hover:border-neutral-600",
                      choice ? "opacity-70 cursor-not-allowed" : "",
                    ].join(" ")}
                  >
                    <div className="font-medium">{opt}</div>
                  </button>
                );
              })}
            </div>

            {choice ? (
              <div className="text-sm text-neutral-400">
                Decision locked{recorded ? ". Recorded." : "."}
              </div>
            ) : null}

            {choice ? (
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs text-neutral-500">Simulated balance</div>
                    <div className={["mt-2 text-2xl font-semibold", pnlColor].join(" ")}>
                      ${formatMoney(balance)}
                    </div>
                    <div className={
                      ["mt-1 text-sm", pnlColor].join(" ")
                    }>
                      {pnlPositive ? "+" : ""}${formatMoney(pnl)} ({pnlPositive ? "+" : ""}{pnlPct.toFixed(2)}%)
                    </div>
                  </div>
                  <div className="text-xs text-neutral-500 text-right">
                    Starting
                    <div className="mt-1 text-neutral-300">${formatMoney(startingBalance)}</div>
                  </div>
                </div>
                <div className="mt-3 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2">
                  <div className="text-[11px] text-neutral-500">Balance curve</div>
                  <Sparkline series={balanceSeries} />
                </div>
                <div className="text-xs text-neutral-500 mt-2">
                  Example outcome from this historical move. Not advice.
                </div>
              </div>
            ) : null}

            {revealed && outcomeLine ? (
              <div className="space-y-3">
                <div className="text-neutral-300">{outcomeLine}</div>
                <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
                  <div className="text-xs text-neutral-500">Next move (revealed)</div>
                  <Sparkline series={[...scenario.t0Series, ...scenario.futureSeries]} />
                </div>
                <div className="text-neutral-300">
                  The headline is not the trade. The reaction is.
                </div>
                <div className="space-y-2 text-neutral-400">
                  <div>Why this move makes sense:</div>
                  <div>{movedUp ? scenario.explanationUp : scenario.explanationDown}</div>
                  <div>Why it could have moved the other way:</div>
                  <div>{movedUp ? scenario.explanationDown : scenario.explanationUp}</div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
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

function formatMoney(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function buildBalanceSeries(starting: number, ending: number) {
  const points = 12;
  const series: number[] = [];
  for (let i = 0; i < points; i += 1) {
    const t = i / (points - 1);
    const jitter = (Math.random() - 0.5) * (ending - starting) * 0.06;
    series.push(starting + (ending - starting) * t + jitter);
  }
  return series;
}

function computeBalance(
  starting: number,
  startPrice: number,
  endPrice: number,
  choice: Choice
) {
  if (choice === "WAIT") return starting;
  const change = (endPrice - startPrice) / startPrice;
  const direction = choice === "BUY" ? 1 : -1;
  return starting * (1 + change * direction);
}

async function logEvent(sessionId: string, name: string, payload?: any) {
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, name, payload }),
    });
  } catch {
    // ignore
  }
}
