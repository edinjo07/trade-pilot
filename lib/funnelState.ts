// lib/funnelState.ts
export type FunnelState = {
  sessionId: string | null;

  // click tracking
  clickId: string | null;
  subId: string | null;

  // lead info
  leadId: string | null;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;

  // progress flags
  didContinue: boolean;
  didClickOut: boolean;

  // timestamps
  createdAt: number;
  lastUpdatedAt: number;
};

const KEY =
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_FUNNEL_SESSION_KEY : undefined;

export function defaultFunnelState(): FunnelState {
  const now = Date.now();
  return {
    sessionId: null,
    clickId: null,
    subId: null,

    leadId: null,
    email: null,
    phone: null,
    firstName: null,
    lastName: null,

    didContinue: false,
    didClickOut: false,

    createdAt: now,
    lastUpdatedAt: now,
  };
}

export function loadFunnelState(): FunnelState {
  if (typeof window === "undefined") return defaultFunnelState();
  if (!KEY) return defaultFunnelState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultFunnelState();
    const parsed = JSON.parse(raw) as FunnelState;
    return { ...defaultFunnelState(), ...parsed };
  } catch {
    return defaultFunnelState();
  }
}

export function saveFunnelState(next: FunnelState) {
  if (typeof window === "undefined") return;
  if (!KEY) return;
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function patchFunnelState(patch: Partial<FunnelState>) {
  const cur = loadFunnelState();
  const next: FunnelState = {
    ...cur,
    ...patch,
    lastUpdatedAt: Date.now(),
  };
  saveFunnelState(next);
  return next;
}

export function resetFunnelState() {
  const next = defaultFunnelState();
  saveFunnelState(next);
  return next;
}
