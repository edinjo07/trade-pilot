export type HumanScenario = {
  id: string;
  title: string;
  instrument: "XAUUSD" | "EURUSD" | "SPY";
  headline: string;
  timestamp: string;
  eventTimeISO: string;
  interval: "5min";
  windowMinutes: number;
  context: string[];
  prompt: string;
  explainMakesSense: string[];
  explainCanFail: string[];
};

export type SystemScenario = {
  id: string;
  title: string;
  headline: string;
  tags: string[];
  eventTimeISO: string;
  interval: "5min";
  windowMinutes: number;
  logs: string[];
  execution: string[];
  stamp: string;
  legs: Array<{ symbol: "SPY" | "EURUSD" | "XAUUSD"; label: string; direction: "BUY" | "SELL" }>;
  explainMakesSense: string[];
  explainCanFail: string[];
};

export const humanScenarios: HumanScenario[] = [
  {
    id: "xau_cpi_hot",
    title: "Gold  US CPI surprise",
    instrument: "XAUUSD",
    headline: "US CPI comes in hotter than expected",
    timestamp: "Apr 10, 2024 · 08:30 ET",
    eventTimeISO: "2024-04-10T12:30:00.000Z",
    interval: "5min",
    windowMinutes: 120,
    context: [
      "Hot CPI often pushes rate-cut expectations down, yields up, USD up.",
      "Gold tends to struggle when real yields rise (opportunity cost).",
    ],
    prompt: "You have 7 seconds. Based on this headline, what’s the first move you’d speculate?",
    explainMakesSense: [
      "Hot CPI can reprice yields quickly, pressuring gold in the first move.",
    ],
    explainCanFail: [
      "Sometimes inflation headlines trigger hedge demand or risk-off flows and gold can bounce.",
      "Headline logic ≠ reaction timing.",
    ],
  },
  {
    id: "eur_ecb_cut",
    title: "EUR/USD  ECB cut (cautious guidance)",
    instrument: "EURUSD",
    headline: "ECB cuts rates for the first time since 2019; euro ticks up as guidance stays cautious",
    timestamp: "Jun 6, 2024",
    eventTimeISO: "2024-06-06T12:15:00.000Z",
    interval: "5min",
    windowMinutes: 120,
    context: [
      "A rate cut can weaken a currency  unless the cut is fully priced.",
      "The euro rose after the cut as investors weighed cautious guidance.",
    ],
    prompt: "7 seconds. What’s the first move you’d speculate for EUR/USD?",
    explainMakesSense: [
      "A priced-in cut plus cautious guidance can support the euro short-term.",
    ],
    explainCanFail: [
      "If the press conference stresses growth weakness or faster cuts, EUR can fade.",
      "Markets trade surprise vs expectations, not the action alone.",
    ],
  },
  {
    id: "spy_cpi_hot",
    title: "SPY  Hot CPI hits stocks",
    instrument: "SPY",
    headline: "Hotter-than-expected CPI knocks stocks lower as rate-cut hopes cool",
    timestamp: "Apr 10, 2024 · US session",
    eventTimeISO: "2024-04-10T14:00:00.000Z",
    interval: "5min",
    windowMinutes: 120,
    context: [
      "Sticky inflation lifts expected rates and discount rates.",
      "Equities often sell off quickly on rate repricing shocks.",
    ],
    prompt: "7 seconds. First move on SPY?",
    explainMakesSense: [
      "Rates repricing hits equities fast; risk-off flows dominate the first move.",
    ],
    explainCanFail: [
      "Dip buyers or positioning can drive rebounds after the first hour.",
      "Bad news already priced can reverse the initial move.",
    ],
  },
];

export const systemScenarios: SystemScenario[] = [
  {
    id: "system_cpi_hot",
    title: "Hot CPI Shock",
    headline: "US CPI comes in hotter than expected",
    tags: ["Inflation surprise: Positive (hot)", "CPI actual > forecast"],
    eventTimeISO: "2024-04-10T12:30:00.000Z",
    interval: "5min",
    windowMinutes: 120,
    logs: [
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
    legs: [
      { symbol: "SPY", label: "SPY", direction: "SELL" },
      { symbol: "XAUUSD", label: "Gold (XAUUSD)", direction: "SELL" },
    ],
    explainMakesSense: [
      "Hot CPI → fewer rate cuts expected → yields/real yields up.",
      "Higher discount rates hit equities; higher real yields can pressure gold first.",
    ],
    explainCanFail: [
      "If the data was already priced in, the first move can reverse.",
      "Positioning, liquidity, or cross-asset flows can dominate headlines.",
      "Reactions are not guarantees  they are probabilities.",
    ],
  },
  {
    id: "system_ecb_cut",
    title: "ECB Cut + Cautious Guidance",
    headline: "ECB cuts rates; avoids committing to more cuts",
    tags: ["Cut = dovish", "Guidance less dovish than expected"],
    eventTimeISO: "2024-06-06T12:15:00.000Z",
    interval: "5min",
    windowMinutes: 120,
    logs: [
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
    legs: [
      { symbol: "EURUSD", label: "EUR/USD", direction: "BUY" },
      { symbol: "XAUUSD", label: "Gold (XAUUSD)", direction: "SELL" },
    ],
    explainMakesSense: [
      "Markets trade the path, not just the cut.",
      "Less-dovish guidance can support a currency short-term.",
    ],
    explainCanFail: [
      "US data, risk sentiment, or press-conference nuance can override ECB logic.",
      "Gold can rise even with EUR strength if risk sentiment deteriorates.",
    ],
  },
];
