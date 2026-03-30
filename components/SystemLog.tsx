"use client";

import { useEffect, useState } from "react";

export default function SystemLog({
  lines,
  onComplete,
  pauses = {},
  intervalMs = 700,
}: {
  lines: string[];
  onComplete?: () => void;
  pauses?: Record<number, number>;
  intervalMs?: number;
}) {
  const [visible, setVisible] = useState<string[]>([]);

  useEffect(() => {
    setVisible([]);
    let time = 0;
    const timers: number[] = [];

    lines.forEach((line, idx) => {
      time += intervalMs;
      if (pauses[idx]) time += pauses[idx];
      const t = window.setTimeout(() => {
        setVisible((prev) => [...prev, line]);
        if (idx === lines.length - 1 && onComplete) onComplete();
      }, time);
      timers.push(t);
    });

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [lines, pauses, onComplete]);

  return (
    <div className="font-mono text-sm text-neutral-300 space-y-1">
      {visible.map((line) => (
        <div key={line}>{line}</div>
      ))}
      {visible.length < lines.length ? <div className="text-neutral-600">▌</div> : null}
    </div>
  );
}
