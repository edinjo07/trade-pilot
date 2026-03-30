"use client";

import { useCallback, useEffect, useState } from "react";

/* ─── Types ──────────────────────────────────────────────── */
interface Meta {
  totalVisitors:  number;
  realVisitors:   number;
  botVisitors:    number;
  todayVisitors:  number;
  weekVisitors:   number;
  monthVisitors:  number;
  activeVisitors: number;
  conversions:    number;
  conversionRate: string;
}

interface LabelCount { label: string; count: number }
interface PeriodPoint { date?: string; week?: string; month?: string; label: string; count: number }

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
  meta:         Meta;
  byCountry:    LabelCount[];
  byCountryAll: LabelCount[];
  byDevice:     LabelCount[];
  byBrowser:    LabelCount[];
  byStep:       LabelCount[];
  bySource:     LabelCount[];
  byBotType:    LabelCount[];
  hourly:       number[];
  daily:        PeriodPoint[];
  weekly:       PeriodPoint[];
  monthly:      PeriodPoint[];
  recent:       RecentVisitor[];
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

/* ─── Country flag emoji ────────────────────────────────── */
function countryFlag(code: string) {
  if (!code || code.length !== 2) return "🌍";
  const cp = [...code.toUpperCase()].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0));
  return String.fromCodePoint(...cp);
}

