import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { IntegrationForm } from "@/components/crm/IntegrationForm";
import { IntegrationDetailClient } from "@/components/crm/IntegrationDetailClient";

async function checkAuth() {
  const jar = await cookies();
  const { safeEqual, getAdminToken, ADMIN_COOKIE } = await import("@/lib/adminAuth");
  const session = jar.get(ADMIN_COOKIE)?.value || "";
  const token = getAdminToken();
  if (!token || !safeEqual(session, token)) redirect("/admin/login");
}

export default async function IntegrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await checkAuth();
  const { id } = await params;

  const [integration, recentDeliveries, recentInbound, failedCount] =
    await Promise.all([
      prisma.crmIntegration.findUnique({
        where: { id },
        include: { _count: { select: { deliveries: true, inboundLeads: true } } },
      }),
      prisma.crmDelivery.findMany({
        where: { integrationId: id },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { integration: { select: { name: true } } },
      }),
      prisma.inboundLead.findMany({
        where: { integrationId: id },
        orderBy: { receivedAt: "desc" },
        take: 10,
      }),
      prisma.crmDelivery.count({
        where: { integrationId: id, status: "FAILED" },
      }),
    ]);

  if (!integration) notFound();

  // mask sensitive fields
  const safe = {
    ...integration,
    authValue: integration.authValue ? "[REDACTED]" : "",
    inboundSecretKey: integration.inboundSecretKey ? "[REDACTED]" : "",
  };

  return (
    <IntegrationDetailClient
      integration={safe as any}
      recentDeliveries={recentDeliveries as any}
      recentInbound={recentInbound as any}
      failedCount={failedCount}
    />
  );
}
