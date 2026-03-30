import { FunnelState } from "./types";

export const stepOrder: FunnelState[] = [
  "S1_ENTRY",
  "S2_MIRROR",
  "S3_FRAME",
  "S4_SIM",
  "S5_QUIZ",
  "S6_RESULT",
  "S7_GATE_LEAD",
  "DONE",
];

export const getNextStep = (current: FunnelState): FunnelState => {
  const index = stepOrder.indexOf(current);
  if (index === -1 || index === stepOrder.length - 1) {
    return current;
  }
  return stepOrder[index + 1];
};

export const getPrevStep = (current: FunnelState): FunnelState => {
  const index = stepOrder.indexOf(current);
  if (index <= 0) {
    return current;
  }
  return stepOrder[index - 1];
};
