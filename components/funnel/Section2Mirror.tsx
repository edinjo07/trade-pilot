"use client";

import { useEffect, useState } from "react";
import type { Dispatch } from "react";
import { FunnelSessionClient } from "@/lib/funnel/types";
import { Action } from "@/lib/funnel/reducer";

export default function Section2Mirror({
  state,
  dispatch,
}: {
  state: FunnelSessionClient;
  dispatch: Dispatch<Action>;
}) {
  const [locked, setLocked] = useState(true);

  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const timer = window.setTimeout(() => {
      document.documentElement.style.overflow = prev;
      setLocked(false);
    }, 1200);
    return () => {
      window.clearTimeout(timer);
      document.documentElement.style.overflow = prev;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="text-lg md:text-xl font-medium text-neutral-200">
          That’s why information is rarely the issue.
        </div>
        <div className="space-y-2 text-neutral-300 leading-relaxed">
          <p>Most people already understand risk.</p>
          <p>They know markets are uncertain.</p>
          <p>They know outcomes aren’t guaranteed.</p>
        </div>
        <div className="text-neutral-300 leading-relaxed">
          What actually decides the result is how choices are made when pressure appears 
          when time is limited, confidence shifts, or doubt creeps in.
        </div>
        <div className="text-neutral-300 leading-relaxed">
          This isn’t a personal failure. It’s a human one.
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          className={[
            "rounded-xl px-5 py-3 transition",
            locked
              ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
              : "bg-neutral-100 text-neutral-950 hover:bg-neutral-200",
          ].join(" ")}
          onClick={() => dispatch({ type: "S2_CONTINUE" })}
          disabled={locked}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
