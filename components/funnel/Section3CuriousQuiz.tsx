"use client";

/**
 * Section3CuriousQuiz  Fast 3-question micro-quiz.
 *
 * Psychological levers:
 * • Progress bar climbing → sunk-cost / commitment
 * • Personalisation illusion → "we're building your profile"
 * • All answers are "correct"  no failure path
 * • Speed: each question auto-advances, creates momentum
 */

interface QuizAnswer {
  qid: string;
  aid: string;
}

interface Props {
  onDone: (answers: QuizAnswer[]) => void;
}

import { useState } from "react";
import { useT } from "@/components/LocaleProvider";

const PROGRESS_STEPS = [15, 50, 85, 100];

export default function Section3CuriousQuiz({ onDone }: Props) {
  const t = useT();

  const QUESTIONS = [
    {
      qid: "q1",
      text: t.s3_q1,
      answers: [
        { aid: "a1", label: t.s3_a1_1 },
        { aid: "a2", label: t.s3_a1_2 },
        { aid: "a3", label: t.s3_a1_3 },
        { aid: "a4", label: t.s3_a1_4 },
      ],
    },
    {
      qid: "q2",
      text: t.s3_q2,
      answers: [
        { aid: "a1", label: t.s3_a2_1 },
        { aid: "a2", label: t.s3_a2_2 },
        { aid: "a3", label: t.s3_a2_3 },
        { aid: "a4", label: t.s3_a2_4 },
      ],
    },
    {
      qid: "q3",
      text: t.s3_q3,
      answers: [
        { aid: "a1", label: t.s3_a3_1 },
        { aid: "a2", label: t.s3_a3_2 },
        { aid: "a3", label: t.s3_a3_3 },
        { aid: "a4", label: t.s3_a3_4 },
      ],
    },
  ];

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);

  const q = QUESTIONS[step];
  const progress = PROGRESS_STEPS[step] ?? 100;

  function choose(aid: string) {
    const updated = [...answers, { qid: q.qid, aid }];
    setAnswers(updated);

    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      // brief delay then complete
      window.setTimeout(() => onDone(updated), 600);
    }
  }

  return (
    <div className="space-y-7 animate-fade-in-up">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>
          {t.s3_progress_label}
        </span>
          <span className="font-bold text-emerald-400">{progress}%</span>
        </div>
        <div className="relative h-2 w-full rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.07)" }}>
          <div
            className="h-full rounded-full progress-bar-animated transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #059669 0%, #34d399 100%)",
              boxShadow: "0 0 10px rgba(52,211,153,0.5)",
            }}
          />
        </div>
        {/* Step dots */}
        <div className="flex items-center gap-1.5 justify-center mt-1">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? "20px" : "6px",
                height: "6px",
                background: i <= step ? "#34d399" : "rgba(0,0,0,0.12)",
                boxShadow: i === step ? "0 0 6px rgba(52,211,153,0.6)" : "none",
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <span className="text-xs text-gray-400 uppercase tracking-widest">
          {t.s3_question_label.replace("{q}", String(step + 1)).replace("{total}", String(QUESTIONS.length))}
        </span>
        <h2 className="mt-2 text-xl md:text-2xl font-extrabold text-gray-900 leading-snug">
          {q.text}
        </h2>
      </div>

      <div className="grid gap-3">
        {q.answers.map((a) => (
          <button
            key={a.aid}
            onClick={() => choose(a.aid)}
            className="
              w-full rounded-xl px-5 py-4 text-left text-sm font-medium
              text-gray-700 active:scale-[0.99]
              transition-all duration-150
            "
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.09)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(52,211,153,0.5)";
              (e.currentTarget as HTMLElement).style.color = "#111827";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 14px rgba(52,211,153,0.10)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.09)";
              (e.currentTarget as HTMLElement).style.color = "";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <span className="flex items-center gap-3">
              <span
                className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}
              >
                {String.fromCharCode(65 + q.answers.indexOf(a))}
              </span>
              {a.label}
            </span>
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400">
        {t.s3_footer}
      </p>
    </div>
  );
}
