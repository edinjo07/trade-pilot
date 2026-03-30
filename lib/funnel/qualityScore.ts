type Derived = {
  mirrorCount?: number | null;
  simTimeTakenMs?: number | null;
  quizQuestionsCount?: number | null;
  avoidanceType?: string | null;
  responsibilityScore?: number | null;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function tier(score: number) {
  if (score >= 80) return "hot";
  if (score >= 60) return "warm";
  if (score >= 40) return "cold";
  return "trash";
}

export function computeQualityScore(d: Derived) {
  let score = 50;
  const meta: Record<string, any> = { base: 50, adds: {}, subs: {} };

  const m = Math.max(0, Number(d.mirrorCount ?? 0));
  let mirrorPts = 0;
  if (m === 0) mirrorPts = -10;
  else if (m === 1) mirrorPts = 0;
  else if (m === 2) mirrorPts = 6;
  else if (m === 3) mirrorPts = 10;
  else mirrorPts = 12;
  score += mirrorPts;
  (mirrorPts >= 0 ? meta.adds : meta.subs).mirror = mirrorPts;

  const tMs = Number(d.simTimeTakenMs ?? NaN);
  let speedPts = 0;
  if (Number.isFinite(tMs)) {
    const s = tMs / 1000;
    if (s < 3) speedPts = -6;
    else if (s < 8) speedPts = 8;
    else if (s < 20) speedPts = 6;
    else if (s < 60) speedPts = 2;
    else speedPts = -6;
    score += speedPts;
    (speedPts >= 0 ? meta.adds : meta.subs).speed = speedPts;
    meta.simSeconds = Math.round(s);
  }

  const r = Number(d.responsibilityScore ?? NaN);
  if (Number.isFinite(r)) {
    const rPts = r <= 10 ? (r / 10) * 20 : (r / 100) * 20;
    const rPtsRounded = Math.round(clamp(rPts, 0, 20));
    score += rPtsRounded;
    meta.adds.responsibility = rPtsRounded;
    meta.responsibilityRaw = r;
  }

  const a = (d.avoidanceType ?? "").toUpperCase();
  let avoidPts = 0;
  if (a === "CONTROL") avoidPts = 8;
  else if (a === "DELAY") avoidPts = 2;
  else if (a === "RESP_AVOID") avoidPts = -8;
  score += avoidPts;
  (avoidPts >= 0 ? meta.adds : meta.subs).avoidance = avoidPts;
  meta.avoidanceType = a || "unknown";

  const q = Number(d.quizQuestionsCount ?? 0);
  let quizPts = 0;
  if (q >= 10) quizPts = 6;
  else if (q >= 6) quizPts = 3;
  else quizPts = -5;
  score += quizPts;
  (quizPts >= 0 ? meta.adds : meta.subs).quiz = quizPts;
  meta.quizQuestionsCount = q;

  const final = clamp(Math.round(score), 0, 100);

  return {
    score: final,
    tier: tier(final),
    meta,
  };
}
