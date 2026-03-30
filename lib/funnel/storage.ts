import type { FunnelSessionClient } from "./types";

const storageKeyFromEnv = (() => {
  if (typeof process === "undefined") return undefined;
  return process.env.NEXT_PUBLIC_FUNNEL_SESSION_KEY;
})();

export function loadSession(): FunnelSessionClient | null {
  if (typeof window === "undefined") return null;
  if (!storageKeyFromEnv) return null;
  const raw = window.localStorage.getItem(storageKeyFromEnv);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FunnelSessionClient;
  } catch {
    return null;
  }
}

export function saveSession(s: FunnelSessionClient) {
  if (typeof window === "undefined") return;
  if (!storageKeyFromEnv) return;
  window.localStorage.setItem(storageKeyFromEnv, JSON.stringify(s));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  if (!storageKeyFromEnv) return;
  window.localStorage.removeItem(storageKeyFromEnv);
}
