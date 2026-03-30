import type { FunnelSessionClient, DerivedPayload, FunnelState } from "./types";
import { deriveProfile } from "./quizEngine";

export type Action =
  | { type: "SET_ACTIVE"; activeState: FunnelState }
  | { type: "PATCH_DERIVED"; patch: Partial<DerivedPayload> }
  | { type: "S1_CHOOSE"; choice: "ADMIT" | "DENY" }
  | { type: "S2_TOGGLE"; id: string }
  | { type: "S2_CONTINUE" }
  | { type: "S3_CHOOSE"; choice: "LATE" | "SECOND_GUESS" | "SWITCH" | "DELAY" }
  | { type: "S3_CONTINUE" }
  | { type: "S4_RESOLVE"; action: "BUY" | "SELL" | "TIMEOUT"; timeTakenMs: number }
  | { type: "S5_ANSWER"; answer: { qid: string; aid: string; tMs: number } }
  | { type: "S5_FINISH" }
  | { type: "S6_CONTINUE" }
  | { type: "LEAD_SET_ID"; leadId: string }
  | { type: "LEAD_SUBMITTED" }
  | { type: "RESET"; fresh: FunnelSessionClient };

export function reducer(state: FunnelSessionClient, action: Action): FunnelSessionClient {
  switch (action.type) {
    case "SET_ACTIVE":
      return { ...state, activeState: action.activeState };

    case "PATCH_DERIVED":
      return { ...state, derived: { ...state.derived, ...action.patch } };

    case "S1_CHOOSE":
      return {
        ...state,
        entryChoice: action.choice,
        derived: { ...state.derived, entryChoice: action.choice },
        activeState: "S2_MIRROR",
      };

    case "S2_TOGGLE": {
      const exists = state.mirrorSelections.includes(action.id);
      if (exists) {
        return {
          ...state,
          mirrorSelections: state.mirrorSelections.filter((x) => x !== action.id),
        };
      }

      if (state.mirrorSelections.length >= 2) return state;

      return {
        ...state,
        mirrorSelections: [...state.mirrorSelections, action.id],
      };
    }

    case "S2_CONTINUE":
      return {
        ...state,
        derived: {
          ...state.derived,
          mirrorCount: state.mirrorSelections.length,
        },
        activeState: "S3_FRAME",
      };

    case "S3_CHOOSE":
      return {
        ...state,
        frameChoice: action.choice,
        derived: { ...state.derived, frameChoice: action.choice },
      };

    case "S3_CONTINUE":
      return { ...state, activeState: "S4_SIM" };

    case "S4_RESOLVE":
      return {
        ...state,
        simulation: { userAction: action.action, timeTakenMs: action.timeTakenMs },
        derived: {
          ...state.derived,
          simAction: action.action,
          simTimeTakenMs: action.timeTakenMs,
        },
        activeState: "S5_QUIZ",
      };

    case "S5_ANSWER":
      return {
        ...state,
        quiz: {
          ...state.quiz,
          answers: [...state.quiz.answers, action.answer],
        },
      };

    case "S5_FINISH": {
      const profile = deriveProfile(state);
      return {
        ...state,
        quiz: {
          ...state.quiz,
          derived: {
            avoidanceType: profile.avoidanceType,
            responsibilityScore: profile.responsibilityScore,
            confidence: profile.confidence,
            scores: profile.scores,
          },
        },
        derived: {
          ...state.derived,
          avoidanceType: profile.avoidanceType,
          responsibilityScore: profile.responsibilityScore,
          quizQuestionsCount: state.quiz.answers.length,
        },
        activeState: "S6_RESULT",
      };
    }

    case "S6_CONTINUE":
      return { ...state, activeState: "S7_GATE_LEAD" };

    case "LEAD_SET_ID":
      return { ...state, leadId: action.leadId };

    case "LEAD_SUBMITTED":
      return { ...state, leadSubmitted: true, activeState: "DONE" };

    case "RESET":
      return action.fresh;

    default:
      return state;
  }
}
