"use client";

import { useEffect, useMemo, useReducer, useState, useCallback } from "react";
import { loadSession, saveSession } from "@/lib/funnel/storage";
import { reducer } from "@/lib/funnel/reducer";
import type { FunnelSessionClient } from "@/lib/funnel/types";
import { postJSON } from "@/lib/apiClient";

// ── New aggressive funnel sections ───────────────────────────────────────────
import BotGate            from "@/components/funnel/BotGate";
import SocialProofTicker  from "@/components/funnel/SocialProofTicker";
import ExitIntentModal    from "@/components/funnel/ExitIntentModal";
import Section1Hook       from "@/components/funnel/Section1Hook";
import Section2Pain       from "@/components/funnel/Section2Pain";
import SectionPainIntro   from "@/components/funnel/SectionPainIntro";
import SectionPilotSim    from "@/components/funnel/SectionPilotSim";
import SectionLiveProof   from "@/components/funnel/SectionLiveProof";
import Section3CuriousQuiz from "@/components/funnel/Section3CuriousQuiz";
import Section4Reveal     from "@/components/funnel/Section4Reveal";
import Section5Scarcity   from "@/components/funnel/Section5Scarcity";
import Section6LeadCapture from "@/components/funnel/Section6LeadCapture";

// ── Local funnel step type (isolated from legacy FunnelState) ───────────────
type AgStep =
  | "BOT_GATE"    // invisible bot check
  | "S1_HOOK"     // explosive headline + live profit counter
  | "S2_PAIN"     // pain identification
  | "S2B_INTRO"   // pain points deep-dive + TradePilot introduction
  | "S2C_SIM"     // live strategy simulator with animated candle chart
  | "S2D_PROOF"   // $250 live profit simulation (EURUSD + WTI)
  | "S3_QUIZ"     // 3-question micro quiz
  | "S4_REVEAL"   // personalised result + social proof
  | "S5_SCARCITY" // countdown + spot counter
  | "S6_LEAD"     // lead capture form
  | "DONE";       // redirect to /continue

function fresh(): FunnelSessionClient {
  return {
    sessionId: crypto.randomUUID(),
    startedAt: Date.now(),
    leadId: null,
    country: "CA",
    activeState: "S1_ENTRY",
    mirrorSelections: [],
    quiz: { answers: [] },
    derived: {
      mirrorCount: 0,
      quizQuestionsCount: 0,
      avoidanceType: "UNKNOWN",
      responsibilityScore: 0,
      simAction: undefined,
      simTimeTakenMs: undefined,
    },
    leadSubmitted: false,
  };
}

