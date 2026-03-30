"use client";

import { useEffect, useState } from "react";
import StepBlock from "@/components/StepBlock";
import { getLocal, setLocal } from "@/lib/utils";

const statements = [
  "I follow rules when things are calm, but bend them when confidence rises.",
  "I look for confirmation after I’ve already leaned toward a decision.",
  "Losses affect my next decision more than I admit.",
  "When outcomes surprise me, I react instead of slowing down.",
  "I change my approach more often than I review it.",
  "Under pressure, I trust instinct more than process.",
];

type Response = "FIT" | "NOT" | null;

export default function Step4() {
  const [responses, setResponses] = useState<Response[]>(() => Array(statements.length).fill(null));

  useEffect(() => {
    const stored = getLocal<Response[]>("funnel.mirror", []);
    if (stored.length) setResponses(stored);
  }, []);

  function setResponse(index: number, value: Response) {
    const next = [...responses];
    next[index] = value;
    setResponses(next);
    setLocal("funnel.mirror", next);
  }

  const answered = responses.filter((r) => r !== null).length;

  return (
    <StepBlock title="Step 4" subtitle="Mirror Ritual">
      <div className="space-y-3 text-neutral-300">
        <p>Before anything changes, it has to be named.</p>
        <p>These aren’t mistakes. They’re patterns that appear when pressure builds.</p>
        <p>Read each statement carefully. You don’t need to agree with all of them. Just be honest about what you recognize.</p>
      </div>

      <div className="space-y-4">
        <div className="text-xs text-neutral-500">Reflection {answered} / {statements.length}</div>
        {statements.map((s, idx) => (
          <div key={s} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 space-y-3">
            <div className="text-sm text-neutral-100">{s}</div>
            <div className="grid gap-3 md:grid-cols-2">
              <button
                onClick={() => setResponse(idx, "FIT")}
                className={[
                  "rounded-xl border px-4 py-2 text-left transition",
                  responses[idx] === "FIT"
                    ? "border-neutral-200 bg-neutral-900"
                    : "border-neutral-800 bg-neutral-950 hover:border-neutral-600",
                ].join(" ")}
              >
                Fits
              </button>
              <button
                onClick={() => setResponse(idx, "NOT")}
                className={[
                  "rounded-xl border px-4 py-2 text-left transition",
                  responses[idx] === "NOT"
                    ? "border-neutral-200 bg-neutral-900"
                    : "border-neutral-800 bg-neutral-950 hover:border-neutral-600",
                ].join(" ")}
              >
                Doesn’t fit
              </button>
            </div>
          </div>
        ))}
      </div>

      {answered === statements.length ? (
        <div className="text-sm text-neutral-400">These patterns aren’t rare. They’re human.</div>
      ) : null}
    </StepBlock>
  );
}
