// components/ContinueFlow3.tsx
"use client";

import { useEffect, useState } from "react";
import { postJSON } from "@/lib/apiClient";
import { loadFunnelState, patchFunnelState } from "@/lib/funnelState";
import type { FunnelState } from "@/lib/funnelState";

type Step = 1 | 2 | 3;
type ContinueResponse =
  | {
      ok: true;
      sessionId: string;
      already: boolean;
      qualityScore: number | null;
      qualityTier: string | null;
      allowContinue: boolean;
    }
  | { ok: false; code: string };

export function ContinueFlow3() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [st, setSt] = useState<FunnelState | null>(null);

  useEffect(() => {
    let state = loadFunnelState();
    
    // Fix missing clickId (for users with old localStorage data)
    if (!state.clickId) {
      const generatedClickId = `org_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      patchFunnelState({ clickId: generatedClickId });
      state = loadFunnelState();
    }
    
    setSt(state);
  }, []);

  async function markContinue(nextStep: Step) {
    setErr(null);
    setLoading(true);
    try {
      if (!st) {
        throw new Error("State not loaded yet");
      }
      const res = await postJSON<ContinueResponse>("/api/lead/continue", {
        leadId: st.leadId,
        sessionId: st.sessionId,
        step: nextStep,
      });

      if (!res.ok) {
        setErr(res.code || "ERROR");
        return;
      }

      if (nextStep === 3 && !res.allowContinue) {
        setErr("Not eligible to continue. Please check your details.");
        return;
      }

      patchFunnelState({ didContinue: true });
      setStep(nextStep);
    } catch (e: any) {
      setErr(e?.message || "ERROR");
    } finally {
      setLoading(false);
    }
  }

  async function clickOut() {
    setErr(null);
    setLoading(true);

    try {
      if (!st) {
        throw new Error("State not loaded yet");
      }

      if (!st.leadId || !st.clickId) {
        throw new Error("Missing leadId or clickId");
      }

      const OFFER_URL = "https://YOUR_CPA_OFFER_URL_HERE";

      const out = new URL("/out", window.location.origin);
      out.searchParams.set("to", OFFER_URL);
      out.searchParams.set("leadId", st.leadId);
      out.searchParams.set("clickid", st.clickId);

      // optional subs (if you later add them to funnel state)
      if (st.subId) out.searchParams.set("sub1", st.subId);

      // optional offer label
      out.searchParams.set("offer", "default_offer");

      patchFunnelState({ didClickOut: true });

      window.location.href = out.toString();
    } catch (e: any) {
      setErr(e?.message || "ERROR");
      setLoading(false);
    }
  }

  const panels = {
    1: {
      title: "Confirm details",
      body: (
        <div className="space-y-2 text-sm text-zinc-300">
          <div>
            <span className="text-zinc-400">Lead:</span>{" "}
            {st?.firstName || "-"} {st?.lastName || ""} · {st?.email || "-"}
          </div>
          <div>
            <span className="text-zinc-400">Phone:</span> {st?.phone || "-"}
          </div>
          <div className="text-zinc-500">
            If anything is wrong, go back and resubmit.
          </div>
        </div>
      ),
      cta: "Next",
      onCta: () => markContinue(2),
    },
    2: {
      title: "Short questions",
      body: (
        <div className="space-y-3 text-sm text-zinc-300">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
            Are you looking for a solution this week?
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
            Do you prefer phone or WhatsApp follow-up?
          </div>
          <div className="text-zinc-500">
            (You can replace these with your real qualifiers later.)
          </div>
        </div>
      ),
      cta: "Next",
      onCta: () => markContinue(3),
    },
    3: {
      title: "Access the next step",
      body: (
        <div className="space-y-3 text-sm text-zinc-300">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
            You're ready. Click below to proceed.
          </div>
          <div className="text-zinc-500">
            This click is tracked (CPA-safe).
          </div>
        </div>
      ),
      cta: "Proceed",
      onCta: clickOut,
    },
  }[step];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <span className={step >= 1 ? "text-white" : ""}>1</span>
        <span></span>
        <span className={step >= 2 ? "text-white" : ""}>2</span>
        <span></span>
        <span className={step >= 3 ? "text-white" : ""}>3</span>
      </div>

      {!st ? (
        <div className="text-center text-zinc-400">Loading...</div>
      ) : (
        <>
          <div>
            <h2 className="text-lg font-semibold">{panels.title}</h2>
            <div className="mt-3">{panels.body}</div>
          </div>

      {err ? (
        <div className="rounded-xl border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          Error: {err}
        </div>
      ) : null}

          <button
            onClick={panels.onCta}
            disabled={loading || !st}
            className="w-full rounded-xl bg-white px-4 py-2 font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
          >
            {loading ? "Saving..." : panels.cta}
          </button>
        </>
      )}
    </div>
  );
}
