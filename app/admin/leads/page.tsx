import { prisma } from "@/lib/prisma";
import React from "react";

type SP = {
  q?: string;
  filter?: string;
  start?: string;
  end?: string;
};

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildDateRange(start?: string, end?: string) {
  const range: { gte?: Date; lte?: Date } = {};
  if (start) {
    const d = new Date(start);
    if (!Number.isNaN(d.valueOf())) range.gte = d;
  }
  if (end) {
    const d = new Date(end);
    if (!Number.isNaN(d.valueOf())) {
      d.setHours(23, 59, 59, 999);
      range.lte = d;
    }
  }
  return Object.keys(range).length ? range : null;
}

function buildWhere(sp: SP) {
  const q = sp.q?.trim();
  const filter = (sp.filter || "all").toLowerCase();
  const where: any = {};

  if (q) {
    where.OR = [
      { id: { contains: q } },
      { fullName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { clicks: { some: { clickId: { contains: q } } } },
    ];
  }

  const range = buildDateRange(sp.start, sp.end);
  if (range) where.createdAt = range;

  if (filter === "hot") {
    where.qualityScore = { gte: 60 };
    where.session = { events: { some: { name: "continue_clicked" } } };
  }

  if (filter === "no_click_yet") {
    where.session = { events: { none: { name: "continue_clicked" } } };
  }

  if (filter === "clicked_no_conversion") {
    where.session = { events: { some: { name: "continue_clicked" } } };
    where.clicks = { none: { conversions: { some: {} } } };
  }

  return where;
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const where = buildWhere(sp);
  const today = startOfToday();

  const [leads, total, todayLeads, todayConverted] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 500,
      select: {
        id: true,
        createdAt: true,
        fullName: true,
        email: true,
        phone: true,
        country: true,
        qualityScore: true,
        qualityTier: true,
        session: {
          select: {
            events: {
              where: { name: { in: ["continue_clicked", "click_attached"] } },
              select: { name: true },
            },
          },
        },
        clicks: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            clickId: true,
            sub1: true,
            conversions: {
              orderBy: { receivedAt: "desc" },
              take: 1,
              select: { status: true, receivedAt: true },
            },
          },
        },
      },
    }),
    prisma.lead.count({ where }),
    prisma.lead.count({ where: { createdAt: { gte: today } } }),
    prisma.conversion.count({ where: { receivedAt: { gte: today } } }),
  ]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat title="Results" value={String(total)} />
        <Stat title="Today Leads" value={String(todayLeads)} />
        <Stat title="Today Conversions" value={String(todayConverted)} />
        <Stat
          title="Today CR"
          value={todayLeads ? `${Math.round((todayConverted / todayLeads) * 100)}%` : "0%"}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FiltersBar q={sp.q || ""} filter={sp.filter || "all"} start={sp.start || ""} end={sp.end || ""} />
        <DownloadButton q={sp.q} filter={sp.filter} start={sp.start} end={sp.end} />
      </div>

      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: "#fff", border: "1px solid #e5e7eb" }}
      >
        <table className="w-full text-sm">
          <thead style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
            <tr>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: "#6b7280" }}>Lead</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: "#6b7280" }}>Contact</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: "#6b7280" }}>Country</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: "#6b7280" }}>Status</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: "#6b7280" }}>Score</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: "#6b7280" }}>Created</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: "#6b7280" }}>Converted</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => {
              const latestClick = l.clicks?.[0];
              const latestConversion = latestClick?.conversions?.[0];
              const didContinue = l.session?.events?.some((e) => e.name === "continue_clicked") ?? false;
              const didClickOut = l.session?.events?.some((e) => e.name === "click_attached") ?? false;
              const isConverted = !!latestConversion;
              const status = isConverted ? "converted" : didContinue ? "continued" : "lead_created";

              return (
                <tr
                  key={l.id}
                  className="transition-colors hover:bg-gray-50"
                  style={{ borderTop: "1px solid #f3f4f6" }}
                >
                  <td className="px-4 py-3.5">
                    <a className="font-medium hover:underline" style={{ color: "#d97706" }} href={`/admin/leads/${l.id}`}>
                      {l.fullName || l.id.slice(0, 10) + "..."}
                    </a>
                    <div className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                      click: {latestClick?.clickId?.slice(0, 10) || "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div style={{ color: "#111827" }}>{l.email || "-"}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#6b7280" }}>{l.phone || "-"}</div>
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: "#374151" }}>
                    {l.country || "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <Pill kind={status === "converted" ? "good" : status === "continued" ? "mid" : "low"}>
                      {status}
                    </Pill>
                    {didClickOut ? (
                      <div className="mt-1 text-xs" style={{ color: "#9ca3af" }}>click-out</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3.5">
                    <span style={{ color: "#111827" }}>{l.qualityScore ?? "-"}</span>
                    {l.qualityTier === "hot" ? (
                      <span
                        className="ml-2 rounded-full px-2 py-0.5 text-xs"
                        style={{ background: "#fef3c7", color: "#d97706", border: "1px solid #fcd34d" }}
                      >
                        HOT
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3.5 text-xs" style={{ color: "#6b7280" }}>
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-xs" style={{ color: "#6b7280" }}>
                    {latestConversion?.receivedAt ? new Date(latestConversion.receivedAt).toLocaleString() : "-"}
                  </td>
                </tr>
              );
            })}
            {!leads.length ? (
              <tr>
                <td className="px-4 py-12 text-center text-sm" style={{ color: "#9ca3af" }} colSpan={7}>
                  No leads found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="text-xs" style={{ color: "#9ca3af" }}>
        Showing latest{" "}
        <span className="font-semibold" style={{ color: "#6b7280" }}>500</span>{" "}
        results. Use <strong>Download CSV</strong> to export all filtered leads.
      </div>
    </div>
  );
}

function DownloadButton({ q, filter, start, end }: { q?: string; filter?: string; start?: string; end?: string }) {
  const params = new URLSearchParams();
  if (q)      params.set("q",      q);
  if (filter) params.set("filter", filter);
  if (start)  params.set("start",  start);
  if (end)    params.set("end",    end);

  const csvHref   = `/api/admin/leads/export?${params.toString()}`;
  const excelHref = `/api/admin/leads/export?format=excel&${params.toString()}`;

  return (
    <div className="flex items-center gap-2 shrink-0">
      <a
        href={csvHref}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
        style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)", textDecoration: "none" }}
      >
        ⬇ CSV
      </a>
      <a
        href={excelHref}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
        style={{ background: "linear-gradient(135deg,#166534,#15803d)", textDecoration: "none" }}
      >
        ⬇ Excel
      </a>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "#fff", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div className="text-xs uppercase tracking-widest" style={{ color: "#9ca3af" }}>{title}</div>
      <div className="mt-1.5 text-2xl font-black" style={{ color: "#d97706" }}>{value}</div>
    </div>
  );
}

function Pill({ kind, children }: { kind: "good" | "mid" | "low"; children: React.ReactNode }) {
  const style =
    kind === "good"
      ? { background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" }
      : kind === "mid"
      ? { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" }
      : { background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" };
  return (
    <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" style={style}>
      {children}
    </span>
  );
}

function FiltersBar({
  q,
  filter,
  start,
  end,
}: {
  q: string;
  filter: string;
  start: string;
  end: string;
}) {
  return (
    <form className="flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap" action="/admin/leads">
      <input
        name="q"
        defaultValue={q}
        placeholder="Search name, email, phone, clickId..."
        className="w-full md:w-[380px] rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
        style={{ background: "#fff", border: "1px solid #d1d5db" }}
      />
      <select
        name="filter"
        defaultValue={filter}
        className="rounded-xl px-4 py-2.5 text-sm focus:outline-none"
        style={{ background: "#fff", border: "1px solid #d1d5db", color: "#374151" }}
      >
        <option value="all">All leads</option>
        <option value="hot">HOT only</option>
        <option value="no_click_yet">No click yet</option>
        <option value="clicked_no_conversion">Clicked, no conversion</option>
      </select>
      <input
        type="date"
        name="start"
        defaultValue={start}
        className="rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none"
        style={{ background: "#fff", border: "1px solid #d1d5db" }}
      />
      <input
        type="date"
        name="end"
        defaultValue={end}
        className="rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none"
        style={{ background: "#fff", border: "1px solid #d1d5db" }}
      />
      <button
        className="rounded-xl px-5 py-2.5 text-sm font-bold text-white"
        style={{ background: "linear-gradient(135deg,#f0a500,#d4840a)" }}
      >
        Apply
      </button>
      <a
        className="rounded-xl px-5 py-2.5 text-sm"
        style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", color: "#6b7280" }}
        href="/admin/leads"
      >
        Reset
      </a>
    </form>
  );
}
