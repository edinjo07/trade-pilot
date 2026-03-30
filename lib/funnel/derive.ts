import type { AvoidanceType } from "./types";

export function guessAvoidanceFromMiniAnswers(x: { a?: string; b?: string }): AvoidanceType {
  if (x.a === "control") return "CONTROL";
  if (x.a === "delay") return "DELAY";
  if (x.a === "avoid") return "RESP_AVOID";
  return "UNKNOWN";
}
