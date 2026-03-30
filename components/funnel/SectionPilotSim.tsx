"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  PILOT_MODES,
  computeSimulation,
  type PilotMode,
  type SimCandle,
  type SimSignal,
  type SimResult,
} from "@/lib/pilotModes";

// ── Inline SimChart ───────────────────────────────────────────────────────────

function SimChart({
  candles,
  visibleCount,
  signals,
  fastLine,
  slowLine,
  colorHex,
}: {
  candles: SimCandle[];
  visibleCount: number;
  signals: SimSignal[];
  fastLine?: (number | null)[];
  slowLine?: (number | null)[];
  colorHex: string;
}) {
  const W = 500;
  const H = 160;
  const PAD = { l: 8, r: 8, t: 16, b: 16 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const total = candles.length;

  // Fixed Y scale based on ALL candles so chart doesn't jump
  const yMin = Math.min(...candles.map((c) => c.l));
  const yMax = Math.max(...candles.map((c) => c.h));
  const yRange = yMax - yMin || 1;

  const toY = (price: number) =>
    PAD.t + chartH * (1 - (price - yMin) / yRange);
  const toX = (i: number) =>
    PAD.l + (i + 0.5) * (chartW / total);
  const slotW = chartW / total;
  const bodyW = Math.max(2, slotW * 0.55);

  const visible = candles.slice(0, visibleCount);
  const visibleSignals = signals.filter((s) => s.index < visibleCount);

  // Build polyline points for an indicator series
  const toPolyPoints = (values: (number | null)[] | undefined) => {
    if (!values) return "";
    const parts: string[] = [];
    for (let i = 0; i < Math.min(visibleCount, values.length); i++) {
      const v = values[i];
      if (v == null) continue;
      parts.push(`${toX(i).toFixed(1)},${toY(v).toFixed(1)}`);
    }
    return parts.join(" ");
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-40"
      aria-label="Strategy simulation chart"
    >
      {/* Background */}
      <rect width={W} height={H} fill="#0d0d0d" rx="6" />

      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={PAD.l}
          x2={W - PAD.r}
          y1={PAD.t + chartH * f}
          y2={PAD.t + chartH * f}
          stroke="#1f1f1f"
          strokeWidth="1"
        />
      ))}

      {/* Slow MA line */}
      {slowLine && (
        <polyline
          points={toPolyPoints(slowLine)}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.5"
          opacity="0.75"
          strokeLinejoin="round"
        />
      )}

      {/* Fast MA / MACD signal line */}
      {fastLine && (
        <polyline
          points={toPolyPoints(fastLine)}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1.5"
          opacity="0.75"
          strokeLinejoin="round"
        />
      )}

      {/* Candles */}
      {visible.map((c, i) => {
        const x = toX(i);
        const openY = toY(c.o);
        const closeY = toY(c.c);
        const highY = toY(c.h);
        const lowY = toY(c.l);
        const isGreen = c.c >= c.o;
        const color = isGreen ? "#10b981" : "#ef4444";
        const bodyTop = Math.min(openY, closeY);
        const bodyH = Math.max(1.5, Math.abs(closeY - openY));

        return (
          <g key={c.t}>
            <line
              x1={x}
              y1={highY}
              x2={x}
              y2={lowY}
              stroke={color}
              strokeWidth="1"
            />
            <rect
              x={x - bodyW / 2}
              y={bodyTop}
              width={bodyW}
              height={bodyH}
              fill={color}
              rx="0.5"
            />
          </g>
        );
      })}

      {/* Signal markers */}
      {visibleSignals.map((sig) => {
        const x = toX(sig.index);
        const candle = candles[sig.index];
        if (!candle) return null;

        if (sig.type === "BUY") {
          const tipY = toY(candle.l) + 14;
          return (
            <g key={`sig-${sig.index}`}>
              {/* Glow circle */}
              <circle cx={x} cy={tipY - 3} r="7" fill="#10b98125" />
              {/* Triangle up */}
              <polygon
                points={`${x},${tipY - 10} ${x - 6},${tipY + 1} ${x + 6},${tipY + 1}`}
                fill="#10b981"
              />
            </g>
          );
        }

        const tipY = toY(candle.h) - 14;
        return (
          <g key={`sig-${sig.index}`}>
            <circle cx={x} cy={tipY + 3} r="7" fill="#ef444425" />
            {/* Triangle down */}
            <polygon
              points={`${x},${tipY + 10} ${x - 6},${tipY - 1} ${x + 6},${tipY - 1}`}
              fill="#ef4444"
            />
          </g>
        );
      })}

      {/* Progress line at front edge */}
      {visibleCount > 0 && visibleCount < total && (
        <line
          x1={toX(visibleCount - 1) + slotW / 2}
          y1={PAD.t}
          x2={toX(visibleCount - 1) + slotW / 2}
          y2={H - PAD.b}
          stroke={colorHex}
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.5"
        />
      )}
    </svg>
  );
}

