"use client";

"use client";

import { useEffect, useMemo } from "react";
import type { Dispatch } from "react";
import { FunnelSessionClient } from "@/lib/funnel/types";
import { Action } from "@/lib/funnel/reducer";

export default function Section3Frame({
  state,
  dispatch,
}: {
  state: FunnelSessionClient;
  dispatch: Dispatch<Action>;
}) {
  const selected = state.frameChoice ?? null;
  const choices = useMemo(
    () =>
      [
        { id: "LATE", label: "I hesitate, then enter too late." },
        { id: "SECOND_GUESS", label: "I act with confidence, then second-guess myself." },
        { id: "SWITCH", label: "After a loss, I change my approach too quickly." },
        { id: "DELAY", label: "When uncertainty spikes, I delay decisions." },
      ] as const,
    []
  );

  useEffect(() => {
    if (!selected) return;
    const timer = window.setTimeout(() => {
      dispatch({ type: "S3_CONTINUE" });
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [selected, dispatch]);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="text-lg md:text-xl font-medium text-neutral-200">
          At this point, most people nod and move on.
        </div>
        <div className="space-y-2 text-neutral-300 leading-relaxed">
          <p>The patterns don’t change because they’re hidden.</p>
          <p>They change because they’re noticed.</p>
        </div>
        <div className="text-neutral-300 leading-relaxed">
          {selected
            ? "Noted. No correction  just recognition."
            : "Which of these situations feels familiar? There’s no correct answer. Just recognition."}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {choices.map((choice) => {
          const active = selected === choice.id;
          return (
            <button
              key={choice.id}
              className={[
                "rounded-xl border px-5 py-5 text-left transition",
                active
                  ? "border-neutral-300 bg-neutral-900"
                  : "border-neutral-800 bg-neutral-950 hover:bg-neutral-900",
              ].join(" ")}
              onClick={() => dispatch({ type: "S3_CHOOSE", choice: choice.id })}
            >
              <div className="text-sm text-neutral-100">{choice.label}</div>
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="space-y-2">
          <div className="text-sm text-neutral-400">Pattern noted.</div>
          <div className="text-sm text-neutral-400 leading-relaxed">
            This pattern is common. It doesn’t say anything about your intelligence  only how
            pressure shows up.
          </div>
        </div>
      ) : null}
    </div>
  );
}
