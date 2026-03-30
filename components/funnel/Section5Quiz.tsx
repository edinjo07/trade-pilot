"use client";

import { useMemo, useRef, useState } from "react";
import { Card, Button } from "./ui";
import type { AvoidanceType } from "@/lib/funnel/types";

type Axis = "DELAY" | "CONTROL" | "RESP_AVOID";
type Option = { id: string; label: string; w: Partial<Record<Axis, number>>; respDelta: number };
type Q = { id: string; axis: Axis; text: string; options: Option[] };

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function seed01(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

const BANK: Q[] = [
  {
    id: "q1",
    axis: "DELAY",
    text: "When you think about starting trading, what happens most often?",
    options: [
      { id: "a", label: "I postpone until I have “more time/knowledge”.", w: { DELAY: 2 }, respDelta: 0 },
      { id: "b", label: "I want a clear structure and rules first.", w: { CONTROL: 2 }, respDelta: 1 },
      { id: "c", label: "I worry I’ll blame myself if it goes wrong.", w: { RESP_AVOID: 2 }, respDelta: -1 },
    ],
  },
  {
    id: "q2",
    axis: "CONTROL",
    text: "Which feels more ‘safe’ to you?",
    options: [
      { id: "a", label: "A defined system with rules I can follow.", w: { CONTROL: 2 }, respDelta: 2 },
      { id: "b", label: "Waiting until I feel ready enough.", w: { DELAY: 2 }, respDelta: 0 },
      { id: "c", label: "Only joining if someone else takes responsibility.", w: { RESP_AVOID: 2 }, respDelta: -2 },
    ],
  },
  {
    id: "q3",
    axis: "RESP_AVOID",
    text: "If you lost money, what would hurt most?",
    options: [
      { id: "a", label: "Knowing it was my decision.", w: { RESP_AVOID: 2 }, respDelta: -2 },
      { id: "b", label: "Not having followed a system.", w: { CONTROL: 2 }, respDelta: 1 },
      { id: "c", label: "Having delayed and missed the chance.", w: { DELAY: 1 }, respDelta: 1 },
    ],
  },
  {
    id: "q4",
    axis: "CONTROL",
    text: "How do you prefer to learn something new?",
    options: [
      { id: "a", label: "A step-by-step plan, then I execute.", w: { CONTROL: 2 }, respDelta: 2 },
      { id: "b", label: "I research forever and still delay.", w: { DELAY: 2 }, respDelta: 0 },
      { id: "c", label: "I avoid if it feels risky or uncertain.", w: { RESP_AVOID: 1 }, respDelta: -1 },
    ],
  },
  {
    id: "q5",
    axis: "DELAY",
    text: "What usually makes you finally start?",
    options: [
      { id: "a", label: "A deadline / pressure (I stop delaying).", w: { DELAY: 2 }, respDelta: 1 },
      { id: "b", label: "Clear rules and a repeatable process.", w: { CONTROL: 2 }, respDelta: 2 },
      { id: "c", label: "Someone else validating it for me.", w: { RESP_AVOID: 2 }, respDelta: -1 },
    ],
  },
  {
    id: "q6",
    axis: "RESP_AVOID",
    text: "Which sentence is closest to you?",
    options: [
      { id: "a", label: "I’m okay being responsible for outcomes.", w: { CONTROL: 1 }, respDelta: 3 },
      { id: "b", label: "I prefer to wait until I’m fully confident.", w: { DELAY: 2 }, respDelta: 0 },
      { id: "c", label: "I’d rather not decide at all.", w: { RESP_AVOID: 3 }, respDelta: -3 },
    ],
  },
  {
    id: "q7",
    axis: "CONTROL",
    text: "What would make you trust a trading setup more?",
    options: [
      { id: "a", label: "Rules + risk limits + clear expectations.", w: { CONTROL: 3 }, respDelta: 2 },
      { id: "b", label: "Seeing others do it first.", w: { RESP_AVOID: 2 }, respDelta: -1 },
      { id: "c", label: "Waiting for the ‘perfect moment’.", w: { DELAY: 2 }, respDelta: 0 },
    ],
  },
  {
    id: "q8",
    axis: "DELAY",
    text: "Pick the most honest reason you haven’t started.",
    options: [
      { id: "a", label: "I keep pushing it to ‘later’.", w: { DELAY: 3 }, respDelta: 0 },
      { id: "b", label: "I don’t have a process yet.", w: { CONTROL: 2 }, respDelta: 1 },
      { id: "c", label: "I fear regret if it goes wrong.", w: { RESP_AVOID: 2 }, respDelta: -2 },
    ],
  },
  {
    id: "q9",
    axis: "RESP_AVOID",
    text: "When you face uncertainty, you usually…",
    options: [
      { id: "a", label: "Avoid the decision and distract myself.", w: { RESP_AVOID: 3 }, respDelta: -2 },
      { id: "b", label: "Create a plan and act.", w: { CONTROL: 2 }, respDelta: 2 },
      { id: "c", label: "Delay until I feel ready.", w: { DELAY: 2 }, respDelta: 0 },
    ],
  },
  {
    id: "q10",
    axis: "CONTROL",
    text: "How do you feel about automated systems?",
    options: [
      { id: "a", label: "I like them if rules and limits are clear.", w: { CONTROL: 2 }, respDelta: 2 },
      { id: "b", label: "I’m curious but I delay decisions.", w: { DELAY: 1 }, respDelta: 0 },
      { id: "c", label: "I want guarantees before anything.", w: { RESP_AVOID: 2 }, respDelta: -2 },
    ],
  },
  {
    id: "q11",
    axis: "DELAY",
    text: "Which is more painful?",
    options: [
      { id: "a", label: "Losing because I never started.", w: { DELAY: 2 }, respDelta: 1 },
      { id: "b", label: "Losing because I broke my rules.", w: { CONTROL: 2 }, respDelta: 1 },
      { id: "c", label: "Losing because I made the wrong call.", w: { RESP_AVOID: 2 }, respDelta: -2 },
    ],
  },
  {
    id: "q12",
    axis: "RESP_AVOID",
    text: "Choose one:",
    options: [
      { id: "a", label: "I prefer control and a process.", w: { CONTROL: 2 }, respDelta: 2 },
      { id: "b", label: "I keep delaying even when I want it.", w: { DELAY: 2 }, respDelta: 0 },
      { id: "c", label: "I avoid responsibility for outcomes.", w: { RESP_AVOID: 2 }, respDelta: -2 },
    ],
  },
];

function pickAvoidance(scores: Record<Axis, number>): AvoidanceType {
  const entries = Object.entries(scores) as [Axis, number][];
  entries.sort((a, b) => b[1] - a[1]);
  const top = entries[0]?.[0] ?? "DELAY";
  return top === "RESP_AVOID" ? "RESP_AVOID" : top;
}

export default function Section5Quiz(props: {
  sessionId: string;
  onFinish: (x: {
    quizQuestionsCount: number;
    avoidanceType: AvoidanceType;
    responsibilityScore: number;
  }) => void;
  onBack: () => void;
}) {
  const seeded = useMemo(() => seed01(props.sessionId), [props.sessionId]);

  const pool = useMemo(() => {
    const arr = [...BANK];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor((seeded * 1000000 + i * 997) % (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [seeded]);

  const [asked, setAsked] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<Axis, number>>({
    DELAY: 0,
    CONTROL: 0,
    RESP_AVOID: 0,
  });
  const [respRaw, setRespRaw] = useState(0);

  const shownAtRef = useRef<number>(Date.now());

  const nextQ = useMemo(() => {
    const remaining = pool.filter((q) => !asked.includes(q.id));
    if (remaining.length === 0) return null;

    const sorted = (Object.entries(scores) as [Axis, number][])
      .slice()
      .sort((a, b) => b[1] - a[1]);
    const leader = sorted[0][0];
    const runner = sorted[1][0];

    const leadQ = remaining.find((q) => q.axis === leader);
    if (leadQ) return leadQ;

    const runnerQ = remaining.find((q) => q.axis === runner);
    return runnerQ ?? remaining[0];
  }, [pool, asked, scores]);

  function choose(opt: Option) {
    const dt = Date.now() - shownAtRef.current;
    void dt;

    setScores((prev) => ({
      ...prev,
      DELAY: prev.DELAY + (opt.w.DELAY ?? 0),
      CONTROL: prev.CONTROL + (opt.w.CONTROL ?? 0),
      RESP_AVOID: prev.RESP_AVOID + (opt.w.RESP_AVOID ?? 0),
    }));
    setRespRaw((prev) => prev + opt.respDelta);

    setAsked((prev) => {
      const n = [...prev, nextQ!.id];
      return n;
    });

    shownAtRef.current = Date.now();
  }

  const answeredCount = asked.length;
  const finished = answeredCount >= 12 || nextQ === null;

  if (finished) {
    const avoidanceType = pickAvoidance(scores);
    const resp01 = (respRaw + 15) / 30;
    const responsibilityScore = Math.round(clamp(resp01 * 10, 0, 10));

    return (
      <Card>
        <h2 className="text-2xl font-semibold">Quiz complete</h2>
        <p className="text-neutral-300 mt-2">
          Tap continue to see your pattern summary.
        </p>

        <div className="mt-4 grid gap-2 text-sm text-neutral-300">
          <div>
            Answered: <span className="text-neutral-100 font-medium">{answeredCount}</span>
          </div>
          <div>
            Detected: <span className="text-neutral-100 font-medium">{avoidanceType}</span>
          </div>
          <div>
            Responsibility: <span className="text-neutral-100 font-medium">{responsibilityScore}/10</span>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <Button
            onClick={() =>
              props.onFinish({
                quizQuestionsCount: answeredCount,
                avoidanceType,
                responsibilityScore,
              })
            }
          >
            Continue
          </Button>
          <button className="text-sm text-neutral-400 hover:text-neutral-200 underline" onClick={props.onBack}>
            Back
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Quick pattern check</h2>
        <div className="text-sm text-neutral-400">{answeredCount + 1}/12</div>
      </div>

      <p className="text-neutral-200 mt-4 text-lg">{nextQ?.text}</p>

      <div className="mt-4 grid gap-3">
        {nextQ?.options.map((o) => (
          <button
            key={o.id}
            onClick={() => choose(o)}
            className="text-left rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 hover:border-neutral-600"
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex gap-3">
        <button className="text-sm text-neutral-400 hover:text-neutral-200 underline" onClick={props.onBack}>
          Back
        </button>
      </div>
    </Card>
  );
}
