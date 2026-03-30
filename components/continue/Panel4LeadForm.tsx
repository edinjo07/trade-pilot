"use client";

import { useState } from "react";
import LeadForm from "@/components/funnel/LeadForm";
import type { FunnelSessionClient } from "@/lib/funnel/types";
import { saveSession } from "@/lib/funnel/storage";
import { patchFunnelState } from "@/lib/funnelState";

export default function Panel4LeadForm(props: {
  session: FunnelSessionClient | null;
  onBack: () => void;
}) {
  const [leadId, setLeadId] = useState<string | null>(props.session?.leadId ?? null);

  const session = props.session;

  if (!session) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
        <div className="text-neutral-200 font-medium">Session missing</div>
        <p className="mt-2 text-sm text-neutral-400">
          We can’t continue without the earlier steps. Please restart from the beginning.
        </p>
        <div className="mt-4">
          <button
            className="rounded-xl bg-neutral-100 text-neutral-950 px-5 py-3 hover:bg-neutral-200 transition"
            onClick={() => (window.location.href = "/")}
          >
            Back to start
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="text-sm text-neutral-500">Continue · Step 4/4</div>
        <div className="text-2xl md:text-3xl font-semibold">Commitment gate</div>
        <p className="text-neutral-300 leading-relaxed">
          Structure only matters if decisions can be revisited.
        </p>
        <p className="text-neutral-300 leading-relaxed">
          This can’t continue anonymously. Patterns disappear if nothing is remembered.
        </p>
        <p className="text-neutral-300 leading-relaxed">
          There’s no obligation to continue. You can stop here.
        </p>
        <p className="text-neutral-400 leading-relaxed text-sm">
          If you don’t want to do this alone  and want structure to persist  this is the
          commitment.
        </p>
      </div>

      <LeadForm
        session={session}
        onBack={props.onBack}
        onLeadId={(leadId) => {
          const next = { ...session, leadId };
          setLeadId(leadId);
          saveSession(next);
        }}
        onDone={() => {
          patchFunnelState({
            leadId,
            didContinue: true,
          });
          window.location.href = "/thanks";
        }}
      />
    </div>
  );
}
