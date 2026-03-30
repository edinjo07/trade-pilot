export function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function mergeLocal<T extends Record<string, any>>(key: string, patch: Partial<T>) {
  const current = getLocal<T>(key, {} as T);
  setLocal(key, { ...current, ...patch });
}
