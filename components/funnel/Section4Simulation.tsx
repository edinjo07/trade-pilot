"use client";

"use client";

import { useEffect, useRef, useState } from "react";
import type { Dispatch } from "react";
import { Action } from "@/lib/funnel/reducer";

const DURATION_MS = 12000;

export default function Section4Simulation({
  dispatch,
}: {
  dispatch: Dispatch<Action>;
}) {
  const [msLeft, setMsLeft] = useState(DURATION_MS);
  const startedAt = useRef<number>(Date.now());
  const resolved = useRef<boolean>(false);

  useEffect(() => {
    const t = setInterval(() => {
      const elapsed = Date.now() - startedAt.current;
      const left = Math.max(0, DURATION_MS - elapsed);
      setMsLeft(left);

      if (left === 0 && !resolved.current) {
        resolved.current = true;
        dispatch({
          type: "S4_RESOLVE",
          action: "TIMEOUT",
          timeTakenMs: DURATION_MS,
        });
      }
    }, 60);

    return () => clearInterval(t);
  }, [dispatch]);

  function resolve(action: "BUY" | "SELL") {
    if (resolved.current) return;
    resolved.current = true;
    const timeTakenMs = Math.min(DURATION_MS, Date.now() - startedAt.current);
    dispatch({ type: "S4_RESOLVE", action, timeTakenMs });
  }

  const pct = Math.round((msLeft / DURATION_MS) * 100);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="h-5 w-3/5 rounded bg-neutral-800/60" />
        <div className="h-4 w-5/6 rounded bg-neutral-800/40" />
        <div className="h-4 w-4/6 rounded bg-neutral-800/40" />
      </div>

      <div className="space-y-3">
        <div className="h-2 w-full rounded bg-neutral-800">
          <div className="h-2 rounded bg-neutral-200" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-sm text-neutral-400">
          Time remaining: {Math.ceil(msLeft / 1000)}s
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <button
          className="rounded-xl bg-neutral-100 text-neutral-950 px-6 py-4 hover:bg-neutral-200 transition"
          onClick={() => resolve("BUY")}
        >
          BUY
        </button>
        <button
          className="rounded-xl border border-neutral-800 bg-neutral-950 px-6 py-4 hover:bg-neutral-900 transition"
          onClick={() => resolve("SELL")}
        >
          SELL
        </button>
      </div>

      <div className="text-sm text-neutral-500">
        (Skeleton) Outcome text is shown in next section.
      </div>
    </div>
  );
}