// ── Log line types ────────────────────────────────────────────────────────────

type LogEntry = { level: "INFO" | "SIGNAL" | "TRADE" | "RISK" | "AI"; text: string };

function buildLogSchedule(
  modeId: PilotMode["id"],
  result: SimResult,
): Array<{ atCandle: number; entry: LogEntry }> {
  const entries: Array<{ atCandle: number; entry: LogEntry }> = [];

  const AI_SENTIMENTS = [
    { score: "0.81", label: "BULLISH", headline: "ETF inflows at weekly high · institutional buying detected" },
    { score: "0.74", label:"BULLISH", headline: "Fed signals steady rates · risk-on environment confirmed" },
    { score: "0.68", label: "BULLISH", headline: "Strong PMI data · macro tailwind aligned with signal" },
    { score: "0.23", label: "BEARISH", headline: "Negative macro headline  signal suppressed by AI filter" },
    { score: "0.77", label: "BULLISH", headline: "Whale accumulation detected · momentum confirmed by AI" },
  ];
  let aiIdx = 0;

  entries.push({ atCandle: 0,  entry: { level: "INFO",   text: "Bot initialising – loading historical candles..." } });
  entries.push({ atCandle: 2,  entry: { level: "INFO",   text: "Candle data loaded · calculating indicators..." } });
  entries.push({ atCandle: 3,  entry: { level: "AI",     text: "Claude AI news filter enabled · monitoring live headlines..." } });

  if (modeId === "MA_CROSS") {
    entries.push({ atCandle: 5,  entry: { level: "INFO",   text: "Fast MA (9) initialised · Slow MA (21) warming up..." } });
    entries.push({ atCandle: 10, entry: { level: "INFO",   text: "MA crossover watch active · monitoring every tick..." } });
  } else if (modeId === "RSI") {
    entries.push({ atCandle: 5,  entry: { level: "INFO",   text: "RSI(14) engine active · watching for extremes..." } });
    entries.push({ atCandle: 10, entry: { level: "INFO",   text: "Scanning for overbought (>70) or oversold (<30) zones..." } });
  } else if (modeId === "MACD") {
    entries.push({ atCandle: 5,  entry: { level: "INFO",   text: "EMA(12) and EMA(26) computed · MACD histogram active..." } });
    entries.push({ atCandle: 10, entry: { level: "INFO",   text: "Signal line (EMA-9 of MACD) tracking divergence..." } });
  } else {
    entries.push({ atCandle: 5,  entry: { level: "INFO",   text: `Lookback window: 10 bars · measuring directional strength...` } });
    entries.push({ atCandle: 10, entry: { level: "INFO",   text: "Momentum engine armed · no signal yet..." } });
  }

  for (const sig of result.signals) {
    const px = sig.price.toFixed(2);
    if (sig.type === "BUY") {
      const ai = AI_SENTIMENTS[aiIdx % AI_SENTIMENTS.length];
      aiIdx++;
      // Pre-signal: Claude AI sentiment query
      entries.push({ atCandle: Math.max(0, sig.index - 2), entry: { level: "AI", text: `Querying Claude AI for asset sentiment...` } });
      entries.push({ atCandle: Math.max(0, sig.index - 1), entry: { level: "AI", text: `Claude AI: ${ai.label} (${ai.score}) – ${ai.headline}` } });
      if (ai.label === "BEARISH") {
        entries.push({ atCandle: sig.index, entry: { level: "AI", text: `Signal suppressed – opposing sentiment detected, Pilot waits` } });
      } else {
        entries.push({ atCandle: sig.index,     entry: { level: "SIGNAL", text: `▲ ${sig.label} · AI sentiment confirmed` } });
        entries.push({ atCandle: sig.index + 1, entry: { level: "TRADE",  text: `✓ BUY @ ${px} · SL auto-set · TP locked in` } });
      }
    } else {
      entries.push({ atCandle: sig.index,     entry: { level: "SIGNAL", text: `▼ ${sig.label}` } });
      entries.push({ atCandle: sig.index + 1, entry: { level: "TRADE",  text: `✓ SELL @ ${px} · Position closed · P&L logged` } });
    }
  }

  const last = result.candles.length - 2;
  entries.push({ atCandle: last, entry: { level: "RISK", text: "Drawdown check passed · equity curve healthy" } });
  entries.push({ atCandle: last + 1, entry: { level: "INFO", text: `Cycle complete · ${result.signals.length} signal(s) fired this session` } });

  return entries;
}

