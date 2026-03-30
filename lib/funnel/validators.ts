type LeadFormData = {
  fullName: string;
  email: string;
  phone: string;
  validation: {
    nameOk: boolean;
    emailOk: boolean;
    phoneOk: boolean;
    disposableEmail: boolean;
    phoneCountryOk: boolean;
  };
};

const disposableDomains = new Set([
  "tempmail.com",
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
]);

export function validateLeadClient(
  lead: LeadFormData
): LeadFormData["validation"] {
  const nameOk =
    lead.fullName.trim().split(/\s+/).length >= 2 &&
    lead.fullName.trim().length >= 5 &&
    !/\d/.test(lead.fullName);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email.trim());
  const domain = lead.email.split("@")[1]?.toLowerCase() ?? "";
  const disposableEmail = domain ? disposableDomains.has(domain) : false;

  const phoneOk = /^[+\d][\d\s().-]{6,20}$/.test(lead.phone.trim());
  const phoneCountryOk = true;

  return { nameOk, emailOk, phoneOk, disposableEmail, phoneCountryOk };
}
