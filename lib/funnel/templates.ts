import type { FunnelSessionClient, AvoidanceType } from "./types";

export type PatternId = "pattern_delay" | "pattern_control" | "pattern_resp_avoid";

export function pickPatternId(s: FunnelSessionClient): PatternId {
  const t: AvoidanceType = s.quiz.derived?.avoidanceType ?? "DELAY";

  if (s.simulation?.userAction === "TIMEOUT") {
    return "pattern_delay";
  }

  if (
    (s.frameChoice === "SECOND_GUESS" || s.frameChoice === "SWITCH") &&
    (s.quiz.derived?.responsibilityScore ?? 0) <= -2
  ) {
    return "pattern_resp_avoid";
  }

  if (t === "DELAY") return "pattern_delay";
  if (t === "CONTROL") return "pattern_control";
  return "pattern_resp_avoid";
}

export type TemplateBlock =
  | { kind: "headline"; text: string }
  | { kind: "sub"; text: string }
  | { kind: "list"; title?: string; items: string[] }
  | { kind: "divider" }
  | { kind: "question"; text: string }
  | { kind: "cta_hint"; text: string };

export type PatternTemplate = {
  id: PatternId;
  title: string;
  blocks: TemplateBlock[];
};

export function getTemplate(patternId: PatternId): PatternTemplate {
  return TEMPLATES[patternId];
}

const TEMPLATES: Record<PatternId, PatternTemplate> = {
  pattern_delay: {
    id: "pattern_delay",
    title: "Delay Pattern",
    blocks: [
      { kind: "headline", text: "You don’t reject action  you postpone it until it feels “safe.”" },
      {
        kind: "sub",
        text: "That usually looks responsible on the surface. But it often hides a simple mechanism: you reduce discomfort by delaying the decision itself.",
      },
      {
        kind: "list",
        title: "What it looks like",
        items: [
          "You wait for “more clarity” before you move.",
          "You feel calmer when you’re not choosing.",
          "You can explain the delay convincingly  even to yourself.",
        ],
      },
      {
        kind: "list",
        title: "Why it persists",
        items: [
          "Delay gives immediate relief.",
          "It keeps outcomes hypothetical (no consequences yet).",
          "It protects you from being wrong  without admitting that’s the goal.",
        ],
      },
      { kind: "divider" },
      {
        kind: "list",
        title: "The real cost",
        items: [
          "Time decides for you.",
          "You keep repeating “not yet” and call it patience.",
          "The longer you wait, the heavier the first step feels.",
        ],
      },
      {
        kind: "list",
        title: "The pivot (one behavior)",
        items: [
          "You don’t need certainty. You need a small, controlled first action you can own.",
        ],
      },
      {
        kind: "question",
        text: "If nothing changes in the next 30 days, what exactly will be different  besides you being 30 days older?",
      },
      {
        kind: "cta_hint",
        text: "If this applies to you, the next step is not motivation. It’s a decision framework.",
      },
    ],
  },

  pattern_control: {
    id: "pattern_control",
    title: "Control Pattern",
    blocks: [
      { kind: "headline", text: "You don’t hesitate because you’re lazy  you hesitate because you want control first." },
      {
        kind: "sub",
        text: "Control feels like competence. But it can become a trap when you treat uncertainty as a problem that must be solved before you act.",
      },
      {
        kind: "list",
        title: "What it looks like",
        items: [
          "You build systems, rules, and structure before you start.",
          "You keep refining the plan  and call it preparation.",
          "You prefer decisions where you can explain every variable.",
        ],
      },
      {
        kind: "list",
        title: "Why it persists",
        items: [
          "Structure reduces anxiety.",
          "Planning creates the feeling of progress (even without action).",
          "Control protects identity: “I’m careful, not impulsive.”",
        ],
      },
      { kind: "divider" },
      {
        kind: "list",
        title: "The real cost",
        items: [
          "You confuse preparation with movement.",
          "You keep optimizing the entry instead of entering.",
          "You only start when it feels guaranteed  which is rarely.",
        ],
      },
      {
        kind: "list",
        title: "The pivot (one behavior)",
        items: [
          "You keep structure  but you move the structure to AFTER the first action.",
        ],
      },
      {
        kind: "question",
        text: "What are you actually protecting: your money  or your identity as someone who is “never wrong”?",
      },
      {
        kind: "cta_hint",
        text: "If this applies, the next step is to act under rules  not to wait for certainty.",
      },
    ],
  },

  pattern_resp_avoid: {
    id: "pattern_resp_avoid",
    title: "Responsibility-Avoidance Pattern",
    blocks: [
      { kind: "headline", text: "Your real hesitation isn’t action  it’s ownership." },
      {
        kind: "sub",
        text: "You can tolerate effort. What you avoid is the moment where the outcome becomes linked to you personally  where it’s your call, your responsibility.",
      },
      {
        kind: "list",
        title: "What it looks like",
        items: [
          "You prefer choices where blame is unclear.",
          "You delay if you can’t justify the decision perfectly.",
          "You feel relief when you can say: “I didn’t really choose.”",
        ],
      },
      {
        kind: "list",
        title: "Why it persists",
        items: [
          "Ownership makes outcomes personal.",
          "Being wrong feels like a threat, not feedback.",
          "Avoiding the decision avoids the emotional weight of consequence.",
        ],
      },
      { kind: "divider" },
      {
        kind: "list",
        title: "The real cost",
        items: [
          "You trade growth for emotional safety.",
          "You stay in “research mode” indefinitely.",
          "You outsource the decision to time, chance, or other people.",
        ],
      },
      {
        kind: "list",
        title: "The pivot (one behavior)",
        items: [
          "You choose a decision you can fully own  even if the outcome is imperfect.",
        ],
      },
      {
        kind: "question",
        text: "If you had to sign your name under the outcome  would you still avoid choosing?",
      },
      {
        kind: "cta_hint",
        text: "If this applies, the next step is accountability  not information.",
      },
    ],
  },
};
