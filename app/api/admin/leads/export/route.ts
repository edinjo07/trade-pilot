/**
 * GET /api/admin/leads/export?format=csv&filter=all&start=...&end=...&q=...
 *
 * Downloads all leads (with funnel answers + attribution) as CSV.
 * Admin-protected.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";

function esc(v: unknown): string {
  if (v == null) return "";
  const s = String(v).replace(/"/g, '""');
  return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
}

function row(cells: unknown[]): string {
  return cells.map(esc).join(",");
}

function buildWhere(q?: string, filter?: string, start?: string, end?: string) {
  const where: Record<string, unknown> = {};

  if (q?.trim()) {
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { email:    { contains: q, mode: "insensitive" } },
      { phone:    { contains: q } },
    ];
  }

  const range: Record<string, Date> = {};
  if (start) { const d = new Date(start); if (!isNaN(d.valueOf())) range.gte = d; }
  if (end)   { const d = new Date(end);   if (!isNaN(d.valueOf())) { d.setHours(23,59,59,999); range.lte = d; } }
  if (Object.keys(range).length) where.createdAt = range;

  if (filter === "hot") {
    where.qualityScore = { gte: 60 };
  }
  if (filter === "converted") {
    where.clicks = { some: { conversions: { some: {} } } };
  }

  return where;
}

export async function GET(req: Request) {
  const auth = await requireAdminSession(req);
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = new URL(req.url).searchParams;
  const format = sp.get("format") ?? "csv";
  const filter = sp.get("filter") ?? "all";
  const q      = sp.get("q") ?? undefined;
  const start  = sp.get("start") ?? undefined;
  const end    = sp.get("end") ?? undefined;

  const where = buildWhere(q, filter, start, end);

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 5000,
    include: {
      session: true,
      clicks: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          conversions: {
            orderBy: { receivedAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  // ── CSV ───────────────────────────────────────────────────────────────────
  const headers = [
    // Identity
    "id", "createdAt", "fullName", "firstName", "lastName",
    "email", "phone", "country",

    // Quality
    "qualityScore", "qualityTier",
    "disposableEmail", "phoneCountryOk", "notes",

    // Funnel answers
    "entryChoice", "frameChoice", "simAction", "simTimeTakenMs",
    "quizQuestionsCount", "avoidanceType", "responsibilityScore",
    "mirrorCount",

    // Attribution
    "clickId", "offerKey", "sub1", "sub2", "sub3", "sub4",

    // Conversion
    "conversionStatus", "conversionPayout", "conversionCurrency",
    "conversionKey", "conversionTxid", "convertedAt",
  ];

  const lines: string[] = [headers.join(",")];

  for (const l of leads) {
    const click = l.clicks?.[0];
    const conv  = click?.conversions?.[0];
    const sess  = l.session;

    lines.push(row([
      l.id,
      l.createdAt.toISOString(),
      l.fullName,
      l.firstName,
      l.lastName,
      l.email,
      l.phone,
      l.country,

      l.qualityScore,
      l.qualityTier,
      l.disposableEmail,
      l.phoneCountryOk,
      l.notes ?? "",

      sess?.entryChoice ?? "",
      sess?.frameChoice ?? "",
      sess?.simAction ?? "",
      sess?.simTimeTakenMs ?? "",
      sess?.quizQuestionsCount ?? "",
      sess?.avoidanceType ?? "",
      sess?.responsibilityScore ?? "",
      sess?.mirrorCount ?? "",

      click?.clickId ?? "",
      click?.offerKey ?? "",
      click?.sub1 ?? "",
      click?.sub2 ?? "",
      click?.sub3 ?? "",
      click?.sub4 ?? "",

      conv?.status ?? "",
      conv?.payout ?? "",
      conv?.currency ?? "",
      conv?.conversionKey ?? "",
      conv?.txid ?? "",
      conv?.receivedAt?.toISOString() ?? "",
    ]));
  }

  const dateStr = new Date().toISOString().slice(0, 10);

  // ── Excel (SpreadsheetML XML — opens natively in Excel as .xls) ───────────
  if (format === "excel") {
    function xmlEsc(v: unknown): string {
      return String(v ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }
    function xlCell(v: unknown): string {
      const s = String(v ?? "");
      const num = Number(s);
      const isNum = s !== "" && !isNaN(num) && !/^0\d/.test(s) && !/^[+\-]?\d{10,}$/.test(s);
      return isNum
        ? `<Cell><Data ss:Type="Number">${xmlEsc(s)}</Data></Cell>`
        : `<Cell><Data ss:Type="String">${xmlEsc(s)}</Data></Cell>`;
    }
    function xlRow(cells: unknown[]): string {
      return `<Row>${cells.map(xlCell).join("")}</Row>`;
    }

    const dataRows = leads.map((l) => {
      const click = l.clicks?.[0];
      const conv  = click?.conversions?.[0];
      const sess  = l.session;
      return [
        l.id, l.createdAt.toISOString(),
        l.fullName, l.firstName, l.lastName, l.email, l.phone, l.country,
        l.qualityScore, l.qualityTier,
        sess?.entryChoice ?? "", sess?.frameChoice ?? "",
        click?.clickId ?? "", click?.offerKey ?? "",
        click?.sub1 ?? "", click?.sub2 ?? "", click?.sub3 ?? "", click?.sub4 ?? "",
        conv?.status ?? "", conv?.payout ?? "", conv?.currency ?? "",
        conv?.receivedAt?.toISOString() ?? "",
      ];
    });

    const xml = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">`,
      `<Worksheet ss:Name="Leads"><Table>`,
      xlRow(headers),
      ...dataRows.map(xlRow),
      `</Table></Worksheet></Workbook>`,
    ].join("\n");

    return new Response(xml, {
      headers: {
        "Content-Type": "application/vnd.ms-excel; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads-${dateStr}.xls"`,
      },
    });
  }

  // ── CSV (default) ─────────────────────────────────────────────────────────
  const csv = "\uFEFF" + lines.join("\r\n"); // BOM for correct UTF-8 in Excel

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${dateStr}.csv"`,
    },
  });
}
