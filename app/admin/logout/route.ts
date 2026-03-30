import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const res = NextResponse.redirect(new URL("/admin/login", origin));
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
