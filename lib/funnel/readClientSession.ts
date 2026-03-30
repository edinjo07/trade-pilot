import type { FunnelSessionClient } from "./types";

// nosemgrep: hardcoded-credentials
const KEY = process.env.NEXT_PUBLIC_FUNNEL_SESSION_KEY;

export function readClientSession(): FunnelSessionClient | null {
  if (typeof window === "undefined" || !KEY) return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FunnelSessionClient;
  } catch {
    return null;
  }
}
