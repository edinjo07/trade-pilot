import { prisma } from "@/lib/prisma";
import { NotesEditor } from "./NotesEditor";

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function safeParse(raw?: string | null) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [lead, crmDeliveries] = await Promise.all([
    prisma.lead.findUnique({
      where: { id },
      include: {
        session: {
          include: {
            events: { orderBy: { createdAt: "asc" } },
          },
        },
        clicks: {
          orderBy: { createdAt: "desc" },
          include: { conversions: { orderBy: { receivedAt: "desc" } } },
        },
      },
    }) as any,
    prisma.crmDelivery.findMany({
      where: { leadId: id },
      orderBy: { createdAt: "desc" },
      include: { integration: { select: { name: true, platform: true } } },
    }) as any,
  ]);

  if (!lead) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-xl font-semibold text-gray-900">Not found</h1>
          <a className="underline text-gray-500" href="/admin/leads">Back</a>
        </div>
      </main>
    );
  }

  const meta = safeParse(lead.qualityMeta) ?? {};
  const latestClick = lead.clicks?.[0];
  const latestConversion = latestClick?.conversions?.[0];
  const postbackMeta = safeParse(latestConversion?.raw);
  const sess = lead.session;

  // Funnel answer rows
  const funnelAnswers = [
    { k: "Entry Choice",         v: sess?.entryChoice },
    { k: "Frame Choice",         v: sess?.frameChoice },
    { k: "Sim Action",           v: sess?.simAction },
    { k: "Sim Time (ms)",        v: sess?.simTimeTakenMs != null ? String(sess.simTimeTakenMs) : null },
    { k: "Quiz Questions",       v: sess?.quizQuestionsCount != null ? String(sess.quizQuestionsCount) : null },
    { k: "Avoidance Type",       v: sess?.avoidanceType },
    { k: "Responsibility Score", v: sess?.responsibilityScore != null ? String(sess.responsibilityScore) : null },
    { k: "Mirror Count",         v: sess?.mirrorCount != null ? String(sess.mirrorCount) : null },
    { k: "Funnel Step",          v: sess?.currentStep },
    { k: "Country (session)",    v: sess?.country },
  ].filter((r) => r.v);

  const statusColor: Record<string, React.CSSProperties> = {
    SENT:     { background: "#d1fae5", color: "#065f46" },
    PENDING:  { background: "#fef3c7", color: "#92400e" },
    FAILED:   { background: "#fee2e2", color: "#991b1b" },
    RETRYING: { background: "#e0f2fe", color: "#0369a1" },
  };

  return (
    <main className="min-h-screen p-6 bg-[#f8f9fc]">
      <div className="mx-auto w-full max-w-5xl space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <a className="text-sm underline text-gray-500 hover:text-gray-700" href="/admin/leads">
            ← Back to leads
          </a>
          <a
            href={`/api/admin/leads/export?q=${encodeURIComponent(lead.email || lead.id)}`}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)" }}
          >
            ⬇ Download this lead (CSV)
          </a>
        </div>

        {/* Top grid: Lead info + Attribution */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{lead.fullName}</h1>
                <p className="text-gray-500 mt-1 text-sm">Created: {fmtDate(lead.createdAt)}</p>
              </div>
              {lead.qualityTier === "hot" && (
                <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: "#fef3c7", color: "#d97706", border: "1px solid #fcd34d" }}>
                  🔥 HOT
                </span>
              )}
            </div>
            <div className="mt-4 grid gap-2.5 text-sm">
              <Field k="Email" v={lead.email} />
              <Field k="Phone" v={lead.phone} />
              <Field k="Country" v={lead.country} />
              <Field k="Quality" v={`${lead.qualityTier} — score ${lead.qualityScore}`} />
              <Field k="Disposable email" v={lead.disposableEmail ? "Yes ⚠️" : "No"} />
              <Field k="Phone country OK" v={lead.phoneCountryOk ? "Yes" : "No ⚠️"} />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Attribution</h2>
            <div className="grid gap-2.5 text-sm">
              <Field k="ClickId"  v={latestClick?.clickId} />
              <Field k="Sub1"     v={latestClick?.sub1} />
              <Field k="Sub2"     v={latestClick?.sub2} />
              <Field k="Sub3"     v={latestClick?.sub3} />
              <Field k="Sub4"     v={latestClick?.sub4} />
              <Field k="Offer"    v={latestClick?.offerKey} />
            </div>
          </div>
        </div>

        {/* Funnel Answers */}
        {funnelAnswers.length > 0 && (
          <Section title="Funnel Answers (Quiz Responses)">
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {funnelAnswers.map((a) => (
                <KV key={a.k} k={a.k} v={a.v!} highlight />
              ))}
            </div>
          </Section>
        )}

        {/* Quality signals */}
        {Object.keys(meta).length > 0 && (
          <Section title="Quality Signals">
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Object.entries(meta).map(([k, v]) => (
                <KV key={k} k={k} v={String(v)} />
              ))}
            </div>
          </Section>
        )}

        {/* Notes */}
        <Section title="Admin Notes">
          <NotesEditor leadId={id} initialNotes={lead.notes ?? ""} />
        </Section>

        {/* Events timeline */}
        <Section title={`Event Timeline (${sess?.events?.length ?? 0} events)`}>
          {!sess?.events?.length ? (
            <p className="text-sm text-gray-400">No events recorded.</p>
          ) : (
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200" />
              {sess.events.map((e: { id: string; name: string; payload?: string; createdAt: Date }, i: number) => {
                const payload = safeParse(e.payload);
                return (
                  <div key={e.id} className="relative mb-4">
                    <div className="absolute -left-4 top-1 w-2 h-2 rounded-full" style={{ background: e.name === "continue_clicked" ? "#10b981" : "#94a3b8" }} />
                    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-gray-800">{e.name}</span>
                        <span className="text-xs text-gray-400">{fmtDate(e.createdAt)}</span>
                      </div>
                      {payload && (
                        <pre className="mt-1 text-xs text-gray-500 overflow-x-auto">{JSON.stringify(payload, null, 2)}</pre>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* CRM Deliveries */}
        <Section title={`CRM Deliveries (${crmDeliveries.length})`}>
          {!crmDeliveries.length ? (
            <p className="text-sm text-gray-400">No CRM deliveries for this lead.</p>
          ) : (
            <div className="space-y-3">
              {crmDeliveries.map((d: any) => (
                <div key={d.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div>
                      <span className="font-semibold text-sm text-gray-800">{d.integration?.name ?? "Unknown"}</span>
                      <span className="ml-2 text-xs text-gray-400">{d.integration?.platform}</span>
                    </div>
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={statusColor[d.status] ?? {}}>
                      {d.status}
                    </span>
                  </div>
                  <div className="mt-2 grid gap-1 text-xs text-gray-500 sm:grid-cols-3">
                    <span>{d.requestMethod} → {d.requestUrl.slice(0, 60)}</span>
                    <span>HTTP {d.responseStatus ?? "—"} · {d.durationMs ?? "—"}ms</span>
                    <span>{fmtDate(d.createdAt)}</span>
                  </div>
                  {d.lastError && (
                    <div className="mt-1 text-xs text-red-500">{d.lastError}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Conversion */}
        <Section title="Conversion / Postback">
          {!latestConversion ? (
            <p className="text-sm text-gray-400">No conversion record.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              <KV k="Status"          v={latestConversion.status} />
              <KV k="Payout"          v={latestConversion.payout != null ? String(latestConversion.payout) : "-"} />
              <KV k="Currency"        v={latestConversion.currency || "-"} />
              <KV k="TXID"            v={latestConversion.txid || "-"} />
              <KV k="Conversion Key"  v={latestConversion.conversionKey || "-"} />
              <KV k="Received"        v={fmtDate(latestConversion.receivedAt)} />
              {postbackMeta?.postbackUrl && <KV k="Postback URL" v={postbackMeta.postbackUrl} />}
              {postbackMeta?.postbackCode != null && <KV k="Postback Code" v={String(postbackMeta.postbackCode)} />}
              {postbackMeta?.lastError && <KV k="Postback Error" v={postbackMeta.lastError} />}
            </div>
          )}
        </Section>

      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Field({ k, v }: { k: string; v?: string | null }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-400 shrink-0 w-32">{k}:</span>
      <span className="text-gray-900 font-medium break-all">{v || "—"}</span>
    </div>
  );
}

function KV({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: highlight ? "#f0fdf4" : "#f8fafc",
        border: highlight ? "1px solid #bbf7d0" : "1px solid #e5e7eb",
      }}
    >
      <div className="text-xs text-gray-500 mb-0.5">{k}</div>
      <div className="text-sm font-semibold text-gray-800 break-words">{v}</div>
    </div>
  );
}
