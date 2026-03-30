import { parsePhoneNumberFromString } from "libphonenumber-js";

const disposableDomains = new Set([
  "tempmail.com",
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "yopmail.com",
  "trashmail.com",
  "getnada.com",
  "maildrop.cc",
]);

export function validateLeadServer(input: {
  fullName: string;
  email: string;
  phone: string;
  country?: string;
}) {
  const nameOk =
    input.fullName.trim().split(/\s+/).length >= 2 &&
    input.fullName.trim().length >= 5 &&
    !/\d/.test(input.fullName);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim());
  const domain = input.email.split("@")[1]?.toLowerCase() ?? "";
  const disposableEmail = domain ? disposableDomains.has(domain) : false;

  const country = input.country ?? "CA";
  const phoneParsed = parsePhoneNumberFromString(input.phone, country as any);
  const phoneOk = !!phoneParsed && phoneParsed.isValid();
  const phoneCountryOk = !!phoneParsed && phoneParsed.country === country;

  return { nameOk, emailOk, disposableEmail, phoneOk, phoneCountryOk };
}
