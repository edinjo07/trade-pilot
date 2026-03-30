import { AvoidanceType } from "./types";

export type AnswerOption = {
  id: string;
  label: string;
  weights: Partial<Record<AvoidanceType, number>>;
  respDelta: number;
};

export type Question = {
  id: string;
  pool: "avoidance" | "control" | "responsibility";
  prompt: string;
  answers: AnswerOption[];
};

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    pool: "avoidance",
    prompt: "When a decision has uncertain outcomes, you tend to…",
    answers: [
      { id: "a", label: "Wait until it feels safer", weights: { DELAY: 2 }, respDelta: -1 },
      { id: "b", label: "Move quickly before doubt grows", weights: { CONTROL: 1 }, respDelta: 0 },
      { id: "c", label: "Avoid choosing unless you can justify it perfectly", weights: { RESP_AVOID: 2 }, respDelta: -2 },
    ],
  },
  {
    id: "q4",
    pool: "avoidance",
    prompt: "Which sentence describes you more accurately?",
    answers: [
      { id: "a", label: "I postpone decisions to avoid regret.", weights: { DELAY: 2 }, respDelta: -1 },
      { id: "b", label: "I decide fast, then adjust.", weights: { CONTROL: 1 }, respDelta: 1 },
      { id: "c", label: "I avoid deciding unless I can be confident.", weights: { RESP_AVOID: 2 }, respDelta: -2 },
    ],
  },
  {
    id: "q7",
    pool: "avoidance",
    prompt: "When you think about starting something new, the strongest feeling is…",
    answers: [
      { id: "a", label: "“Not yet.”", weights: { DELAY: 2 }, respDelta: -1 },
      { id: "b", label: "“Let me structure it first.”", weights: { CONTROL: 2 }, respDelta: 0 },
      { id: "c", label: "“What if I’m wrong?”", weights: { RESP_AVOID: 2 }, respDelta: -2 },
    ],
  },
  {
    id: "q10",
    pool: "avoidance",
    prompt: "If you don’t act, what do you usually tell yourself?",
    answers: [
      { id: "a", label: "“I’ll do it when the timing is right.”", weights: { DELAY: 2 }, respDelta: -1 },
      { id: "b", label: "“I need a better plan before I move.”", weights: { CONTROL: 2 }, respDelta: 0 },
      { id: "c", label: "“It’s smarter not to risk being wrong.”", weights: { RESP_AVOID: 2 }, respDelta: -2 },
    ],
  },
  {
    id: "q3",
    pool: "control",
    prompt: "When something feels uncontrollable, you prefer to…",
    answers: [
      { id: "a", label: "Create rules and structure immediately", weights: { CONTROL: 2 }, respDelta: 1 },
      { id: "b", label: "Wait until clarity appears", weights: { DELAY: 2 }, respDelta: -1 },
      { id: "c", label: "Avoid decisions you can’t fully own", weights: { RESP_AVOID: 2 }, respDelta: -2 },
    ],
  },
  {
    id: "q6",
    pool: "control",
    prompt: "Under pressure, your brain naturally tries to…",
    answers: [
      { id: "a", label: "Control the variables and reduce randomness", weights: { CONTROL: 2 }, respDelta: 1 },
      { id: "b", label: "Delay until you feel calmer", weights: { DELAY: 2 }, respDelta: -1 },
      { id: "c", label: "Step away so you can’t be blamed", weights: { RESP_AVOID: 2 }, respDelta: -2 },
    ],
  },
  {
    id: "q9",
    pool: "control",
    prompt: "Which approach do you trust more?",
    answers: [
      { id: "a", label: "A system that reduces guesswork", weights: { CONTROL: 2 }, respDelta: 1 },
      { id: "b", label: "Waiting until the “right moment”", weights: { DELAY: 2 }, respDelta: -1 },
      { id: "c", label: "Only acting when I’m nearly sure", weights: { RESP_AVOID: 2 }, respDelta: -2 },
    ],
  },
  {
    id: "q12",
    pool: "control",
    prompt: "When you hear “act without certainty,” your first reaction is…",
    answers: [
      { id: "a", label: "“Then I need rules.”", weights: { CONTROL: 2 }, respDelta: 1 },
      { id: "b", label: "“Then I’ll wait.”", weights: { DELAY: 2 }, respDelta: -1 },
      { id: "c", label: "“Then I’d rather not act.”", weights: { RESP_AVOID: 2 }, respDelta: -2 },
    ],
  },
  {
    id: "q2",
    pool: "responsibility",
    prompt: "Which discomfort is stronger?",
    answers: [
      { id: "a", label: "Taking action and being wrong", weights: { RESP_AVOID: 2 }, respDelta: -2 },
      { id: "b", label: "Not acting and wondering forever", weights: { DELAY: 2 }, respDelta: -1 },
      { id: "c", label: "Owning the outcome either way", weights: { CONTROL: 1 }, respDelta: 2 },
    ],
  },
  {
    id: "q5",
    pool: "responsibility",
    prompt: "If the outcome is unpredictable, what matters more to you?",
    answers: [
      { id: "a", label: "Not being wrong", weights: { RESP_AVOID: 2 }, respDelta: -2 },
      { id: "b", label: "Not feeling rushed", weights: { DELAY: 2 }, respDelta: -1 },
      { id: "c", label: "Being responsible for my choice", weights: { CONTROL: 1, RESP_AVOID: 1 }, respDelta: 1 },
    ],
  },
  {
    id: "q8",
    pool: "responsibility",
    prompt: "When you imagine committing, what do you fear more?",
    answers: [
      { id: "a", label: "Being accountable if it goes badly", weights: { RESP_AVOID: 2 }, respDelta: -2 },
      { id: "b", label: "Missing the “perfect time”", weights: { DELAY: 2 }, respDelta: -1 },
      { id: "c", label: "Not having a clear structure", weights: { CONTROL: 2 }, respDelta: 0 },
    ],
  },
  {
    id: "q11",
    pool: "responsibility",
    prompt: "Which statement would make you more uncomfortable?",
    answers: [
      { id: "a", label: "“You avoided deciding again.”", weights: { DELAY: 2 }, respDelta: -1 },
      { id: "b", label: "“You tried to control what can’t be controlled.”", weights: { CONTROL: 2 }, respDelta: 0 },
      { id: "c", label: "“You didn’t want to own the outcome.”", weights: { RESP_AVOID: 2 }, respDelta: -2 },
    ],
  },
];
