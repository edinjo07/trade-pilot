"use client";

/**
 * ExitIntentModal  fires when the cursor moves toward the top browser chrome
 * (classic exit-intent on desktop) OR when the page loses visibility on mobile.
 * Shows one time per session. Re-engages visitor with a strong loss-aversion hook.
 */

import { useEffect, useState, useRef } from "react";

interface Props {
  onStay: () => void;
  onLeave: () => void;
}

export default function ExitIntentModal({ onStay, onLeave }: Props) {
  const [open, setOpen] = useState(false);
  const firedRef = useRef(false);
  const [lostAmount, setLostAmount] = useState(0);
  const [softEmail, setSoftEmail] = useState("");
  const [softEmailSent, setSoftEmailSent] = useState(false);

  async function handleSoftEmailSend() {
    if (!softEmail.includes("@")) return;
    setSoftEmailSent(true);
    // Best-effort soft lead capture - failure is silent
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: softEmail.trim().toLowerCase(), softCapture: true }),
      });
    } catch { /* non-fatal */ }
  }

  // Running "lost money" counter
  useEffect(() => {
    if (!open) return;
    const base = Math.floor(Math.random() * 800) + 400;
    setLostAmount(base);
    const id = setInterval(() => {
      setLostAmount((p) => p + Math.floor(Math.random() * 12) + 3);
    }, 1200);
    return () => clearInterval(id);
  }, [open]);

  function fire() {
    if (firedRef.current) return;
    firedRef.current = true;
    setOpen(true);
  }

  // Desktop: cursor reaches top 5 % of viewport
  useEffect(() => {
    const onMouseout = (e: MouseEvent) => {
      if (e.clientY < window.innerHeight * 0.05 && e.relatedTarget === null) {
        fire();
      }
    };
    document.addEventListener("mouseout", onMouseout);
    return () => document.removeEventListener("mouseout", onMouseout);
  }, []);

  // Mobile: page hidden (tab switch / home button)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "hidden") fire();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div
        className="relative w-full max-w-md rounded-2xl p-7 shadow-2xl"
        style={{
          background: "linear-gradient(175deg,rgba(14,4,4,0.98) 0%,rgba(8,2,2,0.99) 100%)",
          border: "1px solid rgba(239,68,68,0.4)",
          boxShadow: "0 0 60px rgba(239,68,68,0.12), 0 40px 80px rgba(0,0,0,0.8)",
        }}
      >
        {/* Pulsing red dot */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-red-600 px-4 py-1 text-xs font-bold text-white uppercase tracking-widest">
          <span className="inline-block h-2 w-2 animate-ping rounded-full bg-white" />
          Warning
        </div>

        <h2 className="mt-3 text-center text-2xl font-extrabold text-white leading-tight">
          Hold on  you were{" "}
          <span className="text-red-400">so close</span>
        </h2>

        <p className="mt-3 text-center text-sm text-neutral-400">
          In the time since you opened this page, people on the same platform made:
        </p>

        <div
          className="mt-3 text-center text-4xl font-black tabular-nums"
          style={{ color: "#34d399", textShadow: "0 0 24px rgba(52,211,153,0.5)" }}
        >
          ${lostAmount.toLocaleString()}
        </div>

        <p className="mt-1 text-center text-xs text-neutral-500">
          That number is still climbing right now.
        </p>

        <p className="mt-4 text-center text-sm text-neutral-300">
          You don&apos;t have to commit to anything. Just finish the last step  it takes under 60 seconds and you can always decide later.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => { setOpen(false); onStay(); }}
            className="btn-emerald-gradient w-full rounded-xl py-3.5 text-sm font-bold text-white transition"
          >
            OK, I&apos;ll finish the last step &rarr;
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-neutral-800" />
            <span className="text-xs text-neutral-600">or</span>
            <div className="h-px flex-1 bg-neutral-800" />
          </div>

          {/* Soft email capture - downgrade offer */}
          {!softEmailSent ? (
            <div className="space-y-2">
              <p className="text-xs text-neutral-400 text-center">
                Not ready? Drop your email and we&apos;ll send you the free guide.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={softEmail}
                  onChange={(e) => setSoftEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSoftEmailSend(); }}
                  placeholder="your@email.com"
                  className="flex-1 rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/70"
                />
                <button
                  onClick={handleSoftEmailSend}
                  disabled={!softEmail.includes("@")}
                  className="rounded-xl border border-amber-500/40 bg-amber-500/15 px-4 py-2.5 text-xs font-bold text-amber-400 shrink-0 disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-center text-emerald-400 py-1">✓ Got it! Check your inbox shortly.</p>
          )}

          <button
            onClick={() => { setOpen(false); onLeave(); }}
            className="text-center text-xs text-neutral-600 hover:text-neutral-400 underline"
          >
            No thanks, I&apos;m not interested
          </button>
        </div>
      </div>
    </div>
  );
}
