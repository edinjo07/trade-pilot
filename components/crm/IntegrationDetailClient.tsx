"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IntegrationForm } from "./IntegrationForm";

interface Delivery {
  id: string;
  createdAt: string;
  leadId: string;
  status: string;
  requestMethod: string;
  requestUrl: string;
  responseStatus: number | null;
  durationMs: number | null;
  lastError: string | null;
  attempts: number;
}

interface InboundLead {
  id: string;
  receivedAt: string;
  sourceIp: string | null;
  status: string;
  createdLeadId: string | null;
  mappedData: string | null;
}

interface Integration {
  id: string;
  name: string;
  platform: string;
  active: boolean;
  method: string;
  endpoint: string;
  authType: string;
  authHeader: string;
  authValue: string;
  extraHeaders: string | null;
  fieldMapping: string | null;
  bodyTemplate: string | null;
  outboundIpNote: string | null;
  inboundEnabled: boolean;
  inboundSlug: string | null;
  inboundSecretKey: string | null;
  inboundIpWhitelist: string | null;
  inboundFieldMapping: string | null;
  inboundMethod: string;
  _count: { deliveries: number; inboundLeads: number };
}

export function IntegrationDetailClient({
  integration,
  recentDeliveries,
  recentInbound,
  failedCount,
}: {
  integration: Integration;
  recentDeliveries: Delivery[];
  recentInbound: InboundLead[];
  failedCount: number;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"edit" | "deliveries" | "inbound">("edit");
  const [retrying, setRetrying] = useState(false);
  const [retryResult, setRetryResult] = useState<any>(null);
  const [outboundIp, setOutboundIp] = useState<string | null>(null);
  const [checkingIp, setCheckingIp] = useState(false);
  const [deleting, startDelete] = useTransition();

  const handleRetryFailed = async () => {
    setRetrying(true);
    setRetryResult(null);
    try {
      const res = await fetch(
        `/api/admin/crm/integrations/${integration.id}/retry`,
        { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }
      );
      setRetryResult(await res.json());
      router.refresh();
    } catch (e: any) {
      setRetryResult({ ok: false, error: String(e?.message || e) });
    } finally {
      setRetrying(false);
    }
  };

  const handleCheckIp = async () => {
    setCheckingIp(true);
    try {
      const res = await fetch("/api/admin/myip");
      const d = await res.json();
      setOutboundIp(d.ip || "unknown");
    } catch {
      setOutboundIp("unknown");
    } finally {
      setCheckingIp(false);
    }
  };

  const handleDelete = () => {
    if (!confirm(`Delete integration "${integration.name}"? This cannot be undone.`)) return;
    startDelete(async () => {
      await fetch(`/api/admin/crm/integrations/${integration.id}`, { method: "DELETE" });
      router.push("/admin/crm");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <a href="/admin/crm" className="text-sm" style={{ color: "#6b7280" }}>
            ← CRM Hub
          </a>
          <h1 className="mt-2 text-2xl font-black" style={{ color: "#111827" }}>
            {integration.name}
          </h1>
          <div className="mt-1 flex items-center gap-3">
            <Platform platform={integration.platform} />
            <StatusBadge active={integration.active} />
            {integration.inboundEnabled && <InboundBadge />}
          </div>
        </div>

        <div className="flex gap-2">
          {/* Our outbound IP */}
          <button
            onClick={handleCheckIp}
            disabled={checkingIp}
            className="rounded-xl px-3 py-2 text-xs font-medium disabled:opacity-50"
            style={{
              background: "#f3f4f6",
              border: "1px solid #e5e7eb",
              color: "#374151",
            }}
          >
            {checkingIp ? "Checking…" : "Our Outbound IP"}
          </button>

          {failedCount > 0 && (
            <button
              onClick={handleRetryFailed}
              disabled={retrying}
              className="rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-50"
              style={{
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#ef4444",
              }}
            >
              {retrying ? "Retrying…" : `Retry ${failedCount} Failed`}
            </button>
          )}

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-xl px-3 py-2 text-xs font-medium disabled:opacity-50"
            style={{
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              color: "#ef4444",
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Our IP display */}
      {outboundIp && (
        <div
          className="rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-3"
          style={{
            background: "#fef3c7",
            border: "1px solid #fcd34d",
          }}
        >
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#d97706" }}>
              Our Server&apos;s Outbound IP
            </div>
            <div className="mt-1 font-mono text-lg font-bold" style={{ color: "#111827" }}>
              {outboundIp}
            </div>
          </div>
          <div className="text-xs" style={{ color: "#6b7280" }}>
            Add this IP to the whitelist in {integration.name} so they accept our pushes.
          </div>
        </div>
      )}

      {/* Retry result */}
      {retryResult && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: retryResult.ok ? "#ecfdf5" : "#fef2f2",
            border: `1px solid ${retryResult.ok ? "#6ee7b7" : "#fca5a5"}`,
            color: retryResult.ok ? "#065f46" : "#991b1b",
          }}
        >
          Retried {retryResult.retried} leads - {retryResult.sent} sent, {retryResult.failed} still failed
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat label="Total Pushes" value={integration._count.deliveries} />
        <MiniStat label="Failed" value={failedCount} warn={failedCount > 0} />
        <MiniStat label="Inbound Received" value={integration._count.inboundLeads} />
        <MiniStat label="Auth Type" value={integration.authType.toUpperCase()} small />
      </div>

      {/* Inbound webhook URL */}
      {integration.inboundEnabled && integration.inboundSlug && (
        <div
          className="rounded-xl px-5 py-4 space-y-2"
          style={{
            background: "#ede9fe",
            border: "1px solid #c4b5fd",
          }}
        >
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#6d28d9" }}>
            Inbound Webhook URL - Share with {integration.name}
          </div>
          <code className="block text-sm" style={{ color: "#111827" }}>
            {typeof window !== "undefined" ? window.location.origin : "https://yourdomain.com"}
            /api/webhook/inbound/{integration.inboundSlug}
          </code>
          <div className="text-xs" style={{ color: "#6b7280" }}>
            Method: {integration.inboundMethod} 
            {integration.inboundSecretKey ? " · Secret key required" : " · No secret key"}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div
        className="flex gap-1 rounded-xl p-1"
        style={{ background: "#f3f4f6", border: "1px solid #e5e7eb" }}
      >
        {(["edit", "deliveries", "inbound"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 rounded-lg py-2.5 text-sm font-medium capitalize transition-colors"
            style={
              activeTab === tab
                ? { background: "#fff", color: "#d97706", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                : { color: "#6b7280" }
            }
          >
            {tab === "edit" && "Edit Settings"}
            {tab === "deliveries" && `Outbound Log (${integration._count.deliveries})`}
            {tab === "inbound" && `Inbound Log (${integration._count.inboundLeads})`}
          </button>
        ))}
      </div>

      {activeTab === "edit" && (
        <IntegrationForm initial={integration} isEdit />
      )}

      {activeTab === "deliveries" && (
        <DeliveriesTable deliveries={recentDeliveries} integrationId={integration.id} />
      )}

      {activeTab === "inbound" && (
        <InboundTable items={recentInbound} enabled={integration.inboundEnabled} />
      )}
    </div>
  );
}

// ─── Deliveries Table ───────────────────────────────────────────────────────

function DeliveriesTable({
  deliveries,
  integrationId,
}: {
  deliveries: Delivery[];
  integrationId: string;
}) {
  const [pushed, setPushed] = useState<Record<string, any>>({});
  const [pushing, setPushing] = useState<string | null>(null);

  const handlePush = async (leadId: string) => {
    setPushing(leadId);
    try {
      const res = await fetch(`/api/admin/crm/integrations/${integrationId}/push`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ leadId, force: true }),
      });
      const d = await res.json();
      setPushed((prev) => ({ ...prev, [leadId]: d }));
    } catch (e: any) {
      setPushed((prev) => ({ ...prev, [leadId]: { ok: false, error: String(e?.message || e) } }));
    } finally {
      setPushing(null);
    }
  };

  if (!deliveries.length) {
    return (
      <EmptySection message="No outbound deliveries yet. Push a lead to see logs here." />
    );
  }

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{ background: "#fff", border: "1px solid #e5e7eb" }}
    >
      <table className="w-full text-sm">
        <thead>
          <HeadRow cells={["Lead ID", "Status", "HTTP", "Duration", "Error", "Action"]} />
        </thead>
        <tbody>
          {deliveries.map((d) => (
            <tr
              key={d.id}
              className="transition-colors hover:bg-gray-50"
              style={{ borderTop: "1px solid #f3f4f6" }}
            >
              <td className="px-4 py-3 font-mono text-xs" style={{ color: "#d97706" }}>
                {d.leadId.slice(0, 12)}…
              </td>
              <td className="px-4 py-3">
                <DeliveryStatusBadge status={d.status} />
              </td>
              <td className="px-4 py-3 text-xs" style={{ color: "#6b7280" }}>
                {d.responseStatus || "-"}
              </td>
              <td className="px-4 py-3 text-xs" style={{ color: "#6b7280" }}>
                {d.durationMs != null ? `${d.durationMs}ms` : "-"}
              </td>
              <td
                className="px-4 py-3 text-xs max-w-[200px] truncate"
                style={{ color: "#ef4444" }}
                title={d.lastError || ""}
              >
                {d.lastError || "-"}
              </td>
              <td className="px-4 py-3">
                {pushed[d.leadId] ? (
                  <span
                    className="text-xs"
                    style={{
                      color: pushed[d.leadId].ok ? "#059669" : "#ef4444",
                    }}
                  >
                    {pushed[d.leadId].ok ? "✓ Sent" : "✗ Failed"}
                  </span>
                ) : (
                  <button
                    onClick={() => handlePush(d.leadId)}
                    disabled={pushing === d.leadId}
                    className="rounded-lg px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg,#f0a500,#d4840a)" }}
                  >
                    {pushing === d.leadId ? "…" : "Re-push"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Inbound Table ──────────────────────────────────────────────────────────

function InboundTable({
  items,
  enabled,
}: {
  items: InboundLead[];
  enabled: boolean;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!enabled) {
    return (
      <EmptySection message="Inbound webhook is not enabled for this integration." />
    );
  }

  if (!items.length) {
    return (
      <EmptySection message="No inbound leads yet. Share the webhook URL above to start receiving." />
    );
  }

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{ background: "#fff", border: "1px solid #e5e7eb" }}
    >
      <table className="w-full text-sm">
        <thead>
          <HeadRow cells={["Received", "Source IP", "Status", "Lead Created", "Mapped Data"]} />
        </thead>
        <tbody>
          {items.map((item) => (
            <React.Fragment key={item.id}>
              <tr
                className="cursor-pointer transition-colors hover:bg-gray-50"
                style={{ borderTop: "1px solid #f3f4f6" }}
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
              >
                <td className="px-4 py-3 text-xs" style={{ color: "#6b7280" }}>
                  {new Date(item.receivedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: "#374151" }}>
                  {item.sourceIp || "-"}
                </td>
                <td className="px-4 py-3">
                  <InboundStatusBadge status={item.status} />
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: item.createdLeadId ? "#059669" : "#9ca3af" }}>
                  {item.createdLeadId ? (
                    <a href={`/admin/leads/${item.createdLeadId}`} className="hover:underline">
                      {item.createdLeadId.slice(0, 12)}…
                    </a>
                  ) : ( "-" )}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "#d97706" }}>
                  {expanded === item.id ? "▲ hide" : "▼ view"}
                </td>
              </tr>
              {expanded === item.id && item.mappedData && (
                <tr style={{ background: "#f9fafb", borderTop: "1px solid #e5e7eb" }}>
                  <td colSpan={5} className="px-4 py-3">
                    <pre
                      className="text-xs overflow-auto rounded-lg p-3"
                      style={{
                        background: "#f3f4f6",
                        color: "#374151",
                        border: "1px solid #e5e7eb",
                        maxHeight: "200px",
                      }}
                    >
                      {JSON.stringify(JSON.parse(item.mappedData), null, 2)}
                    </pre>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Small helpers ──────────────────────────────────────────────────────────

function HeadRow({ cells }: { cells: string[] }) {
  return (
    <tr
      style={{
        background: "#f9fafb",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      {cells.map((c) => (
        <th
          key={c}
          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest"
          style={{ color: "#6b7280" }}
        >
          {c}
        </th>
      ))}
    </tr>
  );
}

function MiniStat({
  label,
  value,
  warn,
  small,
}: {
  label: string;
  value: number | string;
  warn?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: warn && Number(value) > 0 ? "#fef2f2" : "#fff",
        border:
          warn && Number(value) > 0
            ? "1px solid #fca5a5"
            : "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div className="text-xs uppercase tracking-widest" style={{ color: "#9ca3af" }}>
        {label}
      </div>
      <div
        className={`mt-1.5 font-black ${small ? "text-base" : "text-xl"}`}
        style={{
          color: warn && Number(value) > 0 ? "#ef4444" : "#d97706",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function DeliveryStatusBadge({ status }: { status: string }) {
  const styles: Record<string, React.CSSProperties> = {
    SENT: { background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" },
    FAILED: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5" },
    PENDING: { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" },
    RETRYING: { background: "#ede9fe", color: "#6d28d9", border: "1px solid #c4b5fd" },
  };

  return (
    <span
      className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={styles[status] || styles.PENDING}
    >
      {status}
    </span>
  );
}

function InboundStatusBadge({ status }: { status: string }) {
  const map: Record<string, React.CSSProperties> = {
    RECEIVED: { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" },
    PROCESSED: { background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" },
    SKIPPED: { background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" },
    ERROR: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5" },
  };
  return (
    <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" style={map[status] || {}}>
      {status}
    </span>
  );
}

function Platform({ platform }: { platform: string }) {
  return (
    <span className="text-xs" style={{ color: "#6b7280" }}>
      {platform.charAt(0).toUpperCase() + platform.slice(1)}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={
        active
          ? { background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" }
          : { background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" }
      }
    >
      {active ? "Active" : "Paused"}
    </span>
  );
}

function InboundBadge() {
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: "#ede9fe", color: "#6d28d9", border: "1px solid #c4b5fd" }}
    >
      Inbound
    </span>
  );
}

function EmptySection({ message }: { message: string }) {
  return (
    <div
      className="rounded-2xl px-8 py-12 text-center"
      style={{ background: "#fff", border: "1px solid #e5e7eb" }}
    >
      <p className="text-sm" style={{ color: "#9ca3af" }}>
        {message}
      </p>
    </div>
  );
}
