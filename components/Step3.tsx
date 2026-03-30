"use client";

import { useEffect, useState } from "react";
import StepBlock from "@/components/StepBlock";
import { getLocal, setLocal } from "@/lib/utils";

const choices = [
  { id: "late", label: "I hesitate, then enter too late." },
  { id: "second_guess", label: "I act with confidence, then second-guess myself." },
  { id: "switch", label: "After a loss, I change my approach too quickly." },
  { id: "delay", label: "When uncertainty spikes, I delay decisions." },
];

export default function Step3() {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const stored = getLocal<string | null>("funnel.pattern", null);
    if (stored) setSelected(stored);
  }, []);

  function choose(id: string) {
    setSelected(id);
    setLocal("funnel.pattern", id);
  }

  return (
    <StepBlock title="Step 3" subtitle="Identity Friction">
      <div className="space-y-4 text-neutral-300">
        <p>At this point, most people nod and move on.</p>
        <p>The patterns don’t change because they’re hidden. They change because they’re noticed.</p>
        <p>Which of these situations feels familiar? There’s no correct answer. Just recognition.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {choices.map((choice) => {
          const active = selected === choice.id;
          return (
            <button
              key={choice.id}
              onClick={() => choose(choice.id)}
              className={[
                "rounded-2xl border px-5 py-4 text-left transition",
                active
                  ? "border-neutral-200 bg-neutral-900"
                  : "border-neutral-800 bg-neutral-950 hover:border-neutral-600",
              ].join(" ")}
            >
              <div className="text-sm text-neutral-100">{choice.label}</div>
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="space-y-2 text-sm text-neutral-400">
          <div>Pattern noted.</div>
          <div>This pattern is common. It doesn’t say anything about your intelligence  only how pressure shows up.</div>
        </div>
      ) : null}
    </StepBlock>
  );
}
