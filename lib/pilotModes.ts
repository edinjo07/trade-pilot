// ── Pilot Mode definitions + pure simulation engine ──────────────────────────
// No API calls – all computations are deterministic client-side.

export type PilotModeId = "MA_CROSS" | "RSI" | "MACD" | "MOMENTUM";

export type PilotMode = {
  id: PilotModeId;
  name: string;
  badge: string;
  condition: string;
  winRate: number;
  avgR: string;
  description: string;
  analogy: string;
  features: string[];
  colorHex: string;     // used in SVG / canvas
  colorTw: string;      // tailwind text colour class
  borderTw: string;     // tailwind border colour class
  bgTw: string;         // tailwind background colour class (subtle)
};

export type SimCandle = {
  t: number; // epoch ms (used as a unique key)
  o: number;
  h: number;
  l: number;
  c: number;
};

export type SimSignal = {
  index: number;
  type: "BUY" | "SELL";
  label: string;
  price: number;
};

export type SimResult = {
  candles: SimCandle[];
  signals: SimSignal[];
  fastLine?: (number | null)[];
  slowLine?: (number | null)[];
  rsiLine?: (number | null)[];
  macdLine?: (number | null)[];
  signalLine?: (number | null)[];
};

// ── Strategy definitions ──────────────────────────────────────────────────────

export const PILOT_MODES: PilotMode[] = [
  {
    id: "MA_CROSS",
    name: "MA Crossover",
    badge: "TREND FOLLOWING",
    condition: "Detects trend changes",
    winRate: 61,
    avgR: "+2.4R",
    description:
      "Two moving average lines constantly scan the chart  a fast one and a slow one. When the fast line crosses above the slow line, TradePilot buys. When it crosses below, it sells. No hesitation. No emotion. No delay.",
    analogy:
      "Like watching two speedometers: when the quick one overtakes the slow one, the trend has shifted  and the bot jumps on it instantly.",
    features: [
      "Fast & slow MA periods fully configurable",
      "Claude AI sentiment confirmation before entry",
      "Stop-loss + take-profit auto-set on every trade",
    ],
    colorHex: "#3b82f6",
    colorTw: "text-blue-500",
    borderTw: "border-blue-500",
    bgTw: "bg-blue-500/10",
  },
  {
    id: "RSI",
    name: "RSI Reversal",
    badge: "MEAN REVERSION",
    condition: "Spots overbought / oversold",
    winRate: 58,
    avgR: "+1.9R",
    description:
      "RSI is a 0–100 scale that measures when the market has gone too far, too fast. Below 30 means everyone sold in panic  Pilot buys the bounce. Above 70 means euphoria has peaked  Pilot sells into it. The discipline no human can sustain.",
    analogy:
      "Like buying a £200 jacket when it drops to £60 on sale  then selling it back when demand spikes the price again.",
    features: [
      "RSI period & threshold fully tunable",
      "Anti-whipsaw confirmation bars filter false signals",
      "News sentiment cross-check before entry",
    ],
    colorHex: "#a855f7",
    colorTw: "text-purple-500",
    borderTw: "border-purple-500",
    bgTw: "bg-purple-500/10",
  },
  {
    id: "MACD",
    name: "MACD",
    badge: "MOMENTUM SHIFT",
    condition: "Catches momentum shifts early",
    winRate: 63,
    avgR: "+2.7R",
    description:
      "MACD watches the gap between two exponential averages and spots line convergence before the crowd notices. It catches momentum shifts early  often before the move is obvious to everyone else. Early entry, maximum runway.",
    analogy:
      "Like noticing a car starting to accelerate before it reaches full speed  you're already in position before the crowd even reacts.",
    features: [
      "Fast, slow & signal periods configurable",
      "Histogram divergence detection for early entries",
      "Claude AI news overlay – skips trades against headlines",
    ],
    colorHex: "#f59e0b",
    colorTw: "text-amber-500",
    borderTw: "border-amber-500",
    bgTw: "bg-amber-500/10",
  },
  {
    id: "MOMENTUM",
    name: "Pure Momentum",
    badge: "BREAKOUT",
    condition: "Rides existing trends",
    winRate: 55,
    avgR: "+3.1R",
    description:
      "The simplest truth in markets: a moving object keeps moving. Pilot calculates directional strength over a lookback window and rides the trend until it exhausts. No predictions  just pure reaction to what's already happening.",
    analogy:
      "Like jumping onto a moving train instead of standing at the station wondering if one will ever come.",
    features: [
      "Lookback period fully configurable",
      "Directional strength filter eliminates weak signals",
      "Equity curve stop  halts bot if drawdown exceeds limit",
    ],
    colorHex: "#10b981",
    colorTw: "text-emerald-500",
    borderTw: "border-emerald-500",
    bgTw: "bg-emerald-500/10",
  },
];

