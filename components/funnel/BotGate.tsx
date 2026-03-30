"use client";

/**
 * BotGate  invisible human-verification layer.
 *
 * Detection layers:
 * 1. navigator.webdriver flag (Puppeteer / Selenium / Playwright)
 * 2. User-agent bot-signature check (curl, python-requests, scrapy, etc.)
 * 3. Canvas pixel-rendering test (headless / no-GPU fails)
 * 4. Minimum 2 s on page (instant-scan bots fail)
 * 5. Behavioural signals: distinct interaction types (mousemove, scroll,
 *    click, touchstart)  score ≥ 2 required
 * 6. Interaction timing jitter: first two events must differ by ≥ 30 ms
 *    (machine-generated events are spaced at exactly 0 or 1 ms)
 * 7. Slider drag puzzle surface (shown if score is low after 4 s)
 *     must be physically dragged (pointerdown then pointermove detected)
 * 8. Server-side honeypot field (filled only by auto-form-fillers → rejected)
 */

import { useEffect, useRef, useState, useCallback } from "react";

interface Props {
  onPass: () => void;
}

// ── Static checks (run once at mount  no hook overhead) ─────────────────────
const BOT_UA_PATTERNS = [
  /bot|crawl|spider|slurp|baidu|yandex|duckduck|bingpreview/i,
  /curl|wget|python-requests|python-urllib|go-http|scrapy|httpx|axios\/0\./i,
  /phantomjs|headlesschrome|selenium|webdriver/i,
];

function isBotUA(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return BOT_UA_PATTERNS.some((r) => r.test(ua));
}

function isWebDriver(): boolean {
  // navigator.webdriver is explicitly set to true by Puppeteer, Playwright, Selenium
  try {
    return !!(navigator as unknown as Record<string, unknown>).webdriver;
  } catch {
    return false;
  }
}

