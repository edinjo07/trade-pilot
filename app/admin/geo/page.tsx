"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/* ─── Country list ─────────────────────────────────────────────────────────── */
const COUNTRIES: { code: string; name: string }[] = [
  { code: "AD", name: "Andorra" }, { code: "AE", name: "UAE" },
  { code: "AF", name: "Afghanistan" }, { code: "AG", name: "Antigua & Barbuda" },
  { code: "AL", name: "Albania" }, { code: "AM", name: "Armenia" },
  { code: "AO", name: "Angola" }, { code: "AR", name: "Argentina" },
  { code: "AT", name: "Austria" }, { code: "AU", name: "Australia" },
  { code: "AZ", name: "Azerbaijan" }, { code: "BA", name: "Bosnia" },
  { code: "BB", name: "Barbados" }, { code: "BD", name: "Bangladesh" },
  { code: "BE", name: "Belgium" }, { code: "BF", name: "Burkina Faso" },
  { code: "BG", name: "Bulgaria" }, { code: "BH", name: "Bahrain" },
  { code: "BJ", name: "Benin" }, { code: "BN", name: "Brunei" },
  { code: "BO", name: "Bolivia" }, { code: "BR", name: "Brazil" },
  { code: "BS", name: "Bahamas" }, { code: "BT", name: "Bhutan" },
  { code: "BW", name: "Botswana" }, { code: "BY", name: "Belarus" },
  { code: "BZ", name: "Belize" }, { code: "CA", name: "Canada" },
  { code: "CD", name: "DR Congo" }, { code: "CF", name: "Central African Rep." },
  { code: "CG", name: "Congo" }, { code: "CH", name: "Switzerland" },
  { code: "CI", name: "Côte d'Ivoire" }, { code: "CL", name: "Chile" },
  { code: "CM", name: "Cameroon" }, { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" }, { code: "CR", name: "Costa Rica" },
  { code: "CU", name: "Cuba" }, { code: "CV", name: "Cape Verde" },
  { code: "CY", name: "Cyprus" }, { code: "CZ", name: "Czechia" },
  { code: "DE", name: "Germany" }, { code: "DJ", name: "Djibouti" },
  { code: "DK", name: "Denmark" }, { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" }, { code: "DZ", name: "Algeria" },
  { code: "EC", name: "Ecuador" }, { code: "EE", name: "Estonia" },
  { code: "EG", name: "Egypt" }, { code: "ER", name: "Eritrea" },
  { code: "ES", name: "Spain" }, { code: "ET", name: "Ethiopia" },
  { code: "FI", name: "Finland" }, { code: "FJ", name: "Fiji" },
  { code: "FR", name: "France" }, { code: "GA", name: "Gabon" },
  { code: "GB", name: "United Kingdom" }, { code: "GD", name: "Grenada" },
  { code: "GE", name: "Georgia" }, { code: "GH", name: "Ghana" },
  { code: "GM", name: "Gambia" }, { code: "GN", name: "Guinea" },
  { code: "GQ", name: "Equatorial Guinea" }, { code: "GR", name: "Greece" },
  { code: "GT", name: "Guatemala" }, { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" }, { code: "HN", name: "Honduras" },
  { code: "HR", name: "Croatia" }, { code: "HT", name: "Haiti" },
  { code: "HU", name: "Hungary" }, { code: "ID", name: "Indonesia" },
  { code: "IE", name: "Ireland" }, { code: "IL", name: "Israel" },
  { code: "IN", name: "India" }, { code: "IQ", name: "Iraq" },
  { code: "IR", name: "Iran" }, { code: "IS", name: "Iceland" },
  { code: "IT", name: "Italy" }, { code: "JM", name: "Jamaica" },
  { code: "JO", name: "Jordan" }, { code: "JP", name: "Japan" },
  { code: "KE", name: "Kenya" }, { code: "KG", name: "Kyrgyzstan" },
  { code: "KH", name: "Cambodia" }, { code: "KI", name: "Kiribati" },
  { code: "KM", name: "Comoros" }, { code: "KN", name: "St Kitts" },
  { code: "KP", name: "North Korea" }, { code: "KR", name: "South Korea" },
  { code: "KW", name: "Kuwait" }, { code: "KZ", name: "Kazakhstan" },
  { code: "LA", name: "Laos" }, { code: "LB", name: "Lebanon" },
  { code: "LC", name: "St Lucia" }, { code: "LI", name: "Liechtenstein" },
  { code: "LK", name: "Sri Lanka" }, { code: "LR", name: "Liberia" },
  { code: "LS", name: "Lesotho" }, { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" }, { code: "LV", name: "Latvia" },
  { code: "LY", name: "Libya" }, { code: "MA", name: "Morocco" },
  { code: "MC", name: "Monaco" }, { code: "MD", name: "Moldova" },
  { code: "ME", name: "Montenegro" }, { code: "MG", name: "Madagascar" },
  { code: "MK", name: "North Macedonia" }, { code: "ML", name: "Mali" },
  { code: "MM", name: "Myanmar" }, { code: "MN", name: "Mongolia" },
  { code: "MR", name: "Mauritania" }, { code: "MT", name: "Malta" },
  { code: "MU", name: "Mauritius" }, { code: "MV", name: "Maldives" },
  { code: "MW", name: "Malawi" }, { code: "MX", name: "Mexico" },
  { code: "MY", name: "Malaysia" }, { code: "MZ", name: "Mozambique" },
  { code: "NA", name: "Namibia" }, { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" }, { code: "NI", name: "Nicaragua" },
  { code: "NL", name: "Netherlands" }, { code: "NO", name: "Norway" },
  { code: "NP", name: "Nepal" }, { code: "NR", name: "Nauru" },
  { code: "NZ", name: "New Zealand" }, { code: "OM", name: "Oman" },
  { code: "PA", name: "Panama" }, { code: "PE", name: "Peru" },
  { code: "PG", name: "Papua New Guinea" }, { code: "PH", name: "Philippines" },
  { code: "PK", name: "Pakistan" }, { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" }, { code: "PW", name: "Palau" },
  { code: "PY", name: "Paraguay" }, { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" }, { code: "RS", name: "Serbia" },
  { code: "RU", name: "Russia" }, { code: "RW", name: "Rwanda" },
  { code: "SA", name: "Saudi Arabia" }, { code: "SB", name: "Solomon Islands" },
  { code: "SC", name: "Seychelles" }, { code: "SD", name: "Sudan" },
  { code: "SE", name: "Sweden" }, { code: "SG", name: "Singapore" },
  { code: "SI", name: "Slovenia" }, { code: "SK", name: "Slovakia" },
  { code: "SL", name: "Sierra Leone" }, { code: "SM", name: "San Marino" },
  { code: "SN", name: "Senegal" }, { code: "SO", name: "Somalia" },
  { code: "SR", name: "Suriname" }, { code: "SS", name: "South Sudan" },
  { code: "ST", name: "São Tomé" }, { code: "SV", name: "El Salvador" },
  { code: "SY", name: "Syria" }, { code: "SZ", name: "Eswatini" },
  { code: "TD", name: "Chad" }, { code: "TG", name: "Togo" },
  { code: "TH", name: "Thailand" }, { code: "TJ", name: "Tajikistan" },
  { code: "TL", name: "Timor-Leste" }, { code: "TM", name: "Turkmenistan" },
  { code: "TN", name: "Tunisia" }, { code: "TO", name: "Tonga" },
  { code: "TR", name: "Turkey" }, { code: "TT", name: "Trinidad & Tobago" },
  { code: "TV", name: "Tuvalu" }, { code: "TZ", name: "Tanzania" },
  { code: "UA", name: "Ukraine" }, { code: "UG", name: "Uganda" },
  { code: "US", name: "United States" }, { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" }, { code: "VA", name: "Vatican" },
  { code: "VC", name: "St Vincent" }, { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" }, { code: "VU", name: "Vanuatu" },
  { code: "WS", name: "Samoa" }, { code: "YE", name: "Yemen" },
  { code: "ZA", name: "South Africa" }, { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
];

function flag(code: string) {
  if (!code || code.length !== 2) return "🌍";
  const cp = [...code.toUpperCase()].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0));
  return String.fromCodePoint(...cp);
}

type Mode = "all" | "whitelist" | "blacklist";

interface Config { mode: Mode; countries: string[]; updatedAt: string | null }

const MODE_INFO = {
  all:       { label: "Public — All Countries",        color: "#10b981", desc: "Funnel is accessible from every country." },
  whitelist: { label: "Whitelist — Selected Only",     color: "#3b82f6", desc: "Only visitors from the listed countries can access the funnel." },
  blacklist: { label: "Blacklist — Block Selected",    color: "#ef4444", desc: "Visitors from the listed countries are redirected to /restricted." },
};

export default function GeoPage() {
  const [config, setConfig]   = useState<Config | null>(null);
  const [mode, setMode]       = useState<Mode>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState<string | null>(null);

  /* ── Load current config ── */
  useEffect(() => {
    fetch("/api/admin/geo-config", { credentials: "include" })
      .then((r) => r.json())
      .then((data: Config) => {
        setConfig(data);
        setMode(data.mode as Mode);
        setSelected(new Set(data.countries));
      })
      .catch(() => setError("Failed to load config"))
      .finally(() => setLoading(false));
  }, []);

  /* ── Save ── */
  const save = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/admin/geo-config", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, countries: [...selected] }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as Config;
      setConfig(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }, [mode, selected]);

  /* ── Toggle a country ── */
  const toggle = (code: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  /* ── Filtered country list ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q
      ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
      : COUNTRIES;
  }, [search]);

  /* ── Quick selectors ── */
  const PRESETS: { label: string; codes: string[] }[] = [
    { label: "TIER-1", codes: ["US","GB","CA","AU","NZ","IE"] },
    { label: "EU",     codes: ["DE","FR","NL","SE","NO","DK","FI","BE","AT","CH","ES","IT","PT","PL","CZ","HU","RO","GR","SK","SI","LV","LT","EE","CY","LU","MT"] },
    { label: "GCC",    codes: ["AE","SA","KW","QA","BH","OM"] },
    { label: "APAC",   codes: ["SG","HK","JP","KR","MY","TH","ID","PH","AU","NZ","IN"] },
  ];

  /* ── Shared card style ── */
  const card: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "20px 24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  };

  if (loading) return <div style={{ paddingTop: 40, textAlign: "center", color: "#94a3b8" }}>Loading…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Geo Restriction</h1>
          <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
            Control which countries can access the funnel. Changes apply within ~60 seconds.
            {config?.updatedAt && (
              <> Last saved {new Date(config.updatedAt).toLocaleString()}.</>
            )}
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          style={{
            background: saved ? "#10b981" : "linear-gradient(135deg,#1e40af,#3b82f6)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 28px",
            fontSize: 14,
            fontWeight: 700,
            cursor: saving ? "wait" : "pointer",
            opacity: saving ? 0.7 : 1,
            minWidth: 120,
          }}
        >
          {saving ? "Saving…" : saved ? "✓ Saved" : "Save"}
        </button>
      </div>

      {error && (
        <div style={{ ...card, borderLeft: "4px solid #ef4444", color: "#dc2626", fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* ── Mode selector ── */}
      <div style={card}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 14, marginTop: 0 }}>
          Access Mode
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {(Object.entries(MODE_INFO) as [Mode, typeof MODE_INFO["all"]][]).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              style={{
                textAlign: "left",
                padding: "14px 16px",
                borderRadius: 10,
                border: `2px solid ${mode === key ? info.color : "#e2e8f0"}`,
                background: mode === key ? `${info.color}0f` : "#f8fafc",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{
                  width: 12, height: 12, borderRadius: "50%",
                  background: mode === key ? info.color : "#cbd5e1",
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: mode === key ? info.color : "#475569" }}>
                  {info.label}
                </span>
              </div>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>
                {info.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Country selector (only shown for whitelist / blacklist) ── */}
      {mode !== "all" && (
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          {/* header */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                {mode === "whitelist" ? "Allowed Countries" : "Blocked Countries"}
                <span style={{
                  marginLeft: 8, fontSize: 11, fontWeight: 600,
                  background: MODE_INFO[mode].color + "20",
                  color: MODE_INFO[mode].color,
                  borderRadius: 20, padding: "2px 8px",
                }}>
                  {selected.size} selected
                </span>
              </h2>
            </div>
            {/* Preset buttons */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setSelected((prev) => {
                      const next = new Set(prev);
                      const allSelected = p.codes.every((c) => next.has(c));
                      if (allSelected) p.codes.forEach((c) => next.delete(c));
                      else p.codes.forEach((c) => next.add(c));
                      return next;
                    });
                  }}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    border: "1px solid #e2e8f0",
                    background: "#f1f5f9",
                    color: "#475569",
                    cursor: "pointer",
                    letterSpacing: "0.04em",
                  }}
                >
                  {p.label}
                </button>
              ))}
              <button
                onClick={() => setSelected(new Set())}
                style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", cursor: "pointer" }}
              >
                Clear
              </button>
              <button
                onClick={() => setSelected(new Set(COUNTRIES.map((c) => c.code)))}
                style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#15803d", cursor: "pointer" }}
              >
                All
              </button>
            </div>
          </div>

          {/* Search */}
          <div style={{ padding: "12px 20px", borderBottom: "1px solid #f1f5f9" }}>
            <input
              type="text"
              placeholder="Search country…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 13,
                color: "#1e293b",
                outline: "none",
                background: "#f8fafc",
              }}
            />
          </div>

          {/* Selected chips */}
          {selected.size > 0 && (
            <div style={{ padding: "10px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[...selected].sort().map((code) => {
                const c = COUNTRIES.find((x) => x.code === code);
                return (
                  <span
                    key={code}
                    onClick={() => toggle(code)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background: MODE_INFO[mode].color + "15",
                      border: `1px solid ${MODE_INFO[mode].color}40`,
                      color: MODE_INFO[mode].color,
                      cursor: "pointer",
                    }}
                  >
                    {flag(code)} {c?.name ?? code}
                    <span style={{ fontSize: 14, marginLeft: 2, opacity: 0.7 }}>×</span>
                  </span>
                );
              })}
            </div>
          )}

          {/* Country grid */}
          <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 4, maxHeight: 380, overflowY: "auto" }}>
            {filtered.map((c) => {
              const on = selected.has(c.code);
              return (
                <button
                  key={c.code}
                  onClick={() => toggle(c.code)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 10px",
                    borderRadius: 8,
                    border: `1px solid ${on ? MODE_INFO[mode].color + "50" : "#f1f5f9"}`,
                    background: on ? MODE_INFO[mode].color + "0f" : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.1s",
                  }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{flag(c.code)}</span>
                  <span style={{ fontSize: 12, color: on ? "#0f172a" : "#475569", fontWeight: on ? 700 : 400, flex: 1 }}>
                    {c.name}
                  </span>
                  <span style={{ fontSize: 10, color: on ? MODE_INFO[mode].color : "#94a3b8", flexShrink: 0 }}>{c.code}</span>
                  {on && (
                    <span style={{ fontSize: 11, color: MODE_INFO[mode].color, flexShrink: 0 }}>✓</span>
                  )}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#94a3b8", fontSize: 13, padding: 20 }}>
                No countries match &ldquo;{search}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Preview ── */}
      <div style={{ ...card, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
        <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
          <strong style={{ color: "#0f172a" }}>Current rule: </strong>
          {mode === "all" && "All countries can access the funnel."}
          {mode === "whitelist" && selected.size === 0 && "⚠️ Whitelist mode with no countries selected — all traffic will be blocked!"}
          {mode === "whitelist" && selected.size > 0 && (
            <>Only <strong>{selected.size} {selected.size === 1 ? "country" : "countries"}</strong> can access the funnel: {[...selected].sort().map((code) => `${flag(code)} ${code}`).join("  ")}</>
          )}
          {mode === "blacklist" && selected.size === 0 && "Blacklist mode with no countries selected — effectively public for all."}
          {mode === "blacklist" && selected.size > 0 && (
            <><strong>{selected.size} {selected.size === 1 ? "country" : "countries"}</strong> will be redirected to /restricted: {[...selected].sort().map((code) => `${flag(code)} ${code}`).join("  ")}</>
          )}
        </p>
      </div>

    </div>
  );
}
