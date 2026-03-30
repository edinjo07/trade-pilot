"use client";

import { useCallback, useEffect, useState } from "react";

/* ─── Types ──────────────────────────────────────────────── */
interface Meta {
  totalVisitors: number;
  todayVisitors: number;
  weekVisitors:  number;
  activeVisitors: number;
  conversions:   number;
  conversionRate: string;
}

interface LabelCount { label: string; count: number }

interface RecentVisitor {
  id:          string;
  createdAt:   string;
  lastSeenAt:  string;
  country:     string;
  city:        string;
  region:      string;
  device:      string;
  os:          string;
  browser:     string;
  currentStep: string;
  convertedAt: string | null;
  utmSource:   string | null;
  utmMedium:   string | null;
  utmCampaign: string | null;
  referrer:    string | null;
  landingPath: string;
}

interface StatsData {
  meta:      Meta;
  byCountry: LabelCount[];
  byDevice:  LabelCount[];
  byBrowser: LabelCount[];
  byStep:    LabelCount[];
  bySource:  LabelCount[];
  hourly:    number[];
  recent:    RecentVisitor[];
}

/* ─── Helpers ────────────────────────────────────────────── */
const STEP_ORDER = [
  "BOT_GATE", "S1_HOOK", "S2_PAIN", "S2B_INTRO", "S2C_SIM",
  "S2D_PROOF", "S3_QUIZ", "S4_REVEAL", "S5_SCARCITY", "S6_LEAD", "DONE",
];

