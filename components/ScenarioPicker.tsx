"use client";

import type { HumanScenario } from "@/lib/scenarios";

export default function ScenarioPicker({
  scenarios,
  selectedId,
  onSelect,
}: {
  scenarios: HumanScenario[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {scenarios.map((s) => {
        const active = selectedId === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={[
              "rounded-2xl border px-4 py-4 text-left transition",
              active
                ? "border-neutral-200 bg-neutral-900"
                : "border-neutral-800 bg-neutral-950 hover:border-neutral-600",
            ].join(" ")}
          >
            <div className="text-xs text-neutral-500">{s.instrument}</div>
            <div className="mt-2 text-neutral-100 font-medium">{s.title}</div>
            <div className="mt-1 text-xs text-neutral-500">{s.timestamp}</div>
          </button>
        );
      })}
    </div>
  );
}
