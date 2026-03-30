"use client";

import { useState } from "react";
import StepBlock from "@/components/StepBlock";
import { setLocal } from "@/lib/utils";

export default function Step7Commitment() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length > 0;

  async function submit() {
    if (!valid || loading) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        setError(data?.error || "Lead submit failed");
        setLoading(false);
        return;
      }

      setLocal("funnel.step7", { completed: true, leadId: data?.leadId ?? null });
      window.location.href = "/thanks";
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <StepBlock title="Step 7" subtitle="Commitment Gate">
      <div className="space-y-3 text-neutral-300">
        <p>Structure only matters if decisions can be revisited.</p>
        <p>This can’t continue anonymously. Patterns disappear if nothing is remembered.</p>
        <p>There’s no obligation to continue. You can stop here.</p>
        <p className="text-sm text-neutral-400">
          If you don’t want to do this alone  and want structure to persist  this is the commitment.
        </p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
        <div>
          <label className="text-xs text-neutral-400">First name</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm"
            placeholder="First"
          />
        </div>
        <div>
          <label className="text-xs text-neutral-400">Last name</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm"
            placeholder="Last"
          />
        </div>
        <div>
          <label className="text-xs text-neutral-400">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="text-xs text-neutral-400">Phone number</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm"
            placeholder="+1 416 555 1234"
          />
        </div>

        {error ? <div className="text-sm text-red-400">{error}</div> : null}

        <button
          onClick={submit}
          disabled={!valid || loading}
          className={[
            "rounded-xl px-5 py-3 text-sm font-semibold transition",
            valid
              ? "bg-neutral-100 text-neutral-950 hover:bg-neutral-200"
              : "bg-neutral-800 text-neutral-500 cursor-not-allowed",
          ].join(" ")}
        >
          {loading ? "Saving…" : "Continue with guidance"}
        </button>
      </div>

      <div className="text-xs text-neutral-500">
        This isn’t approval. If there’s a fit, contact may follow.
      </div>
    </StepBlock>
  );
}