const LOG_COLORS: Record<LogEntry["level"], string> = {
  INFO:   "text-neutral-400",
  SIGNAL: "text-yellow-400 font-semibold",
  TRADE:  "text-emerald-400 font-semibold",
  RISK:   "text-blue-400",
  AI:     "text-violet-400 font-semibold",
};

const LOG_PREFIXES: Record<LogEntry["level"], string> = {
  INFO:   "[INFO]  ",
  SIGNAL: "[SIGNAL]",
  TRADE:  "[TRADE] ",
  RISK:   "[RISK]  ",
  AI:     "[AI]    ",
};

// ── Main component ────────────────────────────────────────────────────────────

export default function SectionPilotSim({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const [activeId, setActiveId] = useState<PilotMode["id"]>("MA_CROSS");
  const [result, setResult] = useState<SimResult>(() =>
    computeSimulation("MA_CROSS"),
  );
  const [visibleCount, setVisibleCount] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logScheduleRef = useRef<Array<{ atCandle: number; entry: LogEntry }>>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startSim = useCallback(
    (id: PilotMode["id"]) => {
      stopTimer();
      const sim = computeSimulation(id);
      setResult(sim);
      setVisibleCount(0);
      setLogs([]);
      setDone(false);
      setRunning(true);

      logScheduleRef.current = buildLogSchedule(id, sim);
      const total = sim.candles.length;
      let current = 0;

      timerRef.current = setInterval(() => {
        current++;

        // Append any log entries scheduled for this candle
        const due = logScheduleRef.current.filter((e) => e.atCandle === current);
        if (due.length > 0) {
          setLogs((prev) => [...prev, ...due.map((d) => d.entry)]);
        }

        setVisibleCount(current);

        if (current >= total) {
          stopTimer();
          setRunning(false);
          setDone(true);
        }
      }, 90);
    },
    [stopTimer],
  );

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  // Start immediately on mount
  useEffect(() => {
    startSim("MA_CROSS");
    return stopTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (id: PilotMode["id"]) => {
    setActiveId(id);
    startSim(id);
  };

  const mode = PILOT_MODES.find((m) => m.id === activeId)!;
  const buys  = result.signals.filter((s) => s.type === "BUY" && result.signals.indexOf(s) < visibleCount).length;
  const sells = result.signals.filter((s) => s.type === "SELL" && result.signals.indexOf(s) < visibleCount).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-200 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-violet-600">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-500" />
          </span>
          Live Simulation · Claude AI Active
        </div>
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
          Watch Trading Pilot Think in Real-Time
        </h2>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Pick a strategy. See how the bot detects a signal, checks live news sentiment via Claude AI, then fires or suppresses the trade  automatically.
        </p>
      </div>

      {/* Strategy selector */}
      <div className="grid grid-cols-2 gap-2">
        {PILOT_MODES.map((m) => {
          const active = m.id === activeId;
          return (
            <button
              key={m.id}
              onClick={() => handleSelect(m.id)}
              className={[
                "rounded-xl border-2 px-3 py-3 text-left transition-all",
                active
                  ? `border-gray-900 bg-gray-900 text-white shadow-lg`
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-400",
              ].join(" ")}
            >
              <div
                className={[
                  "text-[10px] font-bold uppercase tracking-widest mb-1",
                  active ? "text-gray-400" : "text-gray-400",
                ].join(" ")}
                style={{ color: active ? m.colorHex : undefined }}
              >
                {m.badge}
              </div>
              <div className="text-sm font-semibold leading-tight">{m.name}</div>
              <div className="mt-1.5 flex items-center gap-2 text-xs">
                <span
                  className={[
                    "rounded-full px-2 py-0.5 font-bold",
                    active ? "bg-white/10 text-white" : "bg-gray-100 text-gray-600",
                  ].join(" ")}
                >
                  {m.winRate}% win rate
                </span>
                <span
                  className={active ? "text-gray-400" : "text-gray-400"}
                  style={{ color: active ? m.colorHex : undefined }}
                >
                  {m.avgR}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Chart + Log */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Chart header */}
        <div className="bg-gray-900 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: running ? mode.colorHex : "#6b7280" }}
            />
            <span className="text-xs text-gray-300 font-mono">
              TradePilot · {mode.name} ·{" "}
              <span style={{ color: mode.colorHex }}>
                {running ? "SCANNING" : done ? "COMPLETE" : "IDLE"}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-violet-400 font-semibold">🧠 AI</span>
            <span className="text-emerald-400">▲ {buys} BUY</span>
            <span className="text-red-400">▼ {sells} SELL</span>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="bg-[#0d0d0d] px-2 py-2">
          <SimChart
            candles={result.candles}
            visibleCount={visibleCount}
            signals={result.signals}
            fastLine={result.fastLine}
            slowLine={result.slowLine}
            colorHex={mode.colorHex}
          />
        </div>

        {/* Legend for MA chart */}
        {(activeId === "MA_CROSS" || activeId === "MACD") && (
          <div className="bg-[#0d0d0d] px-4 pb-2 flex items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-5 h-0.5 rounded bg-blue-500" />
              <span className="text-gray-500">
                {activeId === "MA_CROSS" ? "Fast MA (9)" : "EMA 12"}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-5 h-0.5 rounded bg-amber-500" />
              <span className="text-gray-500">
                {activeId === "MA_CROSS" ? "Slow MA (21)" : "EMA 26"}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500">▲</span>
              <span className="text-gray-500">BUY signal</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-red-500">▼</span>
              <span className="text-gray-500">SELL signal</span>
            </span>
          </div>
        )}

        {/* Log terminal */}
        <div
          ref={logRef}
          className="bg-[#0a0a0a] h-32 overflow-y-auto px-4 py-3 space-y-0.5 font-mono text-[11px] border-t border-[#1a1a1a]"
        >
          {logs.map((log, i) => (
            <div key={i} className={LOG_COLORS[log.level]}>
              <span className="text-gray-600 mr-2">{LOG_PREFIXES[log.level]}</span>
              {log.text}
            </div>
          ))}
          {running && (
            <div className="text-gray-600 flex items-center gap-1">
              <span className="animate-pulse">█</span>
            </div>
          )}
        </div>
      </div>

      {/* Strategy description */}
      <div
        className="rounded-xl border-l-4 bg-gray-50 px-4 py-4 space-y-3"
        style={{ borderLeftColor: mode.colorHex }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
              How {mode.name} works
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {mode.description}
            </p>
          </div>
        </div>
        <div
          className="text-xs italic text-gray-500 border-t border-gray-200 pt-3"
        >
          💡 {mode.analogy}
        </div>
        <ul className="space-y-1.5">
          {mode.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
              <span style={{ color: mode.colorHex }} className="mt-0.5 shrink-0">✓</span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Risk controls callout */}
      <div className="rounded-xl bg-gray-900 text-white px-4 py-4 space-y-3">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Built-in risk controls  every strategy
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            ["🛑", "Stop-Loss", "Hard stop on every trade"],
            ["🎯", "Take-Profit", "Auto-exits at your target"],
            ["📉", "Daily loss cap", "Bot halts if limit hit"],
            ["🔒", "Max daily trades", "No overtrading in noise"],
          ].map(([icon, title, desc]) => (
            <div key={title} className="bg-white/5 rounded-lg px-3 py-2.5">
              <div className="text-base mb-0.5">{icon}</div>
              <div className="font-semibold text-gray-200">{title}</div>
              <div className="text-gray-500 text-[10px]">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Replay + CTA */}
      <div className="space-y-3">
        <button
          onClick={() => startSim(activeId)}
          disabled={running}
          className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 text-sm font-semibold text-gray-600 transition hover:border-gray-400 disabled:opacity-40"
        >
          {running ? "Simulation running…" : "↺ Run simulation again"}
        </button>
        <button
          onClick={onContinue}
          className="w-full rounded-xl bg-gray-900 py-4 text-base font-bold text-white shadow-lg transition hover:bg-gray-800 active:scale-[.98]"
        >
          I want TradePilot working for me →
        </button>
        <p className="text-center text-xs text-gray-400">
          Free to access · Takes 60 seconds · No credit card needed
        </p>
      </div>
    </div>
  );
}
