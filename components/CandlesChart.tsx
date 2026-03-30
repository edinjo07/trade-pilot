"use client";

import { useMemo, useState } from "react";

export type Candle = { t: number; o: number; h: number; l: number; c: number };

export default function CandlesChart({
  candles,
  highlightCount,
}: {
  candles: Candle[];
  highlightCount?: number;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const data = useMemo(() => {
    if (!highlightCount) return candles;
    return candles.slice(0, Math.max(2, highlightCount));
  }, [candles, highlightCount]);

  const { min, max } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    data.forEach((c) => {
      min = Math.min(min, c.l);
      max = Math.max(max, c.h);
    });
    return { min, max };
  }, [data]);

  const width = 320;
  const height = 120;
  const padding = 8;
  const candleWidth = Math.max(4, Math.floor((width - padding * 2) / data.length) - 2);

  const scaleY = (value: number) => {
    if (max === min) return height / 2;
    const ratio = (value - min) / (max - min);
    return height - padding - ratio * (height - padding * 2);
  };

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-32 w-full"
        onMouseLeave={() => setHoverIdx(null)}
      >
        {data.map((candle, idx) => {
          const x = padding + idx * (candleWidth + 2);
          const openY = scaleY(candle.o);
          const closeY = scaleY(candle.c);
          const highY = scaleY(candle.h);
          const lowY = scaleY(candle.l);
          const up = candle.c >= candle.o;
          const color = up ? "#10b981" : "#ef4444";
          const bodyY = Math.min(openY, closeY);
          const bodyH = Math.max(2, Math.abs(openY - closeY));

          return (
            <g key={candle.t} onMouseEnter={() => setHoverIdx(idx)}>
              <line x1={x + candleWidth / 2} x2={x + candleWidth / 2} y1={highY} y2={lowY} stroke={color} strokeWidth={1} />
              <rect x={x} y={bodyY} width={candleWidth} height={bodyH} fill={color} rx={1} />
            </g>
          );
        })}
      </svg>
      {hoverIdx !== null && data[hoverIdx] ? (
        <div className="absolute top-2 right-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-300">
          <div>{new Date(data[hoverIdx].t).toLocaleString()}</div>
          <div>O {data[hoverIdx].o.toFixed(2)}</div>
          <div>H {data[hoverIdx].h.toFixed(2)}</div>
          <div>L {data[hoverIdx].l.toFixed(2)}</div>
          <div>C {data[hoverIdx].c.toFixed(2)}</div>
        </div>
      ) : null}
    </div>
  );
}
