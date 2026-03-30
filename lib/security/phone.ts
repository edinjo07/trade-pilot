import { parsePhoneNumberFromString } from "libphonenumber-js";

export function validateAndNormalizePhone(
  phoneRaw: string,
  country: "CA" | "US" | "ANY" = "CA"
) {
  const raw = (phoneRaw ?? "").trim();
  if (!raw) return { ok: false as const, reason: "missing" as const };

  const pn = parsePhoneNumberFromString(raw, country === "ANY" ? undefined : country);
  if (!pn) return { ok: false as const, reason: "parse_failed" as const };

  if (!pn.isPossible()) return { ok: false as const, reason: "not_possible" as const };
  if (!pn.isValid()) return { ok: false as const, reason: "not_valid" as const };

  if (country === "CA" && pn.country !== "CA") {
    return { ok: false as const, reason: "not_canada" as const };
  }

  return { ok: true as const, e164: pn.number, country: pn.country ?? null };
}
