"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import RiskDisclaimer from "@/components/funnel/RiskDisclaimer";
import { useT } from "@/components/LocaleProvider";

// ── Scripted candle data: 60 candles ~ 1 minute of price action ──────────────
// Each candle: [open, high, low, close]
// Price goes sideways, dips, MA crossover fires, bot buys, price rallies, profit

const RAW_CANDLES: [number, number, number, number][] = [
  [100.00, 100.18, 99.82, 100.05],
  [100.05, 100.22, 99.90, 99.98],
  [99.98,  100.10, 99.75, 99.80],
  [99.80,  99.92,  99.60, 99.72],
  [99.72,  99.88,  99.55, 99.65],
  [99.65,  99.80,  99.48, 99.58],
  [99.58,  99.70,  99.40, 99.52],
  [99.52,  99.65,  99.38, 99.60],
  [99.60,  99.78,  99.45, 99.70],
  [99.70,  99.85,  99.55, 99.62],
  [99.62,  99.75,  99.50, 99.55],
  [99.55,  99.68,  99.42, 99.68],
  // Crossover fires here (candle 12) - bot buys
  [99.68,  99.95,  99.62, 99.90],
  [99.90,  100.15, 99.82, 100.10],
  [100.10, 100.38, 99.98, 100.32],
  [100.32, 100.55, 100.20,100.48],
  [100.48, 100.72, 100.35,100.65],
  [100.65, 100.90, 100.52,100.82],
  [100.82, 101.05, 100.68,100.98],
  [100.98, 101.22, 100.85,101.15],
  [101.15, 101.35, 100.98,101.25],
  [101.25, 101.48, 101.10,101.40],
  [101.40, 101.60, 101.28,101.52],
  [101.52, 101.72, 101.38,101.65],
  // TP1 hit (candle 24) - $12.92 profit locked
  [101.65, 101.80, 101.45,101.58],
  [101.58, 101.72, 101.35,101.48],
  [101.48, 101.62, 101.28,101.35],
  [101.35, 101.50, 101.15,101.22],
  [101.22, 101.38, 101.05,101.15],
  [101.15, 101.30, 100.95,101.08],
  // Second trade setup (candle 30)
  [101.08, 101.25, 100.92,101.18],
  [101.18, 101.38, 101.05,101.30],
  [101.30, 101.52, 101.18,101.45],
  [101.45, 101.65, 101.32,101.58],
  [101.58, 101.80, 101.44,101.72],
  // Second rally continues
  [101.72, 101.95, 101.58,101.88],
  [101.88, 102.10, 101.75,102.02],
  [102.02, 102.25, 101.88,102.18],
  [102.18, 102.40, 102.05,102.32],
  [102.32, 102.55, 102.18,102.48],
  // TP2 hit (candle 40) - +$5.41 more
  [102.48, 102.65, 102.32,102.55],
  [102.55, 102.72, 102.40,102.62],
  [102.62, 102.80, 102.48,102.72],
  [102.72, 102.88, 102.60,102.78],
  [102.78, 102.95, 102.65,102.85],
  [102.85, 103.00, 102.72,102.92],
  [102.92, 103.08, 102.80,102.98],
  [102.98, 103.12, 102.85,103.05],
  [103.05, 103.18, 102.92,103.10],
  [103.10, 103.22, 102.98,103.15],
  [103.15, 103.28, 103.02,103.20],
  [103.20, 103.32, 103.08,103.25],
  [103.25, 103.38, 103.12,103.30],
  [103.30, 103.42, 103.18,103.35],
  [103.35, 103.48, 103.22,103.40],
  [103.40, 103.52, 103.28,103.44],
  [103.44, 103.56, 103.30,103.48],
  [103.48, 103.60, 103.36,103.52],
  [103.52, 103.64, 103.40,103.56],
];

type Candle = { o: number; h: number; l: number; c: number };
const CANDLES: Candle[] = RAW_CANDLES.map(([o, h, l, c]) => ({ o, h, l, c }));

const BUY_CANDLE_IDX  = 12;  // green arrow appears here
const TP1_CANDLE_IDX  = 24;  // first profit flash
const BUY2_CANDLE_IDX = 30;  // second trade entry
const TP2_CANDLE_IDX  = 40;  // second profit flash

