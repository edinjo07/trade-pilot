export type Candle = { t: number; o: number; h: number; l: number; c: number };

export async function fetchCandles(params: {
  symbol: string;
  interval: string;
  start: string;
  end: string;
  provider?: string;
}): Promise<Candle[]> {
  const url = new URL("/api/market/candles", window.location.origin);
  url.searchParams.set("symbol", params.symbol);
  url.searchParams.set("interval", params.interval);
  url.searchParams.set("start", params.start);
  url.searchParams.set("end", params.end);
  if (params.provider) url.searchParams.set("provider", params.provider);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to load candles");
  const data = (await res.json()) as { candles: Candle[] };
  return data.candles;
}
