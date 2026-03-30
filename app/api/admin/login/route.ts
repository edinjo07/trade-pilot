import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  getAdminToken,
} from "@/lib/adminAuth";

/** POST /api/admin/login - verify credentials and set session cookie */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const { email, password } = body;

    const expectedUser = (process.env.ADMIN_USER ?? "admin").toLowerCase();
    const expectedPass = process.env.ADMIN_PASS ?? "";
    const token = getAdminToken();

    if (
      !token ||
      !expectedPass ||
      !email ||
      !password ||
      email.trim().toLowerCase() !== expectedUser ||
      password !== expectedPass
    ) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_COOKIE_MAX_AGE,
      // secure: true  <- enable when behind HTTPS in production
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
}
