import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE, getAdminToken, safeEqual } from "@/lib/adminAuth";

/**
 * GET /api/admin/magic?key=<ADMIN_MAGIC_KEY>
 *
 * Secret one-click login. Visiting this URL with the correct key
 * sets the admin session cookie and redirects to /admin/leads.
 *
 * Set ADMIN_MAGIC_KEY in .env (make it long and random, different from ADMIN_TOKEN).
 * Never share or expose this URL publicly.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key") ?? "";

  const magicKey = process.env.ADMIN_MAGIC_KEY ?? "";
  const token    = getAdminToken();

  // Reject if either secret is not configured or key doesn't match
  if (!magicKey || !token || !safeEqual(key, magicKey)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  // Valid — set session cookie and redirect
  const redirectTo = searchParams.get("next") || "/admin/leads";
  // Guard against open redirect: only allow relative paths starting with /admin
  const safePath = redirectTo.startsWith("/admin") ? redirectTo : "/admin/leads";

  const res = NextResponse.redirect(new URL(safePath, req.url));
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
