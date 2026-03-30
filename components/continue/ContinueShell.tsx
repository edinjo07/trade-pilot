"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Panel1Consent from "@/components/continue/Panel1Consent";
import Panel2Bridge from "@/components/continue/Panel2Bridge";
import Panel3CostOfWaiting from "@/components/continue/Panel3CostOfWaiting";
import Panel4LeadForm from "@/components/continue/Panel4LeadForm";
import { readClientSession } from "@/lib/funnel/readClientSession";
import type { FunnelSessionClient } from "@/lib/funnel/types";

type Step = 1 | 2 | 3 | 4;

export default function ContinueShell() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [session, setSession] = useState<FunnelSessionClient | null>(null);

  const activeIndex = useMemo(() => step - 1, [step]);

  useEffect(() => {
    const s = readClientSession();
    setSession(s);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const sections = Array.from(el.querySelectorAll<HTMLElement>("[data-continue-section]"));
    const target = sections[activeIndex];
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeIndex]);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div ref={containerRef} className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth">
        <ContinueSection index={0} activeIndex={activeIndex}>
          <Panel1Consent
            session={session}
            onContinue={() => setStep(2)}
            onBackToStart={() => (window.location.href = "/")}
          />
        </ContinueSection>

        <ContinueSection index={1} activeIndex={activeIndex}>
          <Panel2Bridge
            session={session}
            onContinue={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        </ContinueSection>

        <ContinueSection index={2} activeIndex={activeIndex}>
          <Panel3CostOfWaiting onContinue={() => setStep(4)} onBack={() => setStep(2)} />
        </ContinueSection>

        <ContinueSection index={3} activeIndex={activeIndex}>
          <Panel4LeadForm session={session} onBack={() => setStep(3)} />
        </ContinueSection>
      </div>
    </main>
  );
}

function ContinueSection(props: {
  index: number;
  activeIndex: number;
  children: React.ReactNode;
}) {
  const { index, activeIndex, children } = props;
  const isPast = index < activeIndex;
  const isActive = index === activeIndex;
  const isFuture = index > activeIndex;

  return (
    <section
      data-continue-section
      className={[
        "h-screen snap-start flex items-center",
        "transition-opacity duration-500",
        isActive ? "opacity-100" : isPast ? "opacity-70" : "opacity-30",
      ].join(" ")}
    >
      <div className="mx-auto w-full max-w-3xl px-6 py-14">
        <div
          className={[
            "relative rounded-2xl border border-neutral-800 bg-neutral-950/60 backdrop-blur",
            "p-8 md:p-10",
            "transition-transform duration-500",
            isActive ? "scale-100" : "scale-[0.98]",
            isFuture ? "pointer-events-none select-none" : "pointer-events-auto",
          ].join(" ")}
          aria-disabled={!isActive}
        >
          {isFuture && <div className="absolute inset-0 rounded-2xl" aria-hidden="true" />}
          <div className={isActive ? "" : "pointer-events-none"}>{children}</div>
        </div>

        {isActive && <div className="mt-6 text-sm text-neutral-500">Continue when ready.</div>}
      </div>
    </section>
  );
}
