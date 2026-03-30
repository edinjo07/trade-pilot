import { prisma } from "@/lib/prisma";

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
  const lead = (await prisma.lead.findUnique({
    where: { id },
    include: {
      session: {
        include: {
          events: { orderBy: { createdAt: "desc" } },
        },
      },
      clicks: {
        orderBy: { createdAt: "desc" },
        include: { conversions: { orderBy: { receivedAt: "desc" } } },
      },
    },
  })) as any;

  if (!lead) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-xl font-semibold text-gray-900">Not found</h1>
          <a className="underline text-gray-500" href="/admin/leads">
            Back
          </a>
        </div>
      </main>
    );
  }

  const meta = (lead.qualityMeta ?? {}) as any;
  const latestClick = lead.clicks?.[0];
  const latestConversion = latestClick?.conversions?.[0];
  const postbackMeta = safeParse(latestConversion?.raw);

  return (
    <main className="min-h-screen p-6 bg-[#f8f9fc]">
      <div className="mx-auto w-full max-w-4xl space-y-4">
        <a className="text-sm underline text-gray-500 hover:text-gray-700" href="/admin/leads">
          ← Back to leads
        </a>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
            <h1 className="text-2xl font-semibold text-gray-900">{lead.fullName}</h1>
            <p className="text-gray-500 mt-1">Created: {fmtDate(lead.createdAt)}</p>

            <div className="mt-4 grid gap-2 text-sm">
              <div>
                <span className="text-gray-500">Phone:</span> <span className="text-gray-900">{lead.phone}</span>
              </div>
              <div>
                <span className="text-gray-500">Email:</span> <span className="text-gray-900">{lead.email}</span>
              </div>
              <div>
                <span className="text-gray-500">Country:</span> <span className="text-gray-900">{lead.country}</span>
              </div>
              <div>
                <span className="text-gray-500">Quality:</span> <span className="text-gray-900">{lead.qualityTier} ({lead.qualityScore})</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900">Attribution</h2>
            <div className="mt-4 grid gap-2 text-sm">
              <div>
                <span className="text-gray-500">ClickId:</span> <span className="text-gray-900">{latestClick?.clickId || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500">Sub1:</span> <span className="text-gray-900">{latestClick?.sub1 || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500">Sub2:</span> <span className="text-gray-900">{latestClick?.sub2 || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500">Sub3:</span> <span className="text-gray-900">{latestClick?.sub3 || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500">Sub4:</span> <span className="text-gray-900">{latestClick?.sub4 || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500">Offer:</span> <span className="text-gray-900">{latestClick?.offerKey || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900">Signals</h2>
          <pre className="mt-3 text-xs overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-3 text-gray-700">
{JSON.stringify(meta, null, 2)}
          </pre>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900">Events</h2>
          {!lead.session?.events?.length ? (
            <p className="text-sm text-gray-500 mt-2">No events.</p>
          ) : (
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              {lead.session.events.map((e: { id: string; name: string; createdAt: Date }) => (
                <div key={e.id} className="flex items-center justify-between gap-3">
                  <span className="text-gray-900">{e.name}</span>
                  <span className="text-gray-400 text-xs">{fmtDate(e.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900">Conversion / Postback</h2>

          {!latestConversion ? (
            <p className="text-sm text-gray-500 mt-2">No conversion record.</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <KV k="Status" v={latestConversion.status} />
              <KV k="Payout" v={latestConversion.payout != null ? String(latestConversion.payout) : "-"} />
              <KV k="Currency" v={latestConversion.currency || "-"} />
              <KV k="TXID" v={latestConversion.txid || "-"} />
              <KV k="Conversion Key" v={latestConversion.conversionKey || "-"} />
              <KV k="Received" v={fmtDate(latestConversion.receivedAt)} />
              <KV k="Postback URL" v={postbackMeta?.postbackUrl || "-"} />
              <KV k="Postback Code" v={postbackMeta?.postbackCode != null ? String(postbackMeta.postbackCode) : "-"} />
              <KV k="Postback Error" v={postbackMeta?.lastError || "-"} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200">
      <div className="text-xs text-gray-500">{k}</div>
      <div className="mt-1 text-sm text-gray-900 break-words">{v}</div>
    </div>
  );
}