/* ─── Period bar chart ───────────────────────────────────── */
function PeriodChart({ data, color }: { data: PeriodPoint[]; color: string }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-0.5" style={{ height: 80 }}>
        {data.map((pt, i) => {
          const pct = Math.round((pt.count / max) * 100);
          return (
            <div
              key={i}
              className="flex-1 rounded-t relative group"
              style={{
                height: `${Math.max(pct, 2)}%`,
                background: pt.count === 0 ? "#e2e8f0" : color,
                transition: "height 0.5s ease",
                cursor: "default",
              }}
              title={`${pt.label}: ${pt.count} visitors`}
            />
          );
        })}
      </div>
      {/* x-axis: first, middle, last labels */}
      <div className="flex justify-between" style={{ fontSize: 10, color: "#94a3b8" }}>
        <span>{data[0]?.label ?? ""}</span>
        <span>{data[Math.floor(data.length / 2)]?.label ?? ""}</span>
        <span>{data[data.length - 1]?.label ?? ""}</span>
      </div>
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
  const [data, setData]         = useState<StatsData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [err, setErr]           = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [period, setPeriod]     = useState<"daily" | "weekly" | "monthly">("daily");
  const [showAllCountries, setShowAllCountries] = useState(false);

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

  const { meta, byCountry, byCountryAll, byBotType, byDevice, byBrowser, byStep, bySource, hourly, daily, weekly, monthly, recent } = data;

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

      {/* ── Traffic overview: real vs bot ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Real visitors card */}
        <div style={{ ...card, borderLeft: "4px solid #10b981" }}>
          <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
            👤 Real Visitors
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#10b981", lineHeight: 1 }}>
            {meta.realVisitors.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
            {meta.totalVisitors > 0
              ? `${((meta.realVisitors / meta.totalVisitors) * 100).toFixed(1)}% of all traffic`
              : "no traffic yet"}
          </div>
        </div>
        {/* Bot visitors card */}
        <div style={{ ...card, borderLeft: "4px solid #ef4444" }}>
          <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
            🤖 Bot Traffic
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#ef4444", lineHeight: 1 }}>
            {meta.botVisitors.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
            {meta.totalVisitors > 0
              ? `${((meta.botVisitors / meta.totalVisitors) * 100).toFixed(1)}% of all traffic · blocked`
              : "no bots detected"}
          </div>
        </div>
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
          { label: "Live Now",        value: meta.activeVisitors,  accent: "#10b981", sub: "last 5 min" },
          { label: "Today",           value: meta.todayVisitors,   accent: "#3b82f6", sub: "last 24 h"  },
          { label: "This Week",       value: meta.weekVisitors,    accent: "#8b5cf6", sub: "last 7 days" },
          { label: "This Month",      value: meta.monthVisitors,   accent: "#f97316", sub: "last 30 days" },
          { label: "All Time",        value: meta.totalVisitors,   accent: "#f59e0b", sub: "unique IPs"  },
          { label: "Conversions",     value: meta.conversions,     accent: "#ef4444", sub: "lead forms"  },
          { label: "Conversion Rate", value: `${meta.conversionRate}%`, accent: "#0ea5e9", sub: "of real visitors" },
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

      {/* ── Bot type breakdown ── */}
      {byBotType.length > 0 && (
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>🤖</span>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Bot Traffic Breakdown
            </h2>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8" }}>
              {meta.botVisitors} total blocked
            </span>
          </div>
          <div style={{ padding: "12px 20px", display: "flex", flexWrap: "wrap", gap: 8 }}>
            {byBotType.map((b) => {
              const pct = meta.botVisitors > 0 ? ((b.count / meta.botVisitors) * 100).toFixed(1) : "0";
              const label = b.label;
              const color =
                label.includes("Google")   ? "#4285F4" :
                label.includes("Facebook") ? "#1877F2" :
                label.includes("Bing")     ? "#00897B" :
                label.includes("Twitter")  ? "#1DA1F2" :
                label.includes("LinkedIn") ? "#0A66C2" :
                label.includes("Headless") ? "#dc2626" :
                label.includes("Script")   ? "#f97316" :
                label.includes("Scrapy")   ? "#f59e0b" :
                "#6366f1";
              return (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: `${color}12`,
                    border: `1px solid ${color}30`,
                    borderRadius: 20,
                    padding: "5px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: color,
                  }}
                >
                  <span>{label}</span>
                  <span style={{ background: `${color}25`, borderRadius: 12, padding: "1px 7px", fontSize: 11 }}>
                    {b.count} · {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Watch Statistics button ── */}
      <div>
        <button
          onClick={() => setShowStats((v) => !v)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: showStats
              ? "linear-gradient(135deg,#1e40af,#3b82f6)"
              : "linear-gradient(135deg,#0f172a,#1e293b)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.02em",
          }}
        >
          <span style={{ fontSize: 16 }}>{showStats ? "📊" : "👁"}</span>
          {showStats ? "Hide Statistics" : "Watch Statistics"}
        </button>
      </div>

      {/* ── Expanded Statistics Panel ── */}
      {showStats && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Period chart with tab switcher */}
          <div style={card}>
            <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Visitors Over Time</h2>
              <div style={{ display: "flex", gap: 6 }}>
                {(["daily", "weekly", "monthly"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "1px solid #e2e8f0",
                      background: period === p ? "#0f172a" : "#f8fafc",
                      color: period === p ? "#fff" : "#475569",
                    }}
                  >
                    {p === "daily" ? "Daily (30d)" : p === "weekly" ? "Weekly (13w)" : "Monthly (12m)"}
                  </button>
                ))}
              </div>
            </div>
            <PeriodChart
              data={period === "daily" ? daily : period === "weekly" ? weekly : monthly}
              color={
                period === "daily"
                  ? "linear-gradient(180deg,#6366f1,#4f46e5)"
                  : period === "weekly"
                  ? "linear-gradient(180deg,#10b981,#059669)"
                  : "linear-gradient(180deg,#f59e0b,#d97706)"
              }
            />
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[
                { label: "Peak (period)", value: Math.max(...(period === "daily" ? daily : period === "weekly" ? weekly : monthly).map(p => p.count)), accent: "#6366f1" },
                { label: "Average / period", value: Math.round((period === "daily" ? daily : period === "weekly" ? weekly : monthly).reduce((a, p) => a + p.count, 0) / Math.max((period === "daily" ? daily : period === "weekly" ? weekly : monthly).length, 1)), accent: "#10b981" },
                { label: "Total in range", value: (period === "daily" ? daily : period === "weekly" ? weekly : monthly).reduce((a, p) => a + p.count, 0), accent: "#f59e0b" },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "center", padding: 10, background: "#f8fafc", borderRadius: 8 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.accent }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Countries table */}
          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                Visitors by Country
                <span style={{ marginLeft: 8, fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>
                  ({byCountryAll.length} countries)
                </span>
              </h2>
              {byCountryAll.length > 10 && (
                <button
                  onClick={() => setShowAllCountries((v) => !v)}
                  style={{ fontSize: 11, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                >
                  {showAllCountries ? "Show top 10" : `Show all ${byCountryAll.length}`}
                </button>
              )}
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    {["#", "Country", "Visitors", "Share", ""].map((h) => (
                      <th key={h} style={{ padding: "8px 16px", textAlign: "left", fontWeight: 600, color: "#64748b", whiteSpace: "nowrap", fontSize: 11 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(showAllCountries ? byCountryAll : byCountryAll.slice(0, 10)).map((c, i) => {
                    const pct = meta.totalVisitors > 0 ? ((c.count / meta.totalVisitors) * 100).toFixed(1) : "0.0";
                    return (
                      <tr key={c.label} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={{ padding: "8px 16px", color: "#94a3b8", fontWeight: 700, width: 40 }}>{i + 1}</td>
                        <td style={{ padding: "8px 16px", whiteSpace: "nowrap" }}>
                          <span style={{ fontSize: 18, marginRight: 8 }}>{countryFlag(c.label)}</span>
                          <span style={{ fontWeight: 600, color: "#0f172a" }}>{c.label || "Unknown"}</span>
                        </td>
                        <td style={{ padding: "8px 16px", fontWeight: 700, color: "#1e293b" }}>{c.count.toLocaleString()}</td>
                        <td style={{ padding: "8px 16px", minWidth: 120 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, background: "#e2e8f0", borderRadius: 4, height: 6 }}>
                              <div style={{
                                width: `${pct}%`,
                                background: "linear-gradient(90deg,#3b82f6,#1d4ed8)",
                                borderRadius: 4, height: 6,
                                transition: "width 0.6s ease",
                              }} />
                            </div>
                            <span style={{ fontSize: 11, color: "#64748b", minWidth: 36 }}>{pct}%</span>
                          </div>
                        </td>
                        <td style={{ padding: "8px 16px" }}>
                          {i === 0 && <span style={{ background: "#fef3c7", color: "#92400e", borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>TOP</span>}
                        </td>
                      </tr>
                    );
                  })}
                  {byCountryAll.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No country data yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

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
