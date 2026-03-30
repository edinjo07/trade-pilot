// lib/leadTypes.ts
export type LeadRow = {
  id: string;
  createdAt: string;

  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;

  // click / funnel
  clickId?: string | null;
  subId?: string | null;

  // progress
  didContinue?: boolean | null;
  didClickOut?: boolean | null;

  // scoring
  qualityScore?: number | null;
  isHot?: boolean | null;
};
