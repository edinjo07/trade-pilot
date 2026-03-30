"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Answer = "fail" | "pass" | "";

type Question = {
  id: string;
  prompt: string;
  options: Array<{ label: string; value: Answer }>;
};

const QUESTIONS: Question[] = [
  {
    id: "capital",
    prompt: "If you lost your deposit, would your life be affected?",
    options: [
      { label: "Yes", value: "fail" },
      { label: "No", value: "pass" },
    ],
  },
  {
    id: "expectation",
    prompt: "What are you expecting in the first 30 days?",
    options: [
      { label: "Guaranteed profit / fixed income", value: "fail" },
      { label: "Uncertain outcomes, learning curve", value: "pass" },
    ],
  },
  {
    id: "risk",
    prompt: "A normal month could include losses. Can you tolerate that emotionally?",
    options: [
      { label: "No", value: "fail" },
      { label: "Yes", value: "pass" },
    ],
  },
  {
    id: "horizon",
    prompt: "How long can you stay consistent without quick results?",
    options: [
      { label: "Less than 2 weeks", value: "fail" },
      { label: "Months", value: "pass" },
    ],
  },
  {
    id: "behavior",
    prompt: "When things go wrong, you usually…",
    options: [
      { label: "Blame the tool/platform", value: "fail" },
      { label: "Review my decisions", value: "pass" },
    ],
  },
  {
    id: "control",
    prompt: "Do you need something fully automatic?",
    options: [
      { label: "Yes", value: "fail" },
      { label: "No", value: "pass" },
    ],
  },
  {
    id: "compliance",
    prompt: "You understand registration/verification may be required and acceptance isn’t guaranteed?",
    options: [
      { label: "No", value: "fail" },
      { label: "Yes", value: "pass" },
    ],
  },
];

export default function QualifyPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, Answer>>({});

  const completed = useMemo(() => {
    return QUESTIONS.every((q) => (answers[q.id] ?? "") !== "");
  }, [answers]);

  function setAnswer(id: string, value: Answer) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function submit() {
    if (!completed) return;
    const hasFail = QUESTIONS.some((q) => answers[q.id] === "fail");
    router.push(hasFail ? "/outcome?result=fail" : "/outcome?result=pass");
  }

  const answeredCount = QUESTIONS.filter((q) => (answers[q.id] ?? "") !== "").length;
  const progress = Math.round((answeredCount / QUESTIONS.length) * 100);

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1
            className="text-2xl md:text-3xl font-extrabold text-white"
            style={{ textShadow: "0 0 30px rgba(52,211,153,0.2)" }}
          >
            Self-qualification
          </h1>
          <p className="mt-1 text-sm text-neutral-400">No neutral answers. This disqualifies most people.</p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg,#059669,#34d399)",
                boxShadow: "0 0 8px rgba(52,211,153,0.4)",
              }}
            />
          </div>
          <p className="mt-1 text-xs text-neutral-600">{answeredCount} / {QUESTIONS.length} answered</p>
        </div>

        <div className="space-y-4">
          {QUESTIONS.map((q) => (
            <div
              key={q.id}
              className="rounded-2xl p-5 space-y-3"
              style={{
                background: "linear-gradient(145deg,rgba(14,20,16,0.88) 0%,rgba(8,12,9,0.95) 100%)",
                border: answers[q.id] ? "1px solid rgba(52,211,153,0.2)" : "1px solid rgba(52,211,153,0.08)",
              }}
            >
              <p className="text-sm font-medium text-neutral-200">{q.prompt}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((o) => {
                  const active = answers[q.id] === o.value;
                  return (
                    <button
                      key={o.label}
                      className="rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-150"
                      style={{
                        background: active
                          ? "linear-gradient(135deg,rgba(16,185,129,0.25) 0%,rgba(5,150,105,0.15) 100%)"
                          : "rgba(255,255,255,0.04)",
                        border: active ? "1px solid rgba(52,211,153,0.5)" : "1px solid rgba(255,255,255,0.06)",
                        color: active ? "#34d399" : "#a3a3a3",
                        boxShadow: active ? "0 0 10px rgba(52,211,153,0.15)" : "none",
                      }}
                      onClick={() => setAnswer(q.id, o.value)}
                    >
                      {active && <span className="mr-2">✓</span>}{o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <button
          className="btn-emerald-gradient inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto"
          disabled={!completed}
          onClick={submit}
        >
          Submit answers →
        </button>
      </div>
    </main>
  );
}
