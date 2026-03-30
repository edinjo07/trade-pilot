"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "./ui";

type SimAction = "BUY" | "SELL" | "TIMEOUT";

export default function SectionSimTrade(props: {
  onBack: () => void;
  onFinish: (x: { simAction: SimAction; simTimeTakenMs: number }) => void;
}) {
  const startedAt = useRef<number>(Date.now());
  const finishedRef = useRef<boolean>(false);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  const statements = useMemo(
    () => [
      "I follow rules when things are calm, but bend them when confidence rises.",
      "I look for confirmation after I’ve already leaned toward a decision.",
      "Losses affect my next decision more than I admit.",
      "When outcomes surprise me, I react instead of slowing down.",
      "I change my approach more often than I review it.",
      "Under pressure, I trust instinct more than process.",
    ],
    []
  );

  useEffect(() => {
    startedAt.current = Date.now();
    finishedRef.current = false;
    setIndex(0);
    setDone(false);
  }, []);

  useEffect(() => {
    if (!done || finishedRef.current) return;
    finishedRef.current = true;
    const timer = window.setTimeout(() => {
      const dt = Date.now() - startedAt.current;
      props.onFinish({ simAction: "TIMEOUT", simTimeTakenMs: dt });
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [done, props]);

  function answer() {
    if (done) return;
    const next = index + 1;
    if (next >= statements.length) {
      setDone(true);
    } else {
      setIndex(next);
    }
  }

  const dimLevel = Math.min(0.26, (done ? statements.length : index) * 0.04);

  return (
    <Card>
      <div className="space-y-4">
        <div className="text-lg md:text-xl font-medium text-neutral-200">
          Before anything changes, it has to be named.
        </div>
        <div className="space-y-2 text-neutral-300 leading-relaxed">
          <p>These aren’t mistakes.</p>
          <p>They’re patterns that appear when pressure builds.</p>
        </div>
        <div className="text-neutral-300 leading-relaxed">
          Read each statement carefully. You don’t need to agree with all of them. Just be
          honest about what you recognize.
        </div>
      </div>

      <div className="mt-6 relative rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
        <div
          className="absolute inset-0 rounded-2xl bg-black pointer-events-none"
          style={{ opacity: dimLevel }}
          aria-hidden="true"
        />
        {done ? (
          <div className="relative text-neutral-300 leading-relaxed">
            These patterns aren’t rare. They’re human.
          </div>
        ) : (
          <div className="relative space-y-4">
            <div className="text-sm text-neutral-500">
              Reflection {index + 1} / {statements.length}
            </div>
            <div className="text-neutral-100 leading-relaxed">{statements[index]}</div>
            <div className="grid gap-3 md:grid-cols-2">
              <button
                onClick={answer}
                className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-left hover:border-neutral-600"
              >
                <div className="font-medium">Fits</div>
              </button>
              <button
                onClick={answer}
                className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-left hover:border-neutral-600"
              >
                <div className="font-medium">Doesn’t fit</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
