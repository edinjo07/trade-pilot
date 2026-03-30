"use client";

import { Card, Button } from "./ui";
import type { AvoidanceType } from "@/lib/funnel/types";

function titleFor(t: AvoidanceType) {
  if (t === "CONTROL") return "The Controller Pattern";
  if (t === "DELAY") return "The Delayer Pattern";
  if (t === "RESP_AVOID") return "The Responsibility-Avoider Pattern";
  return "Your Pattern";
}

function bodyFor(t: AvoidanceType) {
  switch (t) {
    case "CONTROL":
      return [
        "You’re not afraid of trading  you’re allergic to chaos.",
        "You move fast when the rules are clear, and you lose interest when things feel random.",
        "Your real blocker isn’t knowledge. It’s trust: you don’t trust a system until you see structure and limits.",
        "If you start, you’ll do best with: fixed rules, risk caps, and a simple repeatable routine.",
      ];
    case "DELAY":
      return [
        "You don’t say “no”  you say “later”. That’s the trap.",
        "You keep preparing because starting would force you to face real outcomes.",
        "The cost isn’t money. The cost is time: every month you delay becomes your default identity.",
        "If you start, you’ll do best with: small steps, quick wins, and a strict schedule.",
      ];
    case "RESP_AVOID":
      return [
        "You want progress without carrying full responsibility for risk.",
        "So your brain searches for certainty  but trading rewards risk management, not certainty.",
        "Your trap is ‘guarantee hunting’: you keep waiting for proof that removes your fear.",
        "If you start, you’ll do best with: very small exposure, strict limits, and clear expectations.",
      ];
    default:
      return [
        "You show a mixed pattern. That’s normal.",
        "We’ll keep the next step structured and simple.",
      ];
  }
}

export default function Section6Result(props: {
  avoidanceType: AvoidanceType;
  responsibilityScore: number;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <Card>
      <h2 className="text-2xl font-semibold">{titleFor(props.avoidanceType)}</h2>
      <p className="text-neutral-300 mt-2">
        Responsibility signal: <span className="text-neutral-100 font-medium">{props.responsibilityScore}/10</span>
      </p>

      <div className="mt-4 space-y-2 text-neutral-200">
        {bodyFor(props.avoidanceType).map((x, i) => (
          <p key={i} className="leading-relaxed">{x}</p>
        ))}
      </div>

      <p className="text-neutral-300 mt-4">
        Next: a 5-second decision simulation. It’s not about being “right”  it measures your decision style.
      </p>

      <div className="mt-5 flex gap-3">
        <Button onClick={props.onContinue}>Continue</Button>
        <button className="text-sm text-neutral-400 hover:text-neutral-200 underline" onClick={props.onBack}>
          Back
        </button>
      </div>
    </Card>
  );
}
