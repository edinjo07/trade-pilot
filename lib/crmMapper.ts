import { prisma } from "@/lib/prisma";

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export async function buildLeadForCrm(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { fullName: true, email: true, phone: true, country: true },
  });

  if (!lead) throw new Error("LEAD_NOT_FOUND");

  const { firstName, lastName } = splitName(lead.fullName);

  return {
    firstName,
    lastName,
    email: lead.email,
    phone: lead.phone,

    // Optional (only include if CRM wants it):
    // country: lead.country || "Canada",
  };
}
