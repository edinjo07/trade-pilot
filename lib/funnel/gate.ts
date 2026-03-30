import type { TemplateBlock } from "./templates";

export type GateSpec = {
  title: string;
  blocks: TemplateBlock[];
  continueLabel: string;
};

export const GATE: GateSpec = {
  title: "Neutral continuation",
  continueLabel: "Continue",
  blocks: [
    { kind: "headline", text: "Read this before you proceed." },
    {
      kind: "sub",
      text: "This is not advice and not a promise. It’s a final reality check before any external step.",
    },
    { kind: "divider" },
    {
      kind: "list",
      title: "By continuing, you accept that:",
      items: [
        "Losses are possible  even quickly.",
        "No tool removes uncertainty.",
        "Depositing money you need for life is a mistake.",
        "You own the outcome, not this site.",
      ],
    },
    { kind: "divider" },
    {
      kind: "question",
      text: "If you lost your deposit, would it impact rent, bills, or daily life?",
    },
    {
      kind: "cta_hint",
      text: "If the answer is yes, the responsible move is to stop here.",
    },
  ],
};
