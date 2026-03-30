"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin/leads";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res.ok) {
        router.replace(next);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Invalid email or password.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#07090f" }}
    >
      {/* Card */}
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{
          background: "rgba(13,18,32,0.9)",
          border: "1px solid rgba(240,165,0,0.14)",
          boxShadow: "0 0 60px rgba(240,165,0,0.04), 0 24px 48px rgba(0,0,0,0.5)",
        }}
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/tradepilot-logo.svg" alt="TradePilot" className="h-9 w-auto" />
          <div
            className="mt-1 rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-widest"
            style={{ background: "rgba(240,165,0,0.1)", color: "#f0a500", border: "1px solid rgba(240,165,0,0.2)" }}
          >
            Admin Portal
          </div>
        </div>

        <h1 className="mb-1 text-center text-xl font-bold text-white">Sign in to your account</h1>
        <p className="mb-7 text-center text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          Restricted access - authorised personnel only
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          {/* Email */}
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
              Email address
            </label>
            <input
              type="email"
              name="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@tradepilot.com"
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all"
              style={{
                background: "rgba(7,9,15,0.8)",
                border: "1px solid rgba(240,165,0,0.2)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(240,165,0,0.55)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(240,165,0,0.2)")}
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all"
              style={{
                background: "rgba(7,9,15,0.8)",
                border: "1px solid rgba(240,165,0,0.2)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(240,165,0,0.55)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(240,165,0,0.2)")}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#fca5a5",
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl py-3 text-sm font-bold text-black transition-opacity disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#f0a500,#d4840a)" }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          TradePilot Admin &mdash; All access is logged and monitored.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

