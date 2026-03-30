import { NETWORKS } from "./networkConfig";

export function buildOfferUrl(args: {
  offerKey: string;
  clickId: string;
  sub1?: string;
  sub2?: string;
  sub3?: string;
  sub4?: string;
}) {
  const cfg = NETWORKS[args.offerKey];
  if (!cfg) throw new Error("Unknown offerKey");

  const url = new URL(cfg.offerBaseUrl);

  url.searchParams.set(cfg.clickIdParam, args.clickId);

  const subs = [args.sub1, args.sub2, args.sub3, args.sub4] as const;
  cfg.subParams.forEach((paramName, i) => {
    const v = subs[i];
    if (v) url.searchParams.set(paramName, v);
  });

  return url.toString();
}
