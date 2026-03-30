import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/adminAuth";
import { cookies } from "next/headers";
import Link from "next/link";
import React from "react";

async function checkAuth() {
  const jar = await cookies();
  const { safeEqual, getAdminToken, ADMIN_COOKIE } = await import("@/lib/adminAuth");
  const session = jar.get(ADMIN_COOKIE)?.value || "";
  const token = getAdminToken();
  if (!token || !safeEqual(session, token)) redirect("/admin/login");
}

export default async function AdminCrmPage() {
  await checkAuth();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [integrations, todayDeliveries, todayFailed, todayInbound] =
    await Promise.all([
      prisma.crmIntegration.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { deliveries: true, inboundLeads: true } },
        },
      }),
      prisma.crmDelivery.count({ where: { createdAt: { gte: today } } }),
      prisma.crmDelivery.count({
        where: { createdAt: { gte: today }, status: "FAILED" },
      }),
      prisma.inboundLead.count({ where: { receivedAt: { gte: today } } }),
    ]);

  const active = integrations.filter((i) => i.active).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-black tracking-tight"
            style={{ color: "#111827" }}
          >
            CRM Hub
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#6b7280" }}>
            Manage external CRM connections, push leads, receive inbound data
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/ip-whitelist"
            className="rounded-xl px-4 py-2.5 text-sm font-medium"
            style={{
              background: "#f3f4f6",
              border: "1px solid #e5e7eb",
              color: "#374151",
            }}
          >
            IP Whitelist
          </Link>
          <Link
            href="/admin/crm/new"
            className="rounded-xl px-5 py-2.5 text-sm font-bold text-black"
            style={{ background: "linear-gradient(135deg,#f0a500,#d4840a)" }}
          >
            + New Integration
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat title="Total Integrations" value={String(integrations.length)} />
        <Stat title="Active" value={String(active)} accent />
        <Stat title="Pushes Today" value={String(todayDeliveries)} />
        <Stat
          title="Failed Today"
          value={String(todayFailed)}
          warn={todayFailed > 0}
        />
      </div>

      {/* Inbound stat */}
      {todayInbound > 0 && (
        <div
          className="rounded-xl px-5 py-3 text-sm"
          style={{
            background: "#ecfdf5",
            border: "1px solid #6ee7b7",
            color: "#065f46",
          }}
        >
          <strong>{todayInbound}</strong> inbound leads received today via webhooks
        </div>
      )}

      {/* Integrations list */}
      {integrations.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          <h2
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: "#9ca3af" }}
          >
            Configured Integrations
          </h2>
          {integrations.map((i) => (
            <IntegrationCard key={i.id} integration={i} />
          ))}
        </div>
      )}

      {/* Postback info */}
      <div
        className="rounded-2xl p-6 space-y-3"
        style={{
          background: "rgba(13,18,32,0.6)",
          border: "1px solid rgba(240,165,0,0.1)",
        }}
      >
        <h2 className="font-semibold" style={{ color: "#f5b523" }}>
          Postback / Deposit Webhook
        </h2>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          To receive deposit confirmations from affiliate networks, point them
          to:
        </p>
        <code
          className="block rounded-lg px-4 py-3 text-xs"
          style={{
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "#34d399",
          }}
        >
          POST/GET {"{YOUR_DOMAIN}"}/api/postback?clickId={"{click_id}"}&status={"{status}"}&payout={"{payout}"}
        </code>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
          Supported fields: <code>clickId</code>, <code>status</code> (ftd/deposit/converted/rejected),{" "}
          <code>payout</code>, <code>currency</code>, <code>txid</code>
        </p>
      </div>
    </div>
  );
}

function Stat({
  title,
  value,
  accent,
  warn,
}: {
  title: string;
  value: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: warn ? "#fef2f2" : "#fff",
        border: warn ? "1px solid #fca5a5" : "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="text-xs uppercase tracking-widest"
        style={{ color: "#9ca3af" }}
      >
        {title}
      </div>
      <div
        className="mt-1.5 text-2xl font-black"
        style={{
          color: warn ? "#ef4444" : accent ? "#059669" : "#d97706",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function IntegrationCard({
  integration,
}: {
  integration: {
    id: string;
    name: string;
    platform: string;
    active: boolean;
    method: string;
    endpoint: string;
    authType: string;
    inboundEnabled: boolean;
    inboundSlug: string | null;
    _count: { deliveries: number; inboundLeads: number };
  };
}) {
  return (
    <Link
      href={`/admin/crm/${integration.id}`}
      className="flex items-center justify-between rounded-2xl px-5 py-4 transition-colors hover:bg-gray-50"
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
      }}
    >
      <div className="flex items-center gap-4">
        <PlatformIcon platform={integration.platform} />
        <div>
          <div className="font-semibold" style={{ color: "#111827" }}>
            {integration.name}
          </div>
          <div className="mt-0.5 text-xs" style={{ color: "#9ca3af" }}>
            {integration.method} → {integration.endpoint.slice(0, 60)}
            {integration.endpoint.length > 60 ? "…" : ""}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Stats */}
        <div className="hidden md:flex gap-4 text-xs" style={{ color: "#9ca3af" }}>
          <span>{integration._count.deliveries} pushes</span>
          {integration.inboundEnabled && (
            <span>{integration._count.inboundLeads} inbound</span>
          )}
        </div>

        {/* Badges */}
        <div className="flex gap-2">
          {integration.inboundEnabled && (
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{
                background: "#ede9fe",
                color: "#6d28d9",
                border: "1px solid #c4b5fd",
              }}
            >
              Inbound
            </span>
          )}
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={
              integration.active
                ? {
                    background: "#d1fae5",
                    color: "#065f46",
                    border: "1px solid #6ee7b7",
                  }
                : {
                    background: "#f3f4f6",
                    color: "#6b7280",
                    border: "1px solid #e5e7eb",
                  }
            }
          >
            {integration.active ? "Active" : "Paused"}
          </span>
        </div>

        <svg
          className="h-4 w-4 opacity-30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
}

function PlatformIcon({ platform }: { platform: string }) {
  const icons: Record<string, string> = {
    gohighlevel: "GHL",
    hubspot: "HS",
    salesforce: "SF",
    activecampaign: "AC",
    webhook: "WH",
    custom: "API",
  };
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black"
      style={{
        background: "#fef3c7",
        border: "1px solid #fcd34d",
        color: "#d97706",
      }}
    >
      {icons[platform.toLowerCase()] || "API"}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded-2xl px-8 py-16 text-center"
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        className="mb-4 text-5xl"
        style={{ color: "#d1d5db" }}
      >
        🔌
      </div>
      <h3
        className="text-lg font-semibold"
        style={{ color: "#374151" }}
      >
        No CRM integrations yet
      </h3>
      <p
        className="mt-2 text-sm"
        style={{ color: "#9ca3af" }}
      >
        Connect your first CRM to start sending leads automatically.
      </p>
      <Link
        href="/admin/crm/new"
        className="mt-6 inline-flex rounded-xl px-6 py-3 text-sm font-bold text-black"
        style={{ background: "linear-gradient(135deg,#f0a500,#d4840a)" }}
      >
        + Add Integration
      </Link>
    </div>
  );
}
