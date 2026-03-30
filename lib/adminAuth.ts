/**
 * Admin auth helpers.
 * The session cookie value is compared directly to ADMIN_TOKEN from .env.
 * Rotating ADMIN_TOKEN invalidates all active sessions immediately.
 */

export const ADMIN_COOKIE = "tp_admin_sess";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

/** Returns the expected session token from env. */
export function getAdminToken(): string {
  return process.env.ADMIN_TOKEN ?? "";
}

/** Constant-time string comparison to prevent timing attacks. */
export function safeEqual(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Verify admin session from a Next.js Request (API routes).
 * Reads tp_admin_sess cookie from the Cookie header.
 */
export async function requireAdminSession(
  req?: Request
): Promise<{ ok: boolean }> {
  const token = getAdminToken();
  if (!token) return { ok: false };

  // Try to read cookie from request header
  if (req) {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(
      new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE}=([^;]+)`)
    );
    const sessionVal = match?.[1] || "";
    return { ok: safeEqual(sessionVal, token) };
  }

  // Server component path (next/headers)
  try {
    const { cookies } = await import("next/headers");
    const jar = await cookies();
    const sessionVal = jar.get(ADMIN_COOKIE)?.value || "";
    return { ok: safeEqual(sessionVal, token) };
  } catch {
    return { ok: false };
  }
}
