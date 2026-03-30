export type NetworkConfig = {
  offerKey: string;
  offerBaseUrl: string;
  clickIdParam: string;
  subParams: [string, string, string, string];
};

export const NETWORKS: Record<string, NetworkConfig> = {
  offerA: {
    offerKey: "offerA",
    offerBaseUrl: "https://YOUR-NETWORK-OFFER-LINK-HERE",
    clickIdParam: "clickid",
    subParams: ["sub1", "sub2", "sub3", "sub4"],
  },
  offerB: {
    offerKey: "offerB",
    offerBaseUrl: "https://YOUR-NETWORK-OFFER-LINK-HERE",
    clickIdParam: "cid",
    subParams: ["s1", "s2", "s3", "s4"],
  },
  offerC: {
    offerKey: "offerC",
    offerBaseUrl: "https://YOUR-NETWORK-OFFER-LINK-HERE",
    clickIdParam: "aff_click_id",
    subParams: ["aff_sub1", "aff_sub2", "aff_sub3", "aff_sub4"],
  },
};
