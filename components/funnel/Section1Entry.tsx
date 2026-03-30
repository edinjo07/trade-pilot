"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dispatch } from "react";
import { Action } from "@/lib/funnel/reducer";

export default function Section1Entry({
  dispatch,
}: {
  dispatch: Dispatch<Action>;
}) {
  const lines = useMemo(
    () => [
      "Trading isn’t difficult because of the market. The market isn’t the hardest part.",
      "Most losses begin long before a position is opened.",
      "Information rarely fails first.",
    ],
    []
  );
  const [visibleCount, setVisibleCount] = useState(0);
  const [showRest, setShowRest] = useState(false);

  useEffect(() => {
    const timers: number[] = [];
    const baseDelay = 360;
    lines.forEach((_, idx) => {
      const t = window.setTimeout(() => {
        setVisibleCount((prev) => Math.max(prev, idx + 1));
      }, baseDelay * idx);
      timers.push(t);
    });
    const restTimer = window.setTimeout(() => {
      setShowRest(true);
    }, baseDelay * lines.length + 200);
    timers.push(restTimer);

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [lines]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        {visibleCount >= 1 ? (
          <div className="text-2xl md:text-3xl font-semibold text-neutral-100">
            {lines[0]}
          </div>
        ) : null}
        {visibleCount >= 2 ? (
          <div className="text-lg md:text-xl text-neutral-200">{lines[1]}</div>
        ) : null}
        {visibleCount >= 3 ? (
          <div className="text-base md:text-lg text-neutral-400">{lines[2]}</div>
        ) : null}
      </div>

      {showRest ? <div className="h-6 md:h-8" /> : null}

      {showRest ? (
        <div className="space-y-3">
          <div className="h-4 w-3/6 rounded bg-neutral-800/50" />
          <div className="h-4 w-4/6 rounded bg-neutral-800/50" />
        </div>
      ) : null}

      {showRest ? (
        <div className="grid gap-3 md:grid-cols-2">
          <button
            className="rounded-xl border border-neutral-800 bg-neutral-900 px-5 py-4 text-left hover:bg-neutral-800 transition"
            onClick={() => dispatch({ type: "S1_CHOOSE", choice: "ADMIT" })}
          >
            <div className="h-4 w-3/4 rounded bg-neutral-700/70" />
            <div className="mt-2 h-3 w-5/6 rounded bg-neutral-700/40" />
          </button>

          <button
            className="rounded-xl border border-neutral-800 bg-neutral-900 px-5 py-4 text-left hover:bg-neutral-800 transition"
            onClick={() => dispatch({ type: "S1_CHOOSE", choice: "DENY" })}
          >
            <div className="h-4 w-3/4 rounded bg-neutral-700/70" />
            <div className="mt-2 h-3 w-5/6 rounded bg-neutral-700/40" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
