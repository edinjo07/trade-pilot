// app/sessionBootstrap.tsx
"use client";

import { useEffect } from "react";
import { postJSON } from "@/lib/apiClient";
import { loadFunnelState, patchFunnelState } from "@/lib/funnelState";

export default function ClientSessionBootstrap() {
  useEffect(() => {
    (async () => {
      const st = loadFunnelState();
      if (st.sessionId) return;

      // pull clickId/subId from URL if present (typical CPA)
      const url = new URL(window.location.href);
      let clickId = url.searchParams.get("clickid") || url.searchParams.get("click_id");
      const subId = url.searchParams.get("subid") || url.searchParams.get("sub_id");

      // Generate clickId if not provided (for self-generated traffic)
      if (!clickId) {
        clickId = `org_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      }

      try {
        const res = await postJSON<{ ok: true; sessionId: string }>(
          "/api/session/start",
          {
            clickId: clickId,
            subId: subId || null,
            ua: navigator.userAgent,
          }
        );

        patchFunnelState({
          sessionId: res.sessionId,
          clickId: clickId,
          subId: subId || null,
        });
      } catch {
        // if this fails, LeadForm still works but sessionId may be null
      }
    })();
  }, []);

  return null;
}
