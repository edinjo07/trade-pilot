import { FunnelSessionClient, AvoidanceType } from "./types";
import { QUESTIONS, Question } from "./quizBank";

type Scores = Record<AvoidanceType, number>;

const emptyScores = (): Scores => ({
  DELAY: 0,
  CONTROL: 0,
  RESP_AVOID: 0,
  UNKNOWN: 0,
});

const applyPriors = (session: FunnelSessionClient, scores: Scores) => {
  if (session.simulation?.userAction === "TIMEOUT") scores.DELAY += 2;
  if (session.frameChoice === "SECOND_GUESS") scores.RESP_AVOID += 1;
  if (session.frameChoice === "SWITCH") scores.CONTROL += 1;
  if (session.frameChoice === "LATE" || session.frameChoice === "DELAY") scores.DELAY += 1;
  if (
    session.entryChoice === "DENY" &&
    (session.simulation?.timeTakenMs ?? 99999) < 2500
  ) {
    scores.CONTROL += 1;
  }
};

export const computeScores = (session: FunnelSessionClient) => {
  const scores = emptyScores();
  applyPriors(session, scores);

  let resp = 0;
  for (const ans of session.quiz.answers) {
    const q = QUESTIONS.find((item) => item.id === ans.qid);
    const opt = q?.answers.find((item) => item.id === ans.aid);
    if (!opt) continue;
    resp += opt.respDelta;
    for (const k of Object.keys(opt.weights) as AvoidanceType[]) {
      scores[k] += opt.weights[k] ?? 0;
    }
  }

  return { scores, resp };
};

const topType = (scores: Scores) => {
  const entries = Object.entries(scores) as Array<[AvoidanceType, number]>;
  entries.sort((a, b) => b[1] - a[1]);
  const top = entries.find((e) => e[0] !== "UNKNOWN") || entries[0];
  return { t: top[0], v: top[1] };
};

export const shouldFinishQuiz = (session: FunnelSessionClient): boolean => {
  const answered = session.quiz.answers.length;
  const { scores } = computeScores(session);
  const top = topType(scores);
  if (answered >= 8 && top.v >= 7) return true;
  if (answered >= 12) return true;
  return false;
};

export const nextQuestion = (session: FunnelSessionClient): Question => {
  const answeredIds = new Set(session.quiz.answers.map((item) => item.qid));
  const { scores } = computeScores(session);
  const top = topType(scores);

  const preferredPool =
    top.t === "DELAY"
      ? "avoidance"
      : top.t === "CONTROL"
        ? "control"
        : "responsibility";

  const candidates = QUESTIONS.filter((question) => !answeredIds.has(question.id));
  const preferred = candidates.filter((question) => question.pool === preferredPool);
  if (preferred.length) return preferred[0];

  const fallbackOrder: Question["pool"][] = [
    "responsibility",
    "avoidance",
    "control",
  ];
  for (const pool of fallbackOrder) {
    const qs = candidates.filter((question) => question.pool === pool);
    if (qs.length) return qs[0];
  }

  return QUESTIONS[0];
};

export const deriveProfile = (session: FunnelSessionClient) => {
  const { scores, resp } = computeScores(session);
  const top = topType(scores);
  const confidence: "LOW" | "MID" | "HIGH" =
    top.v >= 7 ? "HIGH" : top.v >= 5 ? "MID" : "LOW";
  return {
    avoidanceType: top.t,
    responsibilityScore: resp,
    confidence,
    scores,
  };
};
