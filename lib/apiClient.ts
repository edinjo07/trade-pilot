// lib/apiClient.ts
export async function postJSON<T>(
  url: string,
  body: unknown,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    body: JSON.stringify(body),
    cache: "no-store",
    ...init,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = (data && (data.error || data.code)) || `HTTP_${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export async function getJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { method: "GET", cache: "no-store", ...init });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = (data && (data.error || data.code)) || `HTTP_${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}
