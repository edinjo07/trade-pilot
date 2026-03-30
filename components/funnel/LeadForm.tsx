"use client";

import { useState } from "react";
import { Card, Button, Input } from "./ui";
import type { FunnelSessionClient } from "@/lib/funnel/types";

export default function LeadForm(props: {
  session: FunnelSessionClient;
  onBack: () => void;
  onLeadId: (id: string) => void;
  onDone: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const isComplete =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length > 0;

  async function submit() {
    setErr(null);
    setLoading(true);

    try {
      const safeFirst = firstName.trim();
      const safeLast = lastName.trim();
      const fullName = [safeFirst, safeLast].filter(Boolean).join(" ");

      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: props.session.sessionId,
          firstName: safeFirst || null,
          lastName: safeLast || null,
          fullName: fullName || null,
          email,
          phone,
        }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        setErr(data?.error || "Lead submit failed");
        setLoading(false);
        return;
      }

      if (data?.leadId) props.onLeadId(String(data.leadId));
      props.onDone();
    } catch {
      setErr("Network error");
      setLoading(false);
    }
  }

  return (
    <Card>
      <div className="mt-2 grid gap-3">
        <div>
          <label className="text-sm text-neutral-300">First name</label>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First" />
        </div>
        <div>
          <label className="text-sm text-neutral-300">Last name</label>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last" />
        </div>
        <div>
          <label className="text-sm text-neutral-300">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="text-sm text-neutral-300">Phone number</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 416 555 1234" />
        </div>

        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
      </div>

      {err && <p className="mt-3 text-sm text-red-300">{err}</p>}

      <div className="mt-5 flex gap-3">
        <Button disabled={loading || !isComplete} onClick={submit}>
          {loading ? "Saving..." : "Continue with guidance"}
        </Button>
        <button className="text-sm text-neutral-400 hover:text-neutral-200 underline" onClick={props.onBack}>
          Back
        </button>
      </div>

      <div className="mt-4 text-sm text-neutral-400">
        This isn’t approval. If there’s a fit, contact may follow.
      </div>
    </Card>
  );
}
