import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

type Candle = { t: number; o: number; h: number; l: number; c: number };

export async function GET(req: Request) {
  const rl = await rateLimit({ req, route: "/api/market/candles", limit: 60, windowSec: 60 });
  if (!rl.ok) return NextResponse.json({ ok: false, code: "RATE_LIMIT" }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") || "";
  const interval = searchParams.get("interval") || "5min";
  const start = searchParams.get("start") || "";
  const end = searchParams.get("end") || "";
  const provider = searchParams.get("provider") || "auto";

  if (!symbol || !start || !end) {
    return NextResponse.json({ ok: false, code: "MISSING_PARAMS" }, { status: 400 });
  }

  const chosenProvider = provider === "auto"
    ? symbol === "SPY"
      ? "finnhub"
      : "twelve"
    : provider;

  try {
    let candles: Candle[] = [];
    if (chosenProvider === "twelve") {
      candles = await fetchTwelveData(symbol, interval, start, end);
    } else {
      candles = await fetchFinnhub(symbol, interval, start, end);
    }

    return NextResponse.json(
      { ok: true, candles },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    return NextResponse.json({ ok: false, code: "FETCH_FAILED" }, { status: 500 });
  }
}

async function fetchTwelveData(symbol: string, interval: string, start: string, end: string) {
  const key = process.env.TWELVE_DATA_API_KEY;
  if (!key) throw new Error("Missing TWELVE_DATA_API_KEY");

  const url = new URL("https://api.twelvedata.com/time_series");
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("interval", interval);
  url.searchParams.set("start_date", start);
  url.searchParams.set("end_date", end);
  url.searchParams.set("order", "ASC");
  url.searchParams.set("format", "JSON");
  url.searchParams.set("apikey", key);

  const res = await fetch(url.toString());
  const data = await res.json();
  if (!res.ok || data?.status === "error") throw new Error("Twelve Data error");

  const values = (data?.values ?? []) as Array<{ datetime: string; open: string; high: string; low: string; close: string }>;
  return values.map((v) => ({
    t: new Date(v.datetime).getTime(),
    o: Number(v.open),
    h: Number(v.high),
    l: Number(v.low),
    c: Number(v.close),
  }));
}

async function fetchFinnhub(symbol: string, interval: string, start: string, end: string) {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("Missing FINNHUB_API_KEY");

  const resolution = interval === "5min" ? "5" : "15";
  const from = Math.floor(new Date(start).getTime() / 1000);
  const to = Math.floor(new Date(end).getTime() / 1000);

  const url = new URL("https://finnhub.io/api/v1/stock/candle");
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("resolution", resolution);
  url.searchParams.set("from", String(from));
  url.searchParams.set("to", String(to));
  url.searchParams.set("token", key);

  const res = await fetch(url.toString());
  const data = await res.json();
  if (!res.ok || data?.s !== "ok") throw new Error("Finnhub error");

  const candles: Candle[] = [];
  const times = data.t as number[];
  const opens = data.o as number[];
  const highs = data.h as number[];
  const lows = data.l as number[];
  const closes = data.c as number[];

  for (let i = 0; i < times.length; i += 1) {
    candles.push({
      t: times[i] * 1000,
      o: opens[i],
      h: highs[i],
      l: lows[i],
      c: closes[i],
    });
  }

  return candles;
}