// ── Scroll-to-top on every step transition ───────────────────────────────────
function scrollTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function FunnelShell() {
  // Legacy session for sessionId + lead tracking
  const initial = useMemo(() => loadSession() ?? fresh(), []);
  const [state, dispatch] = useReducer(reducer, initial);

  // New step state (drives the aggressive funnel flow)
  // Lazy-init from sessionStorage so step/answers survive refresh or back-navigation
  const [step, setStep] = useState<AgStep>(() => {
    try {
      const s = sessionStorage.getItem("__tf_step") as AgStep | null;
      if (s && s !== "BOT_GATE" && s !== "DONE") return s;
    } catch { /* ssr guard */ }
    return "BOT_GATE";
  });
  const [painChoice, setPainChoice] = useState<"WATCHING" | "TRIED" | "NO_TIME">(() => {
    try {
      const s = sessionStorage.getItem("__tf_pain") as "WATCHING" | "TRIED" | "NO_TIME" | null;
      if (s) return s;
    } catch { /* ssr guard */ }
    return "WATCHING";
  });
  // Affiliate click tracking (populated from landing URL once on mount)
  const [clickId, setClickId] = useState("");
  const [subId, setSubId]     = useState("");
  // Quiz answers captured from Section3 (forwarded to lead form → /api/lead)
  const [quizAnswers, setQuizAnswers] = useState<Array<{ qid: string; aid: string }>>(() => {
    try {
      const s = sessionStorage.getItem("__tf_quiz");
      if (s) return JSON.parse(s) as Array<{ qid: string; aid: string }>;
    } catch { /* ssr guard */ }
    return [];
  });

  // Persist session
  useEffect(() => { saveSession(state); }, [state]);

  // Persist funnel progress to sessionStorage on every step/data change
  useEffect(() => { try { sessionStorage.setItem("__tf_step",  step); } catch {} }, [step]);
  useEffect(() => { try { sessionStorage.setItem("__tf_pain",  painChoice); } catch {} }, [painChoice]);
  useEffect(() => { try { sessionStorage.setItem("__tf_quiz",  JSON.stringify(quizAnswers)); } catch {} }, [quizAnswers]);

  // If visitor already submitted, send them straight to /continue
  useEffect(() => {
    if (state.leadSubmitted) { window.location.href = "/continue"; }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Capture affiliate URL params from landing URL (?clickid=XX&sub1=YY etc.)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const cid = p.get("clickid") || p.get("click_id") || p.get("cid") || "";
    const sid = p.get("sub1")    || p.get("subid")    || p.get("aff_sub") || "";
    if (cid) setClickId(cid);
    if (sid) setSubId(sid);
  }, []);

  // Bootstrap server session
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await postJSON<{ ok: true; sessionId: string }>("/api/session/start", {
          sessionId: state.sessionId,
        });
        if (cancelled) return;
        if (res.sessionId && res.sessionId !== state.sessionId) {
          dispatch({ type: "RESET", fresh: { ...state, sessionId: res.sessionId } });
        }
      } catch { /* non-fatal */ }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advance = useCallback((next: AgStep) => {
    scrollTop();
    setStep(next);
  }, []);

  // ── Layout wrapper ─────────────────────────────────────────────────────────
  function Shell({ children }: { children: React.ReactNode }) {
    return (
      <div className="relative min-h-screen bg-white text-gray-900">
        {/* Global ticker - shown after bot gate */}
        {step !== "BOT_GATE" && <SocialProofTicker />}

        {/* Exit-intent modal  manages its own open/close state internally */}
        <ExitIntentModal onStay={() => {}} onLeave={() => {}} />

        {/* Centered content card  max-w-xl for comfortable tablet view */}
        <div className="mx-auto max-w-xl px-4 sm:px-6 py-5 sm:py-8 md:py-12">
          {children}
        </div>
      </div>
    );
  }

  // ── Step: BOT_GATE ─────────────────────────────────────────────────────────
  if (step === "BOT_GATE") {
    return (
      <div className="min-h-screen bg-white">
        {/* Show real content immediately  gate runs invisibly in background */}
        <div className="mx-auto max-w-xl px-4 sm:px-6 py-5 sm:py-8 md:py-12">
          <div className="space-y-4">
            {/* Skeleton/teaser so real users see something while gate evaluates */}
            <div className="h-6 w-2/3 rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-4 w-full rounded-lg bg-gray-200/60 animate-pulse" />
            <div className="h-4 w-5/6 rounded-lg bg-gray-200/40 animate-pulse" />
          </div>
        </div>
        <BotGate onPass={() => advance("S1_HOOK")} />
      </div>
    );
  }

  // ── Step: S1_HOOK ──────────────────────────────────────────────────────────
  if (step === "S1_HOOK") {
    return (
      <Shell>
        <Section1Hook onContinue={() => advance("S2_PAIN")} />
      </Shell>
    );
  }

  // ── Step: S2_PAIN ──────────────────────────────────────────────────────────
  if (step === "S2_PAIN") {
    return (
      <Shell>
        <Section2Pain
          onChoice={(c) => {
            setPainChoice(c);
            advance("S2B_INTRO");
          }}
        />
      </Shell>
    );
  }

  // ── Step: S2B_INTRO ────────────────────────────────────────────────────────
  if (step === "S2B_INTRO") {
    return (
      <Shell>
        <SectionPainIntro onContinue={() => advance("S2C_SIM")} />
      </Shell>
    );
  }

  // ── Step: S2C_SIM ──────────────────────────────────────────────────────────
  if (step === "S2C_SIM") {
    return (
      <Shell>
        <SectionPilotSim onContinue={() => advance("S2D_PROOF")} />
      </Shell>
    );
  }

  // ── Step: S2D_PROOF ────────────────────────────────────────────────────────
  if (step === "S2D_PROOF") {
    return (
      <Shell>
        <SectionLiveProof onContinue={() => advance("S3_QUIZ")} />
      </Shell>
    );
  }

  // ── Step: S3_QUIZ ──────────────────────────────────────────────────────────
  if (step === "S3_QUIZ") {
    return (
      <Shell>
        <Section3CuriousQuiz onDone={(answers) => { setQuizAnswers(answers); advance("S4_REVEAL"); }} />
      </Shell>
    );
  }

  // ── Step: S4_REVEAL ────────────────────────────────────────────────────────
  if (step === "S4_REVEAL") {
    return (
      <Shell>
        <Section4Reveal
          painChoice={painChoice}
          onContinue={() => advance("S6_LEAD")}
        />
      </Shell>
    );
  }

  // ── Step: S5_SCARCITY ──────────────────────────────────────────────────────
  if (step === "S5_SCARCITY") {
    return (
      <Shell>
        <Section5Scarcity onContinue={() => advance("S6_LEAD")} />
      </Shell>
    );
  }

  // ── Step: S6_LEAD ──────────────────────────────────────────────────────────
  if (step === "S6_LEAD") {
    return (
      <Shell>
        <Section6LeadCapture
          sessionId={state.sessionId}
          clickId={clickId}
          subId={subId}
          quizAnswers={quizAnswers}
          onLeadId={(id) => dispatch({ type: "LEAD_SET_ID", leadId: id })}
          onDone={() => {
            dispatch({ type: "LEAD_SUBMITTED" });
            window.location.href = "/continue";
          }}
        />
      </Shell>
    );
  }

  return null;
}