function canvasPixelOk(): boolean {
  // Draw a coloured rectangle and verify actual pixel data comes back.
  // Headless Chrome without a GPU often returns all-zero RGBA arrays.
  try {
    const c = document.createElement("canvas");
    c.width = 8;
    c.height = 8;
    const ctx = c.getContext("2d");
    if (!ctx) return false;
    ctx.fillStyle = "#3ef";
    ctx.fillRect(0, 0, 8, 8);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    // Expect non-zero R, G, B channels
    return d[0] !== 0 || d[1] !== 0 || d[2] !== 0;
  } catch {
    return false;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BotGate({ onPass }: Props) {
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [showSlider, setShowSlider] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [sliderDone, setSliderDone] = useState(false);

  const startRef = useRef(Date.now());
  const scoreRef = useRef(0);
  const seenRef = useRef({ move: false, scroll: false, click: false, touch: false });
  const interactionTimesRef = useRef<number[]>([]);
  const sliderDragStartedRef = useRef(false); // must physically drag, not just set programmatically
  const passCalledRef = useRef(false);

  // ── Instant block for hard bot signals ───────────────────────────────
  useEffect(() => {
    if (isWebDriver() || isBotUA()) {
      setBlocked(true);
      return;
    }
    if (!canvasPixelOk()) {
      // Canvas fails: show slider as extra hurdle (don't hard-block  some
      // legitimate sandboxes disabled GPU; slider drag confirms humanity)
    }
  }, []);

  // ── Safe one-shot pass helper ─────────────────────────────────────────
  const tryPass = useCallback(() => {
    if (passCalledRef.current || blocked) return;
    passCalledRef.current = true;
    setPassed(true);
    onPass();
  }, [blocked, onPass]);

  // ── Behavioural signal listeners ──────────────────────────────────────
  const bump = useCallback((type: "move" | "scroll" | "click" | "touch") => {
    if (seenRef.current[type]) return;
    seenRef.current[type] = true;
    interactionTimesRef.current.push(Date.now());
    scoreRef.current += 1;
    setScore((p) => p + 1);
  }, []);

  useEffect(() => {
    const onMove  = () => bump("move");
    const onScroll = () => bump("scroll");
    const onClick = () => bump("click");
    const onTouch = () => bump("touch");

    window.addEventListener("mousemove",  onMove,   { passive: true });
    window.addEventListener("scroll",     onScroll, { passive: true });
    window.addEventListener("click",      onClick,  { passive: true });
    window.addEventListener("touchstart", onTouch,  { passive: true });

    return () => {
      window.removeEventListener("mousemove",  onMove);
      window.removeEventListener("scroll",     onScroll);
      window.removeEventListener("click",      onClick);
      window.removeEventListener("touchstart", onTouch);
    };
  }, [bump]);

  // ── Timer-based pass / show-slider logic ─────────────────────────────
  useEffect(() => {
    if (blocked) return;

    const id = setInterval(() => {
      if (passCalledRef.current) { clearInterval(id); return; }

      const elapsed = Date.now() - startRef.current;

      // Timing jitter check: two events must be ≥ 30 ms apart
      const times = interactionTimesRef.current;
      const jitterOk = times.length < 2 || (times[1] - times[0]) >= 30;

      const canvasOk = canvasPixelOk();
      const ready =
        elapsed >= 2000 &&
        scoreRef.current >= 2 &&
        canvasOk &&
        jitterOk &&
        (sliderDone || scoreRef.current >= 3);

      if (ready) {
        clearInterval(id);
        tryPass();
      } else if (elapsed >= 4000 && !sliderDone) {
        setShowSlider(true);
      }
    }, 200);

    return () => clearInterval(id);
  }, [blocked, sliderDone, tryPass]);

  // ── Slider done → pass (uses real clock, not stale state) ────────────
  useEffect(() => {
    if (!sliderDone || blocked) return;
    const elapsed = Date.now() - startRef.current;
    if (elapsed >= 2000) {
      tryPass();
    } else {
      // Slider completed before 2 s minimum  wait for window
      const remaining = 2000 - elapsed;
      const t = window.setTimeout(() => tryPass(), remaining + 50);
      return () => window.clearTimeout(t);
    }
  }, [sliderDone, blocked, tryPass]);

  if (blocked) {
    // Hard-blocked bots see a blank non-interactive page
    return <div className="fixed inset-0 z-[9999] bg-neutral-950" aria-hidden="true" />;
  }

  if (passed) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9999]">
      {showSlider && !sliderDone && (
        <div
          className="pointer-events-auto absolute bottom-6 left-1/2 -translate-x-1/2 w-80 rounded-2xl p-5 shadow-2xl"
          style={{
            background: "linear-gradient(145deg,rgba(8,18,12,0.97) 0%,rgba(5,12,8,0.99) 100%)",
            border: "1px solid rgba(52,211,153,0.25)",
            boxShadow: "0 8px 48px rgba(0,0,0,0.8), 0 0 30px rgba(52,211,153,0.06)",
            backdropFilter: "blur(16px)",
          }}
          role="alert"
          aria-label="Human verification"
        >
          <p className="mb-1 text-center text-sm font-semibold text-neutral-200">
            Quick check  slide to continue
          </p>
          <p className="mb-4 text-center text-xs text-neutral-500">
            Drag all the way to the right
          </p>

          <div className="relative h-12 rounded-full" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {/* Track fill */}
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-75"
              style={{
                width: `${sliderValue}%`,
                background: "linear-gradient(90deg,rgba(5,150,105,0.4),rgba(52,211,153,0.5))",
              }}
            />

            {/* Hidden range input for accessibility + fallback */}
            <input
              type="range"
              min={0}
              max={100}
              value={sliderValue}
              onPointerDown={() => { sliderDragStartedRef.current = true; }}
              onChange={(e) => {
                // Reject programmatic changes that didn't start with a real pointerdown
                if (!sliderDragStartedRef.current) return;
                const v = Number(e.target.value);
                setSliderValue(v);
                if (v >= 95) setSliderDone(true);
              }}
              className="absolute inset-0 h-full w-full cursor-grab appearance-none bg-transparent opacity-0"
              aria-label="Slide to verify"
            />

            {/* Visual thumb */}
            <div
              className="pointer-events-none absolute top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all duration-75"
              style={{
                left: `calc(${sliderValue}% - 20px)`,
                background: "linear-gradient(135deg,#059669,#34d399)",
                boxShadow: "0 0 16px rgba(52,211,153,0.5)",
              }}
            >
              {/* Right-pointing chevrons */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 8l3.5-3.5L11 8l-3.5 3.5L4 8z" fill="none" />
                <path d="M5 8l2.5-2.5L10 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 8l2.5 2.5L10 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
              </svg>
            </div>

            {/* End target zone indicator */}
            <div
              className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(52,211,153,0.1)",
                border: "1px dashed rgba(52,211,153,0.3)",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 6l2.5-2.5L8 6l-2.5 2.5L3 6z" fill="none" />
                <path d="M2 6h8M8 6l-2-2M8 6l-2 2" stroke="rgba(52,211,153,0.6)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {sliderDone && (
            <p className="mt-3 text-center text-sm font-semibold text-emerald-400">
              ✓ Verified  loading…
            </p>
          )}
        </div>
      )}
    </div>
  );
}
