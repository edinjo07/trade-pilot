import type { TemplateBlock } from "./templates";

export type LeadFraming = {
  title: string;
  blocks: TemplateBlock[];
  refuseLabel: string;
  submitLabel: string;
};

export const LEAD_FRAMING: LeadFraming = {
  title: "Identity Gate",
  refuseLabel: "I won’t provide details",
  submitLabel: "Continue",
  blocks: [
    { kind: "headline", text: "This is where most people stop." },
    {
      kind: "sub",
      text: "If you’re serious, you don’t stay anonymous. This isn’t for spam, ads, or chasing. It’s a responsibility filter.",
    },
    {
      kind: "list",
      title: "Why details are required",
      items: [
        "It prevents fake intent and fake behavior.",
        "It forces a real decision instead of browsing.",
        "It allows a direct follow-up only if you actually want one.",
      ],
    },
    { kind: "divider" },
    {
      kind: "sub",
      text: "Your details are used only to continue the process and to contact you regarding the next step. If that’s not acceptable, stop here.",
    },
    {
      kind: "question",
      text: "Are you willing to be reachable  or do you want to stay hypothetical?",
    },
  ],
};
