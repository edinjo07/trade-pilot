"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FunnelSessionClient } from "@/lib/funnel/types";

export default function Panel3Outbound(props: {
  session: FunnelSessionClient | null;
  onBack: () => void;
}) {
  const [checked, setChecked] = useState(false);
  const [opening, setOpening] = useState(false);
  const router = useRouter();

  const leadId = props.session?.leadId;

  async function go() {
    if (!checked || opening || !leadId) return;
    setOpening(true);

    if (!leadId) {
      setOpening(false);
      alert("Lead ID missing. Please restart the flow.");
      return;
    }

    const res = await fetch("/api/outbound", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId,
        offerKey: "offerA",
        sub1: props.session?.quiz?.derived?.avoidanceType ?? "",
        sub2: props.session?.country ?? "CA",
        sub3: props.session?.quiz?.derived?.confidence ?? "",
        sub4: "direct",
      }),
    });

    if (!res.ok) {
      setOpening(false);
      return;
    }

    const data = (await res.json()) as { clickId?: string };
    if (!data.clickId) {
      setOpening(false);
      return;
    }

    const redirectUrl = `/api/outbound/redirect?clickId=${encodeURIComponent(data.clickId)}`;
    router.push(redirectUrl);
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="text-sm text-neutral-500">Continue · Step 3/3</div>
        <div className="text-2xl md:text-3xl font-semibold">Final confirmation</div>
        <p className="text-neutral-300 leading-relaxed">
          This is the handoff point. If you proceed, you’re choosing to take a concrete next step.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 space-y-3">
        <div className="text-sm font-medium text-neutral-200">Your next step</div>
        <ul className="list-disc pl-5 text-neutral-300 space-y-1">
          <li>Proceed to the external action page.</li>
          <li>Complete the required action there.</li>
          <li>You may be contacted based on the details you provided.</li>
        </ul>
      </div>

      <label className="flex gap-3 items-start rounded-xl border border-neutral-800 bg-neutral-950 p-5 cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <div className="space-y-1">
          <div className="text-neutral-100 font-medium">
            I’m proceeding by choice and I understand this step is external.
          </div>
          <div className="text-sm text-neutral-400">
            I’m not expecting guarantees  I’m taking responsibility for the next action.
          </div>
        </div>
      </label>

      <div className="flex items-center justify-between">
        <button className="text-sm text-neutral-500 hover:text-neutral-300 transition" onClick={props.onBack}>
          Back
        </button>

        <button
          className={[
            "rounded-xl px-5 py-3 transition",
            checked && leadId
              ? "bg-neutral-100 text-neutral-950 hover:bg-neutral-200"
              : "bg-neutral-800 text-neutral-500 cursor-not-allowed",
          ].join(" ")}
          disabled={!checked || !leadId}
          onClick={go}
        >
          Proceed
        </button>
      </div>

      {!leadId && (
        <div className="text-xs text-amber-300/80">
          Lead record missing. Please complete the lead step before proceeding.
        </div>
      )}
    </div>
  );
}
