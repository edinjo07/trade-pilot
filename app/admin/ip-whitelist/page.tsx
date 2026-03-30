"use client";

import React, { useEffect, useState } from "react";

interface Entry {
  id: string;
  ip: string;
  label: string | null;
  note: string | null;
  active: boolean;
  createdAt: string;
}

export default function IpWhitelistPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ip: "", label: "", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [outboundIp, setOutboundIp] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/ip-whitelist");
    const d = await res.json();
    if (d.ok) setEntries(d.entries);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/ip-whitelist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!d.ok) {
        setError(d.code || "Error adding IP");
      } else {
        setForm({ ip: "", label: "", note: "" });
        load();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/ip-whitelist/${id}`, { method: "DELETE" });
    load();
  };

  const handleToggle = async (id: string, active: boolean) => {
    await fetch(`/api/admin/ip-whitelist/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    load();
  };

  const checkOurIp = async () => {
    const res = await fetch("/api/admin/myip");
    const d = await res.json();
    setOutboundIp(d.ip || "unknown");
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <a href="/admin/crm" className="text-sm" style={{ color: "#6b7280" }}>
            ← CRM Hub
          </a>
          <h1 className="mt-2 text-2xl font-black" style={{ color: "#111827" }}>
            IP Whitelist
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#6b7280" }}>
            Only IPs on this list (or an integration&apos;s own list) can call your inbound webhooks.
            An empty whitelist allows all IPs.
          </p>
        </div>
        <button
          onClick={checkOurIp}
          className="rounded-xl px-4 py-2.5 text-sm font-medium"
          style={{
          background: "#fef3c7",
              border: "1px solid #fcd34d",
              color: "#d97706",
          }}
        >
          Our Outbound IP
        </button>
      </div>

      {/* Our IP banner */}
      {outboundIp && (
        <div
          className="rounded-xl px-5 py-4"
          style={{
            background: "#fef3c7",
            border: "1px solid #fcd34d",
          }}
        >
          <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#d97706" }}>
            Our Server&apos;s Outbound IP (give this to external CRMs)
          </div>
          <code className="text-lg font-bold" style={{ color: "#111827" }}>
            {outboundIp}
          </code>
        </div>
      )}

      {/* Add form */}
      <div
        className="rounded-2xl p-6 space-y-4"
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
        }}
      >
        <h2
          className="text-sm font-semibold uppercase tracking-widest"
          style={{ color: "#9ca3af" }}
        >
          Add IP / CIDR Range
        </h2>
        <form onSubmit={handleAdd} className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="mb-1 block text-xs font-medium" style={{ color: "#374151" }}>
              IP or CIDR *
            </label>
            <input
              required
              value={form.ip}
              onChange={(e) => setForm((f) => ({ ...f, ip: e.target.value.trim() }))}
              placeholder="1.2.3.4 or 1.2.3.0/24"
              className="w-full rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              style={{
                background: "#fff",
                border: "1px solid #d1d5db",
              }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "#374151" }}>
              Label
            </label>
            <input
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="e.g. GoHighLevel US"
              className="w-full rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              style={{
                background: "#fff",
                border: "1px solid #d1d5db",
              }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "#374151" }}>
              Note
            </label>
            <input
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="Optional note"
              className="w-full rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              style={{
                background: "#fff",
                border: "1px solid #d1d5db",
              }}
            />
          </div>
          {error && (
            <div
              className="md:col-span-3 rounded-lg px-4 py-3 text-sm"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#ef4444",
              }}
            >
              {error}
            </div>
          )}
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#f0a500,#d4840a)" }}
            >
              {submitting ? "Adding…" : "Add IP"}
            </button>
          </div>
        </form>
      </div>

      {/* Entries table */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderBottom: "1px solid #e5e7eb" }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#9ca3af" }}
          >
            Whitelist ({entries.length} entries)
          </span>
          {entries.length === 0 && (
            <span className="text-xs" style={{ color: "#d97706" }}>
              Empty = allow all IPs
            </span>
          )}
        </div>

        {loading ? (
          <div className="px-5 py-12 text-center text-sm" style={{ color: "#9ca3af" }}>
            Loading…
          </div>
        ) : entries.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm" style={{ color: "#9ca3af" }}>
            No entries. All IPs are currently allowed.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
                {["IP / CIDR", "Label", "Note", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#6b7280" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr
                  key={e.id}
                  className="transition-colors hover:bg-gray-50"
                  style={{ borderTop: "1px solid #f3f4f6" }}
                >
                  <td className="px-4 py-3 font-mono text-sm" style={{ color: "#d97706" }}>
                    {e.ip}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: "#374151" }}>
                    {e.label || "-"}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#6b7280" }}>
                    {e.note || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(e.id, e.active)}
                      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={
                        e.active
                          ? { background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" }
                          : { background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" }
                      }
                    >
                      {e.active ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="text-xs"
                      style={{ color: "#ef4444" }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Info box */}
      <div
        className="rounded-2xl p-5 space-y-2"
        style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
        }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "#374151" }}>
          How IP Whitelisting Works
        </h3>
        <ul className="space-y-1.5 text-xs" style={{ color: "#6b7280" }}>
          <li>• If this global list is empty, all source IPs are accepted.</li>
          <li>• Each integration can also have its own IP whitelist (in its settings).</li>
          <li>• Both IPv4 and CIDR notation (e.g. <code style={{ color: "#d97706" }}>1.2.3.0/24</code>) are supported.</li>
          <li>• To block specific IPs, add only the trusted ones and leave the rest out.</li>
          <li>• This applies to inbound webhooks (<code style={{ color: "#d97706" }}>/api/webhook/inbound/*</code>) only.</li>
        </ul>
      </div>
    </div>
  );
}