// ── Pure math helpers ─────────────────────────────────────────────────────────

/** Deterministic LCG pseudo-random number generator */
function mkRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s, 1664525) + 1013904223;
    s >>>= 0;
    return s / 0xffffffff;
  };
}

function smaSeries(values: number[], period: number): (number | null)[] {
  return values.map((_, i) => {
    if (i < period - 1) return null;
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += values[j];
    return sum / period;
  });
}

function emaSeries(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    result.push(values[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

function rsiSeries(closes: number[], period = 14): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period) { result.push(null); continue; }
    let gains = 0;
    let losses = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const diff = closes[j] - closes[j - 1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const r = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    result.push(r);
  }
  return result;
}

/** Synthesise OHLC candles with a configurable bias per region */
function synthCandles(
  seed: number,
  regions: Array<{ count: number; bias: number; vol?: number }>,
  startPrice: number,
): SimCandle[] {
  const rng = mkRng(seed);
  const candles: SimCandle[] = [];
  let price = startPrice;
  let t = 1_700_000_000_000;

  for (const region of regions) {
    const vol = region.vol ?? 0.012;
    for (let i = 0; i < region.count; i++) {
      const move = (rng() - 0.5 + region.bias) * price * vol;
      const open = price;
      const close = Math.max(price * 0.7, price + move);
      const high = Math.max(open, close) + rng() * price * vol * 0.4;
      const low = Math.min(open, close) - rng() * price * vol * 0.4;
      candles.push({ t, o: open, h: high, l: low, c: close });
      price = close;
      t += 3_600_000;
    }
  }
  return candles;
}

// ── Simulation entry point ────────────────────────────────────────────────────

export function computeSimulation(id: PilotModeId): SimResult {
  if (id === "MA_CROSS") {
    const candles = synthCandles(42, [
      { count: 15, bias: 0.00, vol: 0.01 },   // ranging
      { count: 5,  bias: -0.05, vol: 0.015 }, // slight dip
      { count: 20, bias: 0.08, vol: 0.012 },  // trend up → crossover triggers
      { count: 10, bias: -0.04, vol: 0.01 },  // fade
    ], 100);

    const closes = candles.map((c) => c.c);
    const fastLine = smaSeries(closes, 9);
    const slowLine = smaSeries(closes, 21);
    const signals: SimSignal[] = [];
    let prevAbove: boolean | null = null;

    for (let i = 1; i < candles.length; i++) {
      const f = fastLine[i];
      const s = slowLine[i];
      if (f == null || s == null) continue;
      const above = f > s;
      if (prevAbove !== null && above !== prevAbove) {
        signals.push({
          index: i,
          type: above ? "BUY" : "SELL",
          label: above
            ? "Fast MA crossed above slow MA"
            : "Fast MA crossed below slow MA",
          price: candles[i].c,
        });
      }
      prevAbove = above;
    }
    return { candles, signals, fastLine, slowLine };
  }

  if (id === "RSI") {
    const candles = synthCandles(99, [
      { count: 10, bias: 0.06,  vol: 0.012 }, // initial rally → overbought
      { count: 8,  bias: -0.06, vol: 0.015 }, // sharp drop → oversold
      { count: 12, bias: 0.00,  vol: 0.008 }, // base
      { count: 10, bias: 0.07,  vol: 0.012 }, // another rally → overbought
      { count: 10, bias: -0.03, vol: 0.01  }, // ease
    ], 100);

    const closes = candles.map((c) => c.c);
    const rsiLine = rsiSeries(closes, 14);
    const signals: SimSignal[] = [];
    let wasOverbought = false;
    let wasOversold = false;

    for (let i = 1; i < closes.length; i++) {
      const v = rsiLine[i];
      const prev = rsiLine[i - 1];
      if (v == null || prev == null) continue;
      if (v >= 70) wasOverbought = true;
      if (v <= 30) wasOversold = true;
      if (wasOverbought && prev >= 70 && v < 70) {
        signals.push({ index: i, type: "SELL", label: "RSI dropped below 70  overbought reversal", price: candles[i].c });
        wasOverbought = false;
      }
      if (wasOversold && prev <= 30 && v > 30) {
        signals.push({ index: i, type: "BUY", label: "RSI crossed above 30  oversold bounce", price: candles[i].c });
        wasOversold = false;
      }
    }
    return { candles, signals, rsiLine };
  }

  if (id === "MACD") {
    const candles = synthCandles(77, [
      { count: 10, bias: 0.00,  vol: 0.009 },
      { count: 15, bias: 0.07,  vol: 0.013 }, // building momentum → MACD cross
      { count: 10, bias: -0.07, vol: 0.015 }, // reversal → bearish cross
      { count: 15, bias: 0.05,  vol: 0.01  }, // recovery
    ], 100);

    const closes = candles.map((c) => c.c);
    const fastEma = emaSeries(closes, 12);
    const slowEma = emaSeries(closes, 26);
    const macdLine = fastEma.map((f, i) => f - slowEma[i]);
    const signalLine = emaSeries(macdLine, 9);
    const signals: SimSignal[] = [];
    let prevAbove: boolean | null = null;

    for (let i = 26; i < candles.length; i++) {
      const above = macdLine[i] > signalLine[i];
      if (prevAbove !== null && above !== prevAbove) {
        signals.push({
          index: i,
          type: above ? "BUY" : "SELL",
          label: above
            ? "MACD crossed above signal line ▲"
            : "MACD crossed below signal line ▼",
          price: candles[i].c,
        });
      }
      prevAbove = above;
    }
    return { candles, signals, fastLine: fastEma, slowLine: slowEma, macdLine, signalLine };
  }

  // MOMENTUM
  const candles = synthCandles(55, [
    { count: 10, bias: 0.00,  vol: 0.008 }, // flat
    { count: 20, bias: 0.09,  vol: 0.012 }, // strong uptrend → buy
    { count: 5,  bias: -0.02, vol: 0.01  }, // pause
    { count: 10, bias: -0.08, vol: 0.015 }, // reversal → sell
    { count: 5,  bias: 0.02,  vol: 0.008 }, // stabilise
  ], 100);

  const LOOKBACK = 10;
  const signals: SimSignal[] = [];
  let inTrade = false;

  for (let i = LOOKBACK; i < candles.length; i++) {
    const ret = candles[i].c - candles[i - LOOKBACK].c;
    if (!inTrade && ret > 0) {
      signals.push({
        index: i,
        type: "BUY",
        label: `Price up +${ret.toFixed(2)} over last ${LOOKBACK} bars  momentum confirmed`,
        price: candles[i].c,
      });
      inTrade = true;
    } else if (inTrade && ret < 0) {
      signals.push({
        index: i,
        type: "SELL",
        label: `Momentum exhausted  trend reversal detected`,
        price: candles[i].c,
      });
      inTrade = false;
    }
  }
  return { candles, signals };
}
