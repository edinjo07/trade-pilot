// components/LeadForm.tsx
"use client";

import { useEffect, useState } from "react";
import { postJSON } from "@/lib/apiClient";
import { loadFunnelState, patchFunnelState } from "@/lib/funnelState";

type LeadResponse = { ok: true; leadId: string } | { ok: false; code: string };

export function LeadForm() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // ensure session exists (frontend side)
  useEffect(() => {
    const st = loadFunnelState();
    // session is created on / page.tsx; this is just safety
    if (!st.sessionId) patchFunnelState({ sessionId: null });
  }, []);

  async function submit() {
    setErr(null);
    setLoading(true);

    try {
      let st = loadFunnelState();

      // Ensure we have a session before submitting lead
      if (!st.sessionId) {
        try {
          // Generate clickId if not present (for self-generated traffic)
          let clickId = st.clickId;
          if (!clickId) {
            clickId = `org_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
          }

          const sessionRes = await postJSON<{ ok: true; sessionId: string }>(
            "/api/session/start",
            {
              clickId: clickId,
              subId: st.subId || null,
              ua: navigator.userAgent,
            }
          );
          
          patchFunnelState({ 
            sessionId: sessionRes.sessionId,
            clickId: clickId,
          });
          st = loadFunnelState(); // reload with new sessionId
        } catch (sessionErr) {
          setErr("Failed to initialize session. Please refresh and try again.");
          setLoading(false);
          return;
        }
      }

      const payload = {
        sessionId: st.sessionId,
        clickId: st.clickId,
        subId: st.subId,

        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
      };

      const res = await postJSON<LeadResponse>("/api/lead", payload);

      if ("ok" in res && res.ok) {
        patchFunnelState({
          leadId: res.leadId,
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          phone: payload.phone,
        });

        window.location.href = "/continue";
        return;
      }

      setErr((res as any).code || "UNKNOWN");
    } catch (e: any) {
      setErr(e?.message || "ERROR");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      <input
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      {err ? (
        <div className="rounded-xl border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          Error: {err}
        </div>
      ) : null}

      <button
        onClick={submit}
        disabled={loading}
        className="w-full rounded-xl bg-white px-4 py-2 font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Continue"}
      </button>

      <div className="text-xs text-zinc-400">
        By continuing, you agree to our Terms & Privacy Policy.
      </div>
    </div>
  );
}
