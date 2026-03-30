"use client";

import type { Dispatch } from "react";
import { Action } from "@/lib/funnel/reducer";
import { GATE } from "@/lib/funnel/gate";

export default function Section7Gate({
  dispatch,
}: {
  dispatch: Dispatch<Action>;
}) {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 md:p-7">
        <div className="text-sm text-neutral-500">{GATE.title}</div>

        <div className="mt-4 space-y-5">
          {GATE.blocks.map((b, idx) => {
            if (b.kind === "headline") {
              return (
                <div
                  key={idx}
                  className="text-xl md:text-2xl font-semibold text-neutral-100"
                >
                  {b.text}
                </div>
              );
            }
            if (b.kind === "sub") {
              return (
                <p key={idx} className="text-neutral-300 leading-relaxed">
                  {b.text}
                </p>
              );
            }
            if (b.kind === "divider") {
              return <div key={idx} className="my-2 h-px w-full bg-neutral-800" />;
            }
            if (b.kind === "list") {
              return (
                <div key={idx} className="space-y-2">
                  {b.title && (
                    <div className="text-sm font-medium text-neutral-200">
                      {b.title}
                    </div>
                  )}
                  <ul className="list-disc pl-5 text-neutral-300 space-y-1">
                    {b.items.map((it, i) => (
                      <li key={i}>{it}</li>
                    ))}
                  </ul>
                </div>
              );
            }
            if (b.kind === "question") {
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"
                >
                  <div className="text-sm text-neutral-400">One question</div>
                  <div className="mt-2 text-neutral-100 font-medium">{b.text}</div>
                </div>
              );
            }
            if (b.kind === "cta_hint") {
              return (
                <div key={idx} className="text-sm text-neutral-400">
                  {b.text}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          className="rounded-xl bg-neutral-100 text-neutral-950 px-5 py-3 hover:bg-neutral-200 transition"
          onClick={() => dispatch({ type: "S6_CONTINUE" })}
        >
          {GATE.continueLabel}
        </button>
      </div>
    </div>
  );
}