const START_BAL = 250.0;
const TP1_PROFIT = 12.92;
const TP2_PROFIT = 5.41;
const TOTAL_PROFIT = TP1_PROFIT + TP2_PROFIT; // $18.33

// SMA helper
function sma(candles: Candle[], end: number, period: number): number | null {
  if (end < period - 1) return null;
  let sum = 0;
  for (let i = end - period + 1; i <= end; i++) sum += candles[i].c;
  return sum / period;
}

type Phase = "idle" | "running" | "done";

// Milestone popup shown on screen
type Milestone = {
  id: number;
  text: string;
  sub: string;
  color: string;
};

export default function SectionLiveProof({ onContinue }: { onContinue: () => void }) {
  const t = useT();
  const [phase, setPhase]           = useState<Phase>("idle");
  const [visibleCount, setVisible]  = useState(0);
  const [balance, setBalance]       = useState(START_BAL);
  const [profit, setProfit]         = useState(0);
  const [flashProfit, setFlash]     = useState(false);
  const [inTrade, setInTrade]       = useState(false);
  const [entryPrice, setEntryPrice] = useState<number | null>(null);
  const [unrealized, setUnrealized] = useState(0);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tradeCount, setTradeCount] = useState(0);
  const [statusText, setStatusText] = useState(t.s2d_status_initial);

  const balRef       = useRef(START_BAL);
  const profitRef    = useRef(0);
  const milIdRef     = useRef(0);
  const timerRefs    = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRefs = useRef<ReturnType<typeof setInterval>[]>([]);

  const cleanup = useCallback(() => {
    timerRefs.current.forEach(clearTimeout);
    intervalRefs.current.forEach(clearInterval);
    timerRefs.current = [];
    intervalRefs.current = [];
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const addMilestone = useCallback((text: string, sub: string, color: string) => {
    const id = ++milIdRef.current;
    setMilestones((prev) => [...prev.slice(-2), { id, text, sub, color }]);
    setTimeout(() => {
      setMilestones((prev) => prev.filter((m) => m.id !== id));
    }, 3500);
  }, []);

  const at = useCallback((ms: number, fn: () => void) => {
    timerRefs.current.push(setTimeout(fn, ms));
  }, []);

  // Smooth balance counter animation
  const animateBalance = useCallback((target: number, durationMs: number) => {
    const start = balRef.current;
    const startTime = performance.now();
    const id = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const frac = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - frac, 3); // ease-out cubic
      const val = start + (target - start) * eased;
      setBalance(val);
      if (frac >= 1) {
        clearInterval(id);
        balRef.current = target;
      }
    }, 16);
    intervalRefs.current.push(id);
  }, []);

  const startSim = useCallback(() => {
    cleanup();
    setPhase("running");
    setVisible(0);
    setBalance(START_BAL);
    setProfit(0);
    setFlash(false);
    setInTrade(false);
    setEntryPrice(null);
    setUnrealized(0);
    setMilestones([]);
    setTradeCount(0);
    setStatusText(t.s2d_status_initial);
    balRef.current = START_BAL;
    profitRef.current = 0;

    // Candle ticker: one new candle every ~900ms = ~54s for 60 candles
    const INTERVAL = 900;
    let current = 0;
    const entryPriceRef = { val: 0 };
    const inTradeRef = { val: false };

    const ticker = setInterval(() => {
      current++;
      setVisible(current);

      const c = CANDLES[current - 1];
      if (!c) { clearInterval(ticker); return; }

      // Update unrealized P&L while in trade
      if (inTradeRef.val && entryPriceRef.val > 0) {
        // Scale: 1 unit price = $1 profit (simplified for display)
        const pips = (c.c - entryPriceRef.val) * 100;
        setUnrealized(pips);
      }

      // Crossover fires -> BUY
      if (current === BUY_CANDLE_IDX + 1) {
        inTradeRef.val = true;
        entryPriceRef.val = c.o;
        setInTrade(true);
        setEntryPrice(c.o);
        setUnrealized(0);
        setStatusText(t.s2d_status_trade1);
        addMilestone(t.s2d_milestone_trade1, t.s2d_milestone_trade1_sub, "#10b981");
      }

      // TP1 hit -> profit flash
      if (current === TP1_CANDLE_IDX + 1) {
        inTradeRef.val = false;
        setInTrade(false);
        setEntryPrice(null);
        setUnrealized(0);
        const newProfit = profitRef.current + TP1_PROFIT;
        profitRef.current = newProfit;
        setProfit(newProfit);
        setFlash(true);
        setTradeCount(1);
        animateBalance(START_BAL + newProfit, 1200);
        setStatusText(t.s2d_status_tp1);
        addMilestone(t.s2d_milestone_tp1.replace("{amount}", TP1_PROFIT.toFixed(2)), t.s2d_milestone_tp1_sub, "#10b981");
        setTimeout(() => setFlash(false), 1000);
      }

      // Second trade entry
      if (current === BUY2_CANDLE_IDX + 1) {
        inTradeRef.val = true;
        entryPriceRef.val = c.o;
        setInTrade(true);
        setEntryPrice(c.o);
        setUnrealized(0);
        setStatusText(t.s2d_status_trade2);
        addMilestone(t.s2d_milestone_trade2, t.s2d_milestone_trade2_sub, "#3b82f6");
      }

      // TP2 hit -> second profit
      if (current === TP2_CANDLE_IDX + 1) {
        inTradeRef.val = false;
        setInTrade(false);
        setEntryPrice(null);
        setUnrealized(0);
        const newProfit = profitRef.current + TP2_PROFIT;
        profitRef.current = newProfit;
        setProfit(newProfit);
        setFlash(true);
        setTradeCount(2);
        animateBalance(START_BAL + newProfit, 1200);
        setStatusText(t.s2d_status_tp2);
        addMilestone(t.s2d_milestone_tp1.replace("{amount}", TP2_PROFIT.toFixed(2)), t.s2d_milestone_tp2_sub, "#10b981");
        setTimeout(() => setFlash(false), 1000);
      }

      if (current >= CANDLES.length) {
        clearInterval(ticker);
        setPhase("done");
        setStatusText(t.s2d_status_done);
      }
    }, INTERVAL);

    intervalRefs.current.push(ticker);

    at(2000, () => setStatusText(t.s2d_status_scanning));
    at(8000, () => setStatusText(t.s2d_status_pattern));
  }, [cleanup, animateBalance, addMilestone, at, t]);

  // Build SVG chart data
  const totalCandles = CANDLES.length;
  const visible = CANDLES.slice(0, visibleCount);
  const yMin = Math.min(...CANDLES.map((c) => c.l)) - 0.5;
  const yMax = Math.max(...CANDLES.map((c) => c.h)) + 0.5;
  const yRange = yMax - yMin;
  const W = 560;
  const H = 220;
  const PAD = { l: 8, r: 8, t: 10, b: 10 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;
  const slotW = cW / totalCandles;
  const bodyW = Math.max(2, slotW * 0.6);

  const toX = (i: number) => PAD.l + (i + 0.5) * slotW;
  const toY = (p: number) => PAD.t + cH * (1 - (p - yMin) / yRange);

  // MA lines
  const fastPoints: string[] = [];
  const slowPoints: string[] = [];
  for (let i = 0; i < visibleCount; i++) {
    const f = sma(CANDLES, i, 5);
    const s = sma(CANDLES, i, 14);
    if (f != null) fastPoints.push(`${toX(i).toFixed(1)},${toY(f).toFixed(1)}`);
    if (s != null) slowPoints.push(`${toX(i).toFixed(1)},${toY(s).toFixed(1)}`);
  }

  // Entry/TP reference lines
  const showEntry = entryPrice != null && visibleCount > BUY_CANDLE_IDX;
  const entryY = entryPrice ? toY(entryPrice) : 0;

  const balanceDisplay = balance.toFixed(2);
  const profitDisplay  = profit.toFixed(2);
  const pnlPct         = ((profit / START_BAL) * 100).toFixed(1);

  // Current price for live display
  const lastCandle = visible[visible.length - 1];
  const livePrice  = lastCandle ? lastCandle.c.toFixed(4) : "1.0850";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-700">
          Watch it trade live
        </div>
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
          {t.s2d_headline}
        </h2>
        <p className="text-gray-500 text-sm max-w-xs mx-auto">
          {t.s2d_subtext}
        </p>
      </div>

      {/* Balance hero */}
      <div
        className={[
          "rounded-2xl px-5 py-5 transition-all duration-500",
          flashProfit ? "bg-emerald-600" : "bg-gray-900",
        ].join(" ")}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">
              Account Balance
            </div>
            <div
              className={[
                "text-5xl font-extrabold tabular-nums font-mono",
                flashProfit ? "text-white" : "text-white",
              ].join(" ")}
            >
              ${balanceDisplay}
            </div>
            {profit > 0 && (
              <div className="mt-1.5 text-emerald-400 font-bold text-sm tabular-nums">
                +${profitDisplay} profit &nbsp;
                <span className="font-normal text-emerald-600/60">(+{pnlPct}%)</span>
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-gray-500 mb-1">EUR/USD</div>
            <div className="text-xl font-bold text-white font-mono tabular-nums">
              {livePrice}
            </div>
            {inTrade && (
              <div
                className={[
                  "text-sm font-bold mt-1 tabular-nums font-mono",
                  unrealized >= 0 ? "text-emerald-400" : "text-red-400",
                ].join(" ")}
              >
                {unrealized >= 0 ? "+" : ""}${Math.abs(unrealized * 0.25).toFixed(2)}
              </div>
            )}
          </div>
        </div>
        {/* Trade indicators */}
        <div className="mt-4 flex items-center gap-3">
          <div
            className={[
              "flex items-center gap-1.5 text-xs rounded-full px-3 py-1 font-semibold transition-all",
              inTrade
                ? "bg-emerald-500/20 text-emerald-400"
                : phase === "running"
                ? "bg-yellow-500/10 text-yellow-400"
                : "bg-gray-700 text-gray-500",
            ].join(" ")}
          >
            <span
              className={[
                "w-1.5 h-1.5 rounded-full",
                inTrade ? "bg-emerald-400 animate-pulse" : phase === "running" ? "bg-yellow-400 animate-pulse" : "bg-gray-600",
              ].join(" ")}
            />
            {inTrade ? t.s2d_trade_open : phase === "running" ? t.s2d_scanning : phase === "done" ? t.s2d_complete : t.s2d_standby}
          </div>
          {tradeCount > 0 && (
            <div className="text-xs text-gray-400">
              {tradeCount} trade{tradeCount > 1 ? "s" : ""} closed &nbsp; · &nbsp; {tradeCount}/{tradeCount} wins
            </div>
          )}
        </div>
      </div>

      {/* Status text */}
      {phase !== "idle" && (
        <div className="flex items-center gap-2 px-1">
          {phase === "running" && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          )}
          <p className="text-sm text-gray-600 italic leading-snug">{statusText}</p>
        </div>
      )}

      {/* Milestone popups */}
      <div className="space-y-2 min-h-[10px]">
        {milestones.map((m) => (
          <div
            key={m.id}
            className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 animate-pulse-once"
            style={{ borderColor: m.color + "44", backgroundColor: m.color + "11" }}
          >
            <span className="text-xl shrink-0">
              {m.color === "#10b981" ? "✓" : "→"}
            </span>
            <div>
              <div className="font-bold text-sm" style={{ color: m.color }}>
                {m.text}
              </div>
              <div className="text-xs text-gray-500">{m.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CHART */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        {/* Chart toolbar */}
        <div className="bg-gray-900 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={[
                "w-2 h-2 rounded-full",
                phase === "running" ? "bg-emerald-400 animate-pulse" : "bg-gray-600",
              ].join(" ")}
            />
            <span className="text-xs text-gray-300 font-mono">
              EUR/USD &nbsp;·&nbsp; TradePilot MA Crossover
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-blue-400">
              <span className="inline-block w-4 h-0.5 bg-blue-400 rounded" /> Fast MA
            </span>
            <span className="flex items-center gap-1 text-yellow-400">
              <span className="inline-block w-4 h-0.5 bg-yellow-400 rounded" /> Slow MA
            </span>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="bg-[#0d0d0d] p-2 relative">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            style={{ height: "220px" }}
            aria-label="Live EUR/USD price chart"
          >
            {/* Grid */}
            {[0.2, 0.4, 0.6, 0.8].map((f) => (
              <line
                key={f}
                x1={PAD.l} x2={W - PAD.r}
                y1={PAD.t + cH * f} y2={PAD.t + cH * f}
                stroke="#1a1a1a" strokeWidth="1"
              />
            ))}

            {/* Entry price dashed line */}
            {showEntry && (
              <line
                x1={PAD.l} x2={W - PAD.r}
                y1={entryY} y2={entryY}
                stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" opacity="0.6"
              />
            )}
            {showEntry && (
              <text
                x={W - PAD.r - 2} y={entryY - 4}
                fontSize="8" fill="#10b981" textAnchor="end"
              >
                ENTRY
              </text>
            )}

            {/* Slow MA */}
            {slowPoints.length > 1 && (
              <polyline
                points={slowPoints.join(" ")} fill="none"
                stroke="#f59e0b" strokeWidth="2" opacity="0.8" strokeLinejoin="round"
              />
            )}

            {/* Fast MA */}
            {fastPoints.length > 1 && (
              <polyline
                points={fastPoints.join(" ")} fill="none"
                stroke="#3b82f6" strokeWidth="2" opacity="0.8" strokeLinejoin="round"
              />
            )}

            {/* Candles */}
            {visible.map((c, i) => {
              const isGreen = c.c >= c.o;
              const col     = isGreen ? "#10b981" : "#ef4444";
              const x       = toX(i);
              const openY   = toY(c.o);
              const closeY  = toY(c.c);
              const highY   = toY(c.h);
              const lowY    = toY(c.l);
              const bTop    = Math.min(openY, closeY);
              const bH      = Math.max(1.5, Math.abs(closeY - openY));

              return (
                <g key={i}>
                  <line x1={x} y1={highY} x2={x} y2={lowY} stroke={col} strokeWidth="1" />
                  <rect x={x - bodyW / 2} y={bTop} width={bodyW} height={bH} fill={col} rx="0.5" />
                </g>
              );
            })}

            {/* BUY arrow */}
            {visibleCount > BUY_CANDLE_IDX && (() => {
              const c = CANDLES[BUY_CANDLE_IDX];
              const x = toX(BUY_CANDLE_IDX);
              const tipY = toY(c.l) + 18;
              return (
                <g>
                  <circle cx={x} cy={tipY - 4} r="10" fill="#10b98122" />
                  <polygon
                    points={`${x},${tipY - 13} ${x - 7},${tipY + 1} ${x + 7},${tipY + 1}`}
                    fill="#10b981"
                  />
                  <text x={x} y={tipY + 14} fontSize="8" fill="#10b981" textAnchor="middle" fontWeight="bold">
                    BUY
                  </text>
                </g>
              );
            })()}

            {/* Second BUY arrow */}
            {visibleCount > BUY2_CANDLE_IDX && (() => {
              const c = CANDLES[BUY2_CANDLE_IDX];
              const x = toX(BUY2_CANDLE_IDX);
              const tipY = toY(c.l) + 18;
              return (
                <g>
                  <circle cx={x} cy={tipY - 4} r="10" fill="#3b82f622" />
                  <polygon
                    points={`${x},${tipY - 13} ${x - 7},${tipY + 1} ${x + 7},${tipY + 1}`}
                    fill="#3b82f6"
                  />
                  <text x={x} y={tipY + 14} fontSize="8" fill="#3b82f6" textAnchor="middle" fontWeight="bold">
                    BUY
                  </text>
                </g>
              );
            })()}

            {/* TP1 profit badge */}
            {visibleCount > TP1_CANDLE_IDX && (() => {
              const c = CANDLES[TP1_CANDLE_IDX];
              const x = Math.min(toX(TP1_CANDLE_IDX), W - 55);
              const y = toY(c.h) - 22;
              return (
                <g>
                  <rect x={x - 28} y={y} width={60} height={16} rx="4" fill="#10b981" />
                  <text x={x + 2} y={y + 11} fontSize="9" fill="white" fontWeight="bold" textAnchor="middle">
                    +${TP1_PROFIT.toFixed(2)}
                  </text>
                </g>
              );
            })()}

            {/* TP2 profit badge */}
            {visibleCount > TP2_CANDLE_IDX && (() => {
              const c = CANDLES[TP2_CANDLE_IDX];
              const x = Math.min(toX(TP2_CANDLE_IDX), W - 55);
              const y = toY(c.h) - 22;
              return (
                <g>
                  <rect x={x - 28} y={y} width={60} height={16} rx="4" fill="#3b82f6" />
                  <text x={x + 2} y={y + 11} fontSize="9" fill="white" fontWeight="bold" textAnchor="middle">
                    +${TP2_PROFIT.toFixed(2)}
                  </text>
                </g>
              );
            })()}

            {/* Live cursor line */}
            {phase === "running" && visibleCount > 0 && (
              <line
                x1={toX(visibleCount - 1)}
                y1={PAD.t}
                x2={toX(visibleCount - 1)}
                y2={H - PAD.b}
                stroke="#ffffff18"
                strokeWidth="1"
              />
            )}
          </svg>

          {/* "LIVE" badge overlay */}
          {phase === "running" && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-red-600/90 px-2 py-0.5 text-[10px] font-bold text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </div>
          )}
        </div>

        {/* Chart caption */}
        <div className="bg-[#0d0d0d] px-4 py-2 border-t border-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-emerald-500">
              <span>▲</span> BUY signal
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="inline-block w-3 h-0.5 bg-emerald-400" /> Profit taken
            </span>
          </div>
          <div className="text-[10px] text-gray-600 font-mono">
            {visibleCount}/{CANDLES.length} candles
          </div>
        </div>
      </div>

      {/* Simple 3-step explainer */}
      {phase === "idle" && (
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ["👁️", "Bot watches", "Every price movement, 24/7"],
            ["⚡", "Spots opportunity", "Detects the right moment automatically"],
            ["💰", "Locks profit", "Exits the trade at your target price"],
          ].map(([icon, title, desc]) => (
            <div key={title} className="rounded-xl bg-gray-50 border border-gray-200 px-2 py-3">
              <div className="text-xl mb-1">{icon}</div>
              <div className="text-xs font-bold text-gray-800">{title}</div>
              <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* Done result card */}
      {phase === "done" && (
        <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-200 px-5 py-5 space-y-4">
          <div className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Simulation complete
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs text-gray-400 mb-0.5">{t.s2d_started_with}</div>
              <div className="text-3xl font-extrabold text-gray-500 font-mono">$250.00</div>
            </div>
            <div className="text-2xl text-gray-400">→</div>
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-0.5">{t.s2d_ended_with}</div>
              <div className="text-3xl font-extrabold text-emerald-700 font-mono">
                ${(START_BAL + TOTAL_PROFIT).toFixed(2)}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-emerald-200 pt-3 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-emerald-500 font-bold">✓</span> {t.s2d_trade1_label}
                <span className="ml-auto font-bold text-emerald-700">+${TP1_PROFIT.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-emerald-500 font-bold">✓</span> {t.s2d_trade2_label}
                <span className="ml-auto font-bold text-emerald-700">+${TP2_PROFIT.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-emerald-100 px-3 py-2.5 text-xs text-emerald-700 leading-relaxed">
            {t.s2d_result_box}
          </div>
        </div>
      )}

      {/* CTAs */}
      {phase === "idle" && (
        <button
          onClick={startSim}
          className="w-full rounded-xl bg-gray-900 py-4 text-base font-bold text-white shadow-lg transition hover:bg-gray-800 active:scale-[.98]"
        >
          {t.s2d_start_btn}
        </button>
      )}

      {phase === "running" && (
        <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-center text-xs text-gray-500">
          {t.s2d_running_note}
        </div>
      )}

      {phase === "done" && (
        <div className="space-y-3">
          <button
            onClick={onContinue}
            className="w-full rounded-xl bg-gray-900 py-4 text-base font-bold text-white shadow-lg transition hover:bg-gray-800 active:scale-[.98]"
          >
            {t.s2d_cta}
          </button>
          <button
            onClick={() => {
              setPhase("idle");
              setVisible(0);
              setBalance(START_BAL);
              setProfit(0);
              setInTrade(false);
              setEntryPrice(null);
              setUnrealized(0);
              setMilestones([]);
              setTradeCount(0);
              setStatusText(t.s2d_status_initial);
              balRef.current = START_BAL;
              profitRef.current = 0;
            }}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 text-sm text-gray-500 transition hover:border-gray-400"
          >
            {t.s2d_watch_again}
          </button>
        </div>
      )}

      <RiskDisclaimer />
    </div>
  );
}
