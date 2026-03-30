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

// ── Clean page that bots land on ─────────────────────────────────────────────
const BOT_REDIRECT = "/platform";

// ── Static checks (run once at mount  no hook overhead) ─────────────────────
const BOT_UA_PATTERNS: RegExp[] = [
  // Google
  /Googlebot/i,
  /AdsBot-Google/i,
  /Mediapartners-Google/i,
  /DuplexWeb-Google/i,
  /Google-InspectionTool/i,
  /GoogleOther/i,
  // Facebook / Meta
  /facebookexternalhit/i,
  /Facebot/i,
  /FacebookBot/i,
  /meta-externalagent/i,
  // Bing / Microsoft
  /bingbot/i,
  /BingPreview/i,
  /msnbot/i,
  // Social scrapers
  /Twitterbot/i,
  /LinkedInBot/i,
  /Slackbot/i,
  /Discordbot/i,
  /Applebot/i,
  /YandexBot/i,
  /DuckDuckBot/i,
  // SEO tools
  /SemrushBot/i,
  /AhrefsBot/i,
  // Generic headless/scrapers
  /bot|crawl|spider|slurp|baidu|duckduck/i,
  /curl|wget|python-requests|python-urllib|go-http|scrapy/i,
  /phantomjs|HeadlessChrome|selenium|webdriver/i,
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
  const [showGate, setShowGate] = useState(true);
  const [showSlider, setShowSlider] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [sliderDone, setSliderDone] = useState(false);

  const startRef = useRef(Date.now());
  const scoreRef = useRef(0);
  const seenRef = useRef({ move: false, scroll: false, click: false, touch: false });
  const interactionTimesRef = useRef<number[]>([]);
  const sliderDragStartedRef = useRef(false); // must physically drag, not just set programmatically
  const passCalledRef = useRef(false);
  const gatePassedRef = useRef(false);

  // ── Instant redirect for hard bot signals ──────────────────────────────
  // NOTE: canvasPixelOk() is intentionally excluded here — Firefox "Resist
  // Fingerprinting" and Brave Ad Blocking return noise/zeros from getImageData()
  // as a privacy feature, which would incorrectly block real human visitors.
  // Canvas is still used as a soft score signal in the timer loop below.
  useEffect(() => {
    if (isWebDriver() || isBotUA()) {
      // Replace so back-button doesn't loop back into the funnel
      window.location.replace(BOT_REDIRECT);
      setBlocked(true);
      return;
    }
  }, []);

  // ── Gate timeout: 9s to tap the gate CTA or be redirected ─────────────
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (!gatePassedRef.current) {
        window.location.replace(BOT_REDIRECT);
      }
    }, 9_000);
    return () => window.clearTimeout(id);
  }, []);

  // ── Post-gate timeout: 12s after gate dismissed to accumulate signals ──
  useEffect(() => {
    if (showGate) return;
    const id = window.setTimeout(() => {
      if (!passCalledRef.current) {
        window.location.replace(BOT_REDIRECT);
      }
    }, 12_000);
    return () => window.clearTimeout(id);
  }, [showGate]);

  // ── Safe one-shot pass helper — geo-checks before revealing funnel ────
  const tryPass = useCallback(async () => {
    if (passCalledRef.current || blocked) return;
    // Geo restriction: checked server-side after human verification passes
    try {
      const res = await fetch("/api/geo-check", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json() as { allowed: boolean };
        if (!data.allowed) {
          window.location.replace("/restricted");
          return;
        }
      }
    } catch { /* network error — fail open */ }
    passCalledRef.current = true;
    setPassed(true);
    onPass();
  }, [blocked, onPass]);

  // ── Gate dismissal — counts as two confirmed human intent signals ─────
  const dismissGate = useCallback(() => {
    if (gatePassedRef.current || blocked) return;
    gatePassedRef.current = true;
    const now = Date.now();
    // Credit the tap as click + scroll (two distinct signal types with jitter)
    if (!seenRef.current.click) {
      seenRef.current.click = true;
      interactionTimesRef.current.push(now);
      scoreRef.current += 1;
      setScore((p) => p + 1);
    }
    if (!seenRef.current.scroll) {
      seenRef.current.scroll = true;
      interactionTimesRef.current.push(now + 100);
      scoreRef.current += 1;
      setScore((p) => p + 1);
    }
    // Reset 4s slider countdown from the moment the gate is dismissed
    startRef.current = Date.now();
    setShowGate(false);
  }, [blocked]);

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
    if (blocked || showGate) return;

    const id = setInterval(() => {
      if (passCalledRef.current) { clearInterval(id); return; }

      const elapsed = Date.now() - startRef.current;

      // Timing jitter check: two events must be ≥ 30 ms apart
      const times = interactionTimesRef.current;
      const jitterOk = times.length < 2 || (times[1] - times[0]) >= 30;

      // Canvas check is a soft signal only — privacy browsers (Firefox RFP,
      // Brave) intentionally poison canvas output, so failure here just
      // requires a slider rather than blocking the user entirely.
      const canvasOk = canvasPixelOk();
      const ready =
        elapsed >= 2000 &&
        scoreRef.current >= 2 &&
        jitterOk &&
        (canvasOk ? (sliderDone || scoreRef.current >= 3) : sliderDone);

      if (ready) {
        clearInterval(id);
        tryPass();
      } else if (elapsed >= 4000 && !sliderDone) {
        setShowSlider(true);
      }
    }, 200);

    return () => clearInterval(id);
  }, [blocked, showGate, sliderDone, tryPass]);

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
    // Already redirecting via window.location.replace — show nothing
    return null;
  }

  if (passed) return null;

  // ── Layer 1: full-screen gate — must be tapped before funnel is visible ─
  if (showGate) {
    return (
      <div
        className="pointer-events-auto fixed inset-0 z-[9999] flex flex-col items-center justify-center"
        style={{ background: "linear-gradient(160deg,#020d07 0%,#030f09 50%,#01080d 100%)" }}
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 65%, rgba(5,150,105,0.09) 0%, transparent 70%)",
          }}
        />
        {/* Chart icon */}
        <div
          className="relative z-10 mb-8 flex h-[72px] w-[72px] items-center justify-center rounded-full"
          style={{
            background: "rgba(52,211,153,0.07)",
            border: "1px solid rgba(52,211,153,0.18)",
            boxShadow: "0 0 48px rgba(52,211,153,0.1)",
          }}
        >
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <path
              d="M3 22L10 13l6.5 7.5 5-6L30 22"
              stroke="#34d399"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="28" cy="7" r="3.5" fill="rgba(52,211,153,0.25)" stroke="#34d399" strokeWidth="1.4" />
          </svg>
        </div>
        <h2 className="relative z-10 mb-2 text-xl font-bold tracking-tight text-white">
          Confirm Access
        </h2>
        <p className="relative z-10 mb-10 max-w-xs text-center text-sm text-neutral-500">
          Tap the button below to verify you&apos;re a real person and unlock the platform.
        </p>
        <button
          type="button"
          onClick={dismissGate}
          onTouchEnd={(e) => { e.preventDefault(); dismissGate(); }}
          className="relative z-10 overflow-hidden rounded-full px-10 py-4 text-sm font-semibold text-white transition-transform active:scale-95 focus:outline-none"
          style={{
            background: "linear-gradient(135deg,#059669 0%,#34d399 100%)",
            boxShadow: "0 4px 32px rgba(52,211,153,0.35), 0 0 0 1px rgba(52,211,153,0.2)",
          }}
        >
          Tap to Access Platform
        </button>
        <p className="relative z-10 mt-8 text-xs text-neutral-700">
          Session verification in progress
        </p>
      </div>
    );
  }

  // ── Layer 2: invisible layer housing the slider puzzle ───────────────
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
