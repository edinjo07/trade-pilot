"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/funnel/storage";
import { Button, Card } from "./ui";
import type { FunnelSessionClient } from "@/lib/funnel/types";

export default function ContinuePanels() {
  const session = useMemo(() => loadSession(), []);
  const [panel, setPanel] = useState<1 | 2 | 3>(1);
  const [consent, setConsent] = useState(false);
  const [opening, setOpening] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();


  useEffect(() => {
    if (!session) setErr("No session found. Start from the main page.");
  }, [session]);

  async function proceed() {
    if (!session?.leadId) {
      setErr("Lead ID missing. Submit the form again.");
      return;
    }
    if (!consent) return;

    setOpening(true);
    setErr(null);

    try {
      const res = await fetch("/api/outbound", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: session.leadId,
          offerKey: "offerA",
          sub1: session.derived?.avoidanceType ?? "UNKNOWN",
          sub2: session.country ?? "CA",
          sub3: String(session.derived?.responsibilityScore ?? ""),
          sub4: "direct",
        }),
      });

      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        setErr(data?.error || "Outbound failed");
        setOpening(false);
        return;
      }

      router.push("/proceed");
      return;
    } catch {
      setErr("Network error");
      setOpening(false);
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card>
          <h1 className="text-xl font-semibold">Session not found</h1>
          <p className="text-neutral-300 mt-2">Go back and restart the flow.</p>
          <div className="mt-4">
            <Button onClick={() => (window.location.href = "/")}>Go Home</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {panel === 1 && (
          <Card>
            <h1 className="text-2xl font-semibold">Before you continue</h1>
            <p className="text-neutral-300 mt-2">
              Confirm you want to proceed to the next step.
            </p>
            <label className="mt-4 flex items-center gap-3 text-sm text-neutral-200">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              I understand this is informational and not investment advice.
            </label>

            <div className="mt-5">
              <Button disabled={!consent} onClick={() => setPanel(2)}>
                Continue
              </Button>
            </div>
          </Card>
        )}

        {panel === 2 && (
          <Card>
            <h2 className="text-2xl font-semibold">Your pattern snapshot</h2>
            <p className="text-neutral-300 mt-2">
              Pattern: <span className="text-neutral-100 font-medium">{session.derived?.avoidanceType ?? "UNKNOWN"}</span>
            </p>
            <p className="text-neutral-300 mt-2">
              Next step will open an external page.
            </p>
            <div className="mt-5 flex gap-3">
              <Button onClick={() => setPanel(3)}>Continue</Button>
              <button className="text-sm text-neutral-400 hover:text-neutral-200 underline" onClick={() => setPanel(1)}>
                Back
              </button>
            </div>
          </Card>
        )}

        {panel === 3 && (
          <Card>
            <h2 className="text-2xl font-semibold">Proceed</h2>
            <p className="text-neutral-300 mt-2">
              This will open the next step externally. You can return here anytime.
            </p>

            {err && <p className="mt-3 text-sm text-red-300">{err}</p>}

            <div className="mt-5 flex gap-3">
              <Button disabled={opening || !consent} onClick={proceed}>
                {opening ? "Opening..." : "Proceed"}
              </Button>
              <button className="text-sm text-neutral-400 hover:text-neutral-200 underline" onClick={() => setPanel(2)}>
                Back
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
