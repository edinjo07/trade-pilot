"use client";

import { useEffect } from "react";

/**
 * Fires once on mount — reads ?b= from the URL (set by middleware)
 * and pings /api/analytics/bot-hit to record the bot visit.
 */
export default function BotTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const botType = params.get("b") || "Bot Unknown";
    fetch("/api/analytics/bot-hit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ botType }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  return null;
}
