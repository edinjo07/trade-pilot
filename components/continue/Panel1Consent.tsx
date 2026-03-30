"use client";

import { useMemo, useState } from "react";
import type { FunnelSessionClient } from "@/lib/funnel/types";

export default function Panel1Consent(props: {
  session: FunnelSessionClient | null;
  onContinue: () => void;
  onBackToStart: () => void;
}) {
  const [checked, setChecked] = useState(false);

  const hasSession = useMemo(() => !!props.session?.sessionId, [props.session]);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="text-sm text-neutral-500">Continue · Step 1/3</div>
        <div className="text-2xl md:text-3xl font-semibold">Pressure test</div>
        <p className="text-neutral-300 leading-relaxed">
          This is a simple stress test. If you can’t accept real drawdowns, stop here.
        </p>
      </div>

      {!hasSession && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
          <div className="text-neutral-200 font-medium">Session not found</div>
          <p className="mt-2 text-sm text-neutral-400">
            If you opened this page directly, we may not have your earlier answers on this device. Go back to
            the start to run the flow again.
          </p>
          <div className="mt-4">
            <button
              className="rounded-xl bg-neutral-100 text-neutral-950 px-5 py-3 hover:bg-neutral-200 transition"
              onClick={props.onBackToStart}
            >
              Back to start
            </button>
          </div>
        </div>
      )}

      <label className="flex gap-3 items-start rounded-xl border border-neutral-800 bg-neutral-950 p-5 cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <div className="space-y-1">
          <div className="text-neutral-100 font-medium">
            I can tolerate a $1,000 drawdown without panic-selling.
          </div>
          <div className="text-sm text-neutral-400">
            If that’s not true, I should exit now.
          </div>
        </div>
      </label>

      <div className="flex justify-end">
        <button
          className={[
            "rounded-xl px-5 py-3 transition",
            checked && hasSession
              ? "bg-neutral-100 text-neutral-950 hover:bg-neutral-200"
              : "bg-neutral-800 text-neutral-500 cursor-not-allowed",
          ].join(" ")}
          disabled={!checked || !hasSession}
          onClick={props.onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
