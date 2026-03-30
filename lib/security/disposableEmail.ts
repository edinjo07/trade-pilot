const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "10minutemail.com",
  "guerrillamail.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com",
  "getnada.com",
  "trashmail.com",
  "fakeinbox.com",
  "sharklasers.com",
  "grr.la",
  "minuteinbox.com",
  "maildrop.cc",
  "mohmal.com",
]);

export function extractEmailDomain(email: string) {
  const x = email.trim().toLowerCase();
  const at = x.lastIndexOf("@");
  if (at < 0) return "";
  return x.slice(at + 1);
}

export function isDisposableEmail(email: string) {
  const domain = extractEmailDomain(email);
  if (!domain) return true;
  if (DISPOSABLE_DOMAINS.has(domain)) return true;

  if (domain.includes("tempmail") || domain.includes("mailtemp") || domain.includes("trash")) {
    return true;
  }

  return false;
}
