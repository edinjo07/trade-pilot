// components/AdminLeadsTable.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { getJSON } from "@/lib/apiClient";
import type { LeadRow } from "@/lib/leadTypes";

type FilterMode = "ALL" | "HOT" | "NO_CLICK_YET" | "CLICKED_NO_CONV";

export function AdminLeadsTable() {
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [filter, setFilter] = useState<FilterMode>("ALL");

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const res = await getJSON<{ ok: true; leads: LeadRow[] }>("/api/leads");
      setRows(res.leads || []);
    } catch (e: any) {
      setErr(e?.message || "ERROR");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "ALL") return rows;

    if (filter === "HOT") {
      return rows.filter((r) => (r.isHot ?? false) || (r.qualityScore ?? 0) >= 70);
    }

    if (filter === "NO_CLICK_YET") {
      // "people who didn't proceed" = didn't continue + didn't click out
      return rows.filter((r) => !(r.didContinue ?? false) && !(r.didClickOut ?? false));
    }

    if (filter === "CLICKED_NO_CONV") {
      // if you later add r.didConvert, replace this condition
      return rows.filter((r) => (r.didClickOut ?? false) && !((r.isHot ?? false) || (r.qualityScore ?? 0) >= 70));
    }

    return rows;
  }, [rows, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterMode)}
        >
          <option value="ALL">All</option>
          <option value="HOT">Show only HOT</option>
          <option value="NO_CLICK_YET">Show only "no click yet"</option>
          <option value="CLICKED_NO_CONV">Show only "clicked but no conversion"</option>
        </select>

        <button
          onClick={load}
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm hover:border-zinc-600"
        >
          Refresh
        </button>

        <div className="ml-auto text-xs text-zinc-400">
          Showing <span className="text-white">{filtered.length}</span> /{" "}
          {rows.length}
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-zinc-400">Loading…</div>
      ) : null}

      {err ? (
        <div className="rounded-xl border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          Error: {err}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950 text-zinc-300">
            <tr>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Lead</th>
              <th className="px-3 py-2">Contact</th>
              <th className="px-3 py-2">Score</th>
              <th className="px-3 py-2">Continue</th>
              <th className="px-3 py-2">Click out</th>
              <th className="px-3 py-2">ClickId</th>
              <th className="px-3 py-2">SubId</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-zinc-800">
                <td className="px-3 py-2 text-zinc-400">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td className="px-3 py-2">
                  {(r.firstName || "-") + " " + (r.lastName || "")}
                </td>
                <td className="px-3 py-2">
                  <div>{r.email || "-"}</div>
                  <div className="text-zinc-400">{r.phone || "-"}</div>
                </td>
                <td className="px-3 py-2">
                  <span className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1">
                    {r.qualityScore ?? 0}
                  </span>{" "}
                  {(r.isHot ?? false) ? (
                    <span className="ml-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-amber-200">
                      HOT
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2">
                  {(r.didContinue ?? false) ? "YES" : "NO"}
                </td>
                <td className="px-3 py-2">
                  {(r.didClickOut ?? false) ? "YES" : "NO"}
                </td>
                <td className="px-3 py-2 text-zinc-400">{r.clickId || "-"}</td>
                <td className="px-3 py-2 text-zinc-400">{r.subId || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