function stepIndex(s: string) {
  const i = STEP_ORDER.indexOf(s);
  return i === -1 ? 0 : i;
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function deviceIcon(d: string) {
  if (d === "mobile") return "📱";
  if (d === "tablet") return "📟";
  return "🖥";
}

function stepColor(step: string) {
  if (step === "DONE") return { background: "#d1fae5", color: "#065f46" };
  if (step === "S6_LEAD") return { background: "#fef3c7", color: "#92400e" };
  if (step === "S5_SCARCITY") return { background: "#fee2e2", color: "#991b1b" };
  return { background: "#e0f2fe", color: "#0369a1" };
}

/* ─── Bar component for breakdowns ──────────────────────── */
function BreakdownBar({ items, total }: { items: LabelCount[]; total: number }) {
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
        return (
          <div key={item.label}>
            <div className="flex justify-between text-xs mb-0.5" style={{ color: "#475569" }}>
              <span className="font-medium">{item.label || "Unknown"}</span>
              <span>{item.count} ({pct}%)</span>
            </div>
            <div style={{ background: "#e2e8f0", borderRadius: 4, height: 6 }}>
              <div
                style={{
                  width: `${pct}%`,
                  background: "linear-gradient(90deg, #f59e0b, #d97706)",
                  borderRadius: 4,
                  height: 6,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Hourly sparkline ───────────────────────────────────── */
function HourlyChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const now  = new Date().getHours();
  return (
    <div className="flex items-end gap-0.5 h-16 w-full">
      {data.map((v, h) => {
        const height = `${Math.round((v / max) * 100)}%`;
        const isNow  = h === now;
        return (
          <div
            key={h}
            className="flex-1 rounded-t relative group"
            style={{
              height,
              minHeight: 2,
              background: isNow
                ? "linear-gradient(180deg, #f59e0b, #d97706)"
                : "linear-gradient(180deg, #93c5fd, #3b82f6)",
              opacity: h > now ? 0.35 : 1,
              transition: "height 0.5s ease",
            }}
            title={`${h}:00 — ${v} visitors`}
          />
        );
      })}
    </div>
  );
}

/* ─── Funnel drop-off chart ──────────────────────────────── */
function FunnelChart({ byStep }: { byStep: LabelCount[] }) {
  const sorted = [...STEP_ORDER]
    .map((s) => ({ label: s, count: byStep.find((x) => x.label === s)?.count ?? 0 }))
    .filter((x) => x.count > 0);
  const max = Math.max(...sorted.map((x) => x.count), 1);
  return (
    <div className="space-y-1.5">
      {sorted.map((item) => {
        const pct = Math.round((item.count / max) * 100);
        return (
          <div key={item.label} className="flex items-center gap-2">
            <span style={{ width: 100, fontSize: 11, color: "#64748b", textAlign: "right" }} className="shrink-0 font-mono">
              {item.label}
            </span>
            <div style={{ flex: 1, background: "#e2e8f0", borderRadius: 4, height: 14 }}>
              <div
                style={{
                  width: `${pct}%`,
                  background: item.label === "DONE"
                    ? "linear-gradient(90deg,#10b981,#059669)"
                    : "linear-gradient(90deg,#f59e0b,#d97706)",
                  borderRadius: 4,
                  height: 14,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
            <span style={{ fontSize: 11, color: "#64748b", width: 28, textAlign: "right" }}>{item.count}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────── */
export default function AnalyticsPage() {
  const [data, setData]       = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [err, setErr]         = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics/stats", { credentials: "include" });
      if (res.status === 401) { setErr("Not authorised — please log in."); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as StatsData;
      setData(json);
      setLastRefresh(new Date());
      setErr(null);
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 30_000);
    return () => clearInterval(id);
  }, [load]);

  /* ── shared card style ── */
  const card: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "20px 24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  };

  if (err) {
    return (
      <div style={{ ...card, color: "#dc2626", marginTop: 32 }}>
        {err}
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div style={{ paddingTop: 32, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
        Loading analytics…
      </div>
    );
  }

  const { meta, byCountry, byDevice, byBrowser, byStep, bySource, hourly, recent } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Analytics</h1>
          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            Auto-refreshes every 30s · last updated {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); void load(); }}
          style={{
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "6px 14px",
            fontSize: 13,
            color: "#475569",
            cursor: "pointer",
          }}
        >
          Refresh now
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 14,
        }}
      >
        {[
          { label: "Live Now",        value: meta.activeVisitors, accent: "#10b981", sub: "last 5 min" },
          { label: "Today",           value: meta.todayVisitors,  accent: "#3b82f6", sub: "last 24 h"  },
          { label: "This Week",       value: meta.weekVisitors,   accent: "#8b5cf6", sub: "last 7 days" },
          { label: "All Time",        value: meta.totalVisitors,  accent: "#f59e0b", sub: "unique IPs"  },
          { label: "Conversions",     value: meta.conversions,    accent: "#ef4444", sub: "lead forms"  },
          { label: "Conversion Rate", value: `${meta.conversionRate}%`, accent: "#0ea5e9", sub: "total" },
        ].map((s) => (
          <div key={s.label} style={card}>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {s.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.accent, marginTop: 4, lineHeight: 1.1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Hourly chart + Funnel drop-off ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={card}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>Visitors by Hour (today)</h2>
          <HourlyChart data={hourly} />
          <div className="flex justify-between mt-1" style={{ fontSize: 10, color: "#94a3b8" }}>
            <span>0:00</span>
            <span>12:00</span>
            <span>23:00</span>
          </div>
        </div>
        <div style={card}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>Funnel Drop-off</h2>
          <FunnelChart byStep={byStep} />
        </div>
      </div>

      {/* ── Breakdown cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
        <div style={card}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>By Country</h2>
          <BreakdownBar items={byCountry} total={meta.totalVisitors} />
        </div>
        <div style={card}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>By Device</h2>
          <BreakdownBar items={byDevice} total={meta.totalVisitors} />
        </div>
        <div style={card}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>By Browser</h2>
          <BreakdownBar items={byBrowser} total={meta.totalVisitors} />
        </div>
        <div style={card}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>UTM Sources</h2>
          {bySource.length === 0 ? (
            <p style={{ fontSize: 12, color: "#94a3b8" }}>No UTM data yet</p>
          ) : (
            <BreakdownBar items={bySource} total={meta.totalVisitors} />
          )}
        </div>
      </div>

      {/* ── Recent visitors table ── */}
      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
            Recent Visitors
            <span style={{ marginLeft: 8, fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>
              (last 50)
            </span>
          </h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                {["Seen", "Country / City", "Device", "OS / Browser", "Step", "UTM / Ref", "Converted"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "8px 14px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#64748b",
                      whiteSpace: "nowrap",
                      fontSize: 11,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((v, i) => (
                <tr
                  key={v.id}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    background: i % 2 === 0 ? "#ffffff" : "#fafafa",
                  }}
                >
                  {/* Seen */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap", color: "#475569" }}>
                    <div>{timeAgo(v.lastSeenAt)}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>{fmtDate(v.createdAt)} {fmtTime(v.createdAt)}</div>
                  </td>

                  {/* Country / City */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>{v.country || "—"}</span>
                    {v.city && <span style={{ color: "#94a3b8", marginLeft: 4 }}>{v.city}</span>}
                  </td>

                  {/* Device */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap", fontSize: 16 }}>
                    {deviceIcon(v.device)}
                  </td>

                  {/* OS / Browser */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap", color: "#475569" }}>
                    <div>{v.os || "—"}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>{v.browser}</div>
                  </td>

                  {/* Step */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        ...stepColor(v.currentStep),
                        padding: "2px 8px",
                        borderRadius: 20,
                        fontWeight: 600,
                        fontSize: 10,
                      }}
                    >
                      {v.currentStep}
                    </span>
                  </td>

                  {/* UTM / Ref */}
                  <td style={{ padding: "8px 14px", maxWidth: 160, overflow: "hidden" }}>
                    {v.utmSource && (
                      <div style={{ color: "#0369a1", fontSize: 11 }}>
                        {v.utmSource}
                        {v.utmMedium && <> / {v.utmMedium}</>}
                        {v.utmCampaign && <> · {v.utmCampaign}</>}
                      </div>
                    )}
                    {!v.utmSource && v.referrer && (
                      <div style={{ color: "#94a3b8", fontSize: 11 }} title={v.referrer}>
                        {v.referrer.replace(/^https?:\/\//, "").slice(0, 30)}
                      </div>
                    )}
                    {!v.utmSource && !v.referrer && (
                      <span style={{ color: "#cbd5e1" }}>direct</span>
                    )}
                  </td>

                  {/* Converted */}
                  <td style={{ padding: "8px 14px", whiteSpace: "nowrap" }}>
                    {v.convertedAt ? (
                      <span style={{ color: "#10b981", fontWeight: 700 }}>Yes</span>
                    ) : (
                      <span style={{ color: "#cbd5e1" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>
                    No visitor data yet — visit the funnel to start tracking.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
