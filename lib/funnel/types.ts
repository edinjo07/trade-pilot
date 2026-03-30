export type AvoidanceType = "DELAY" | "CONTROL" | "RESP_AVOID" | "UNKNOWN";

export type FrameChoice = "LATE" | "SECOND_GUESS" | "SWITCH" | "DELAY";

export type DerivedPayload = {
  entryChoice?: string;
  mirrorCount?: number;
  frameChoice?: FrameChoice;
  pressureChoice?: "BUY" | "SELL" | "WAIT";
  pressureTimeMs?: number;
  simAction?: string;
  simTimeTakenMs?: number;
  quizQuestionsCount?: number;
  avoidanceType?: AvoidanceType;
  responsibilityScore?: number;
};

export type FunnelState =
  | "S1_ENTRY"
  | "S2_MIRROR"
  | "S3_FRAME"
  | "S4_SIM"
  | "S5_QUIZ"
  | "S6_RESULT"
  | "S7_GATE_LEAD"
  | "DONE";

export type FunnelSessionClient = {
  sessionId: string;
  startedAt: number;

  leadId: string | null;

  country: "CA";

  activeState: FunnelState;

  entryChoice?: "ADMIT" | "DENY";
  mirrorSelections: string[];
  frameChoice?: FrameChoice;

  simulation?: {
    userAction: "BUY" | "SELL" | "TIMEOUT";
    timeTakenMs: number;
  };

  quiz: {
    answers: Array<{ qid: string; aid: string; tMs: number }>;
    derived?: {
      avoidanceType: AvoidanceType;
      responsibilityScore: number;
      confidence: "LOW" | "MID" | "HIGH";
      scores: Record<AvoidanceType, number>;
    };
  };

  derived: DerivedPayload;

  leadSubmitted: boolean;
};
