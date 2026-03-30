"use client";

/**
 * RiskDisclaimer
 * Reusable compliance bar shown on every section that displays profit figures.
 * Includes regulatory authority badges and mandatory risk warning.
 */
import { useT } from "@/components/LocaleProvider";

interface Props {
  /** Compact single-line variant (default false = full two-line card) */
  compact?: boolean;
}

const REGULATORS = [
  {
    code: "CySEC",
    label: "CySEC",
    subtitle: "Cyprus Securities & Exchange Commission",
    color: "#1d4ed8",
    bg: "rgba(29,78,216,0.08)",
    border: "rgba(29,78,216,0.20)",
  },
  {
    code: "FCA",
    label: "FCA",
    subtitle: "Financial Conduct Authority (UK)",
    color: "#15803d",
    bg: "rgba(21,128,61,0.08)",
    border: "rgba(21,128,61,0.20)",
  },
  {
    code: "CONSOB",
    label: "CONSOB",
    subtitle: "Commissione Nazionale per le Societa e la Borsa (Italy)",
    color: "#b45309",
    bg: "rgba(180,83,9,0.08)",
    border: "rgba(180,83,9,0.20)",
  },
  {
    code: "FINMA",
    label: "FINMA",
    subtitle: "Swiss Financial Market Supervisory Authority",
    color: "#6d28d9",
    bg: "rgba(109,40,217,0.08)",
    border: "rgba(109,40,217,0.20)",
  },
];

export default function RiskDisclaimer({ compact = false }: Props) {
  const t = useT();
  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-2">
        <span className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold">
          <span>⚠️</span>
          <span>{t.risk_compact}</span>
        </span>
        <span className="flex items-center gap-1.5">
          {REGULATORS.map((r) => (
            <span
              key={r.code}
              className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
              style={{ background: r.bg, border: `1px solid ${r.border}`, color: r.color }}
            >
              {r.label}
            </span>
          ))}
        </span>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl px-4 py-4 space-y-3"
      style={{
        background: "rgba(251,191,36,0.05)",
        border: "1px solid rgba(251,191,36,0.18)",
      }}
    >
      {/* Risk warning */}
      <div className="flex items-start gap-2">
        <span className="text-amber-500 text-base shrink-0 mt-0.5">⚠️</span>
        <p className="text-xs leading-relaxed text-gray-500">
          <span className="font-bold text-gray-700">{t.risk_label} </span>
          {t.risk_body}
        </p>
      </div>

      {/* Regulator badges */}
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">
          {t.risk_regulated_by}
        </p>
        <div className="flex flex-wrap gap-2">
          {REGULATORS.map((r) => (
            <div
              key={r.code}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
              style={{ background: r.bg, border: `1px solid ${r.border}` }}
            >
              <span
                className="text-[11px] font-extrabold uppercase tracking-widest"
                style={{ color: r.color }}
              >
                {r.label}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-gray-400 leading-relaxed">
          CySEC (Cyprus) · FCA (United Kingdom) · CONSOB (Italy) · FINMA (Switzerland).
          TradePilot operates through regulated broker partners. Regulation details available on request.
        </p>
      </div>
    </div>
  );
}
