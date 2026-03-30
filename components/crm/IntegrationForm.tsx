"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const MAKE_ZONES = [
  { label: "EU1 (Europe)", value: "https://eu1.make.com" },
  { label: "EU2 (Europe)", value: "https://eu2.make.com" },
  { label: "US1 (United States)", value: "https://us1.make.com" },
  { label: "US2 (United States)", value: "https://us2.make.com" },
  { label: "eu1.make.celonis.com", value: "https://eu1.make.celonis.com" },
  { label: "us1.make.celonis.com", value: "https://us1.make.celonis.com" },
];

interface MakeHook {
  id: number;
  name: string;
  url: string;
  enabled: boolean;
  type: string;
}

interface IntegrationFormProps {
  initial?: Partial<{
    id: string;
    name: string;
    platform: string;
    active: boolean;
    method: string;
    endpoint: string;
    authType: string;
    authHeader: string;
    authValue: string;
    extraHeaders: string | null;
    fieldMapping: string | null;
    bodyTemplate: string | null;
    outboundIpNote: string | null;
    inboundEnabled: boolean;
    inboundSlug: string | null;
    inboundSecretKey: string | null;
    inboundIpWhitelist: string | null;
    inboundFieldMapping: string | null;
    inboundMethod: string;
  }>;
  isEdit?: boolean;
}

const PLATFORMS = [
  { value: "custom", label: "Custom / Generic" },
  { value: "make", label: "Make.com (Webhooks)" },
  { value: "googlesheets", label: "Google Sheets (Apps Script)" },
  { value: "webhook", label: "Generic Webhook" },
  { value: "gohighlevel", label: "GoHighLevel" },
  { value: "hubspot", label: "HubSpot" },
  { value: "salesforce", label: "Salesforce" },
  { value: "activecampaign", label: "ActiveCampaign" },
  { value: "zoho", label: "Zoho CRM" },
  { value: "pipedrive", label: "Pipedrive" },
];

// Google Sheets Apps Script — default field mapping
const GSHEETS_FIELD_MAPPING = JSON.stringify(
  {
    created_at: "{{createdAt}}",
    first_name: "{{firstName}}",
    last_name: "{{lastName}}",
    email: "{{email}}",
    phone: "{{phone}}",
    country: "{{country}}",
    quality_score: "{{qualityScore}}",
    quality_tier: "{{qualityTier}}",
    click_id: "{{clickId}}",
    sub1: "{{sub1}}",
    lead_id: "{{id}}",
  },
  null,
  2
);

// Make.com default field mapping
const MAKE_FIELD_MAPPING = JSON.stringify(
  {
    first_name: "{{firstName}}",
    last_name: "{{lastName}}",
    email: "{{email}}",
    phone: "{{phone}}",
    country: "{{country}}",
    lead_id: "{{id}}",
    quality_score: "{{qualityScore}}",
    quality_tier: "{{qualityTier}}",
    click_id: "{{clickId}}",
    sub1: "{{sub1}}",
    sub2: "{{sub2}}",
  },
  null,
  2
);

// Make.com outbound IP ranges (for inbound whitelist if Make.com calls back)
const MAKE_IP_RANGES =
  '["91.228.170.0/24","91.228.171.0/24","188.116.36.0/24","54.184.0.0/15","34.102.0.0/15"]';

const AUTH_TYPES = [
  { value: "bearer", label: "Bearer Token" },
  { value: "apikey", label: "API Key Header" },
  { value: "basic", label: "Basic Auth (user:pass)" },
  { value: "none", label: "No Auth" },
];

const DEFAULT_FIELD_MAPPING = JSON.stringify(
  {
    first_name: "{{firstName}}",
    last_name: "{{lastName}}",
    email: "{{email}}",
    phone: "{{phone}}",
    country: "{{country}}",
    lead_id: "{{id}}",
  },
  null,
  2
);

export function IntegrationForm({ initial, isEdit }: IntegrationFormProps) {
  const router = useRouter();

  // Auto-configure when platform changes
  const handlePlatformChange = (platform: string) => {
    set("platform", platform);
    if (platform === "make") {
      set("method", "POST");
      set("authType", "none");
      set("fieldMapping", MAKE_FIELD_MAPPING);
    }
    if (platform === "googlesheets") {
      set("method", "POST");
      set("authType", "none");
      set("fieldMapping", GSHEETS_FIELD_MAPPING);
    }
  };

  const [form, setForm] = useState({
    name: initial?.name || "",
    platform: initial?.platform || "custom",
    active: initial?.active ?? true,
    method: initial?.method || "POST",
    endpoint: initial?.endpoint || "",
    authType: initial?.authType || "bearer",
    authHeader: initial?.authHeader || "Authorization",
    authValue: initial?.authValue || "",
    extraHeaders: initial?.extraHeaders || "",
    fieldMapping: initial?.fieldMapping || DEFAULT_FIELD_MAPPING,
    bodyTemplate: initial?.bodyTemplate || "",
    outboundIpNote: initial?.outboundIpNote || "",
    inboundEnabled: initial?.inboundEnabled || false,
    inboundSlug: initial?.inboundSlug || "",
    inboundSecretKey: initial?.inboundSecretKey || "",
    inboundIpWhitelist: initial?.inboundIpWhitelist || "",
    inboundFieldMapping: initial?.inboundFieldMapping || "",
    inboundMethod: initial?.inboundMethod || "POST",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<"outbound" | "inbound" | "advanced">("outbound");

  // Make.com API connector state (not saved to DB — used only to fetch hooks)
  const [makeToken, setMakeToken] = useState("");
  const [makeZone, setMakeZone] = useState("https://eu1.make.com");
  const [makeHooks, setMakeHooks] = useState<MakeHook[]>([]);
  const [makeFetching, setMakeFetching] = useState(false);
  const [makeError, setMakeError] = useState("");

  const fetchMakeHooks = async () => {
    if (!makeToken.trim()) { setMakeError("Enter your Make.com API token first"); return; }
    setMakeFetching(true);
    setMakeError("");
    setMakeHooks([]);
    try {
      const res = await fetch(
        `/api/admin/crm/make-hooks?token=${encodeURIComponent(makeToken.trim())}&zone=${encodeURIComponent(makeZone)}`
      );
      const data = await res.json();
      if (!data.ok) { setMakeError(data.error || "Failed to fetch hooks"); return; }
      setMakeHooks(data.hooks || []);
      if ((data.hooks || []).length === 0) setMakeError("No webhooks found in this Make.com account.");
    } catch (e: any) {
      setMakeError(String(e?.message || e));
    } finally {
      setMakeFetching(false);
    }
  };

  const set = (key: keyof typeof form, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = isEdit
        ? `/api/admin/crm/integrations/${initial!.id}`
        : "/api/admin/crm/integrations";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.code || "Unknown error");
        return;
      }

      router.push(
        isEdit
          ? `/admin/crm/${initial!.id}`
          : `/admin/crm/${data.integration.id}`
      );
      router.refresh();
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!initial?.id) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(
        `/api/admin/crm/integrations/${initial.id}/test`,
        { method: "POST" }
      );
      setTestResult(await res.json());
    } catch (e: any) {
      setTestResult({ ok: false, error: String(e?.message || e) });
    } finally {
      setTesting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Section title="Basic Info">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Integration Name *">
            <input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. GoHighLevel Production"
              {...inputProps}
            />
          </Field>
          <Field label="Platform">
            <select
              value={form.platform}
              onChange={(e) => handlePlatformChange(e.target.value)}
              {...selectProps}
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <div className="flex items-center gap-3 h-[42px]">
              <ToggleSwitch
                checked={form.active}
                onChange={(v) => set("active", v)}
              />
              <span
                className="text-sm"
                style={{ color: form.active ? "#059669" : "#9ca3af" }}
              >
                {form.active ? "Active" : "Paused"}
              </span>
            </div>
          </Field>
        </div>
      </Section>

      {/* Tabs */}
      <div
        className="flex gap-1 rounded-xl p-1"
        style={{ background: "#f3f4f6", border: "1px solid #e5e7eb" }}
      >
        {(["outbound", "inbound", "advanced"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-colors"
            style={
              activeTab === tab
                ? { background: "#fff", color: "#d97706", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                : { color: "#6b7280" }
            }
          >
            {tab}
            {tab === "inbound" && form.inboundEnabled && (
              <span
                className="ml-1.5 rounded-full px-1.5 py-0.5 text-xs"
                style={{ background: "#ede9fe", color: "#6d28d9" }}
              >
                ON
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Outbound Tab */}
      {activeTab === "outbound" && (
        <Section title="Outbound - Push Leads to This CRM">

          {/* Google Sheets Apps Script setup guide */}
          {form.platform === "googlesheets" && (
            <div
              className="rounded-xl p-4 space-y-2"
              style={{ background: "#f0fdf4", border: "1px solid #86efac" }}
            >
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "#166534" }}>
                Google Sheets Setup Guide
              </p>
              <ol className="text-xs space-y-1.5" style={{ color: "#166534" }}>
                <li>1. Open your Google Sheet → click <strong>Extensions → Apps Script</strong></li>
                <li>2. Replace the default code with the script below and click <strong>Save</strong></li>
                <li>3. Click <strong>Deploy → New deployment</strong> → Type: <strong>Web App</strong></li>
                <li>4. Set <strong>Execute as: Me</strong> · <strong>Who has access: Anyone</strong> → click Deploy</li>
                <li>5. Copy the generated Web App URL and paste it into <strong>Endpoint URL</strong> below</li>
                <li>6. Method: <strong>POST</strong> · Auth: <strong>No Auth</strong> (the URL contains a secret token)</li>
              </ol>
              <div
                className="rounded-lg p-3 text-xs font-mono overflow-auto max-h-56"
                style={{ background: "#052e16", color: "#86efac", whiteSpace: "pre", userSelect: "all" }}
              >{`function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    // First row = headers (only written once)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Date','First Name','Last Name','Email','Phone',
        'Country','Score','Tier','Click ID','Sub1','Lead ID'
      ]);
    }
    sheet.appendRow([
      data.created_at || '',
      data.first_name || '',
      data.last_name  || '',
      data.email      || '',
      data.phone      || '',
      data.country    || '',
      data.quality_score || '',
      data.quality_tier  || '',
      data.click_id   || '',
      data.sub1       || '',
      data.lead_id    || ''
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({status:'ok'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({status:'error',msg:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`}
              </div>
              <p className="text-xs" style={{ color: "#15803d" }}>
                ⚠ After re-deploying, always use <strong>Manage deployments → Edit</strong> and select <strong>New version</strong> — otherwise the URL changes.
              </p>
            </div>
          )}

          {/* Make.com setup guide + API connector */}
          {form.platform === "make" && (
            <div className="space-y-4">

              {/* Step-by-step guide */}
              <div
                className="rounded-xl p-4 space-y-2"
                style={{ background: "#fffbeb", border: "1px solid #fcd34d" }}
              >
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "#b45309" }}>
                  Make.com Setup Guide
                </p>
                <ol className="text-xs space-y-1.5" style={{ color: "#78350f" }}>
                  <li>1. Go to <strong>Make.com → Scenarios → Create a new scenario</strong></li>
                  <li>2. Add a <strong>Webhooks › Custom webhook</strong> module as the trigger</li>
                  <li>3. Click <strong>Add</strong>, name it, then copy the generated <code style={{fontFamily:"monospace"}}>https://hook.eu1.make.com/xxxx</code> URL</li>
                  <li>4. Paste it into <strong>Endpoint URL</strong> below — or use the connector to pick it automatically</li>
                  <li>5. Method: <strong>POST</strong> · Auth: <strong>No Auth</strong> (the URL is the secret)</li>
                  <li>6. Hit <strong>Send Test Payload</strong> to verify. Make.com responds with <code style={{fontFamily:"monospace"}}>{`{"accepted":true}`}</code></li>
                </ol>
              </div>

              {/* Make.com API connector — fetch hooks automatically */}
              <div
                className="rounded-xl p-4 space-y-3"
                style={{ background: "#f0fdf4", border: "1px solid #86efac" }}
              >
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "#166534" }}>
                  Connect Make Account (auto-fetch hooks)
                </p>
                <p className="text-xs" style={{ color: "#15803d" }}>
                  Enter your Make.com API token to pick a webhook URL from your account directly.
                  Your token is <strong>never stored</strong> — it is used only for this one-time fetch.
                  Get it at: <strong>Make.com → Profile → API keys</strong>
                </p>
                <div className="grid gap-2 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <input
                      type="password"
                      value={makeToken}
                      onChange={(e) => setMakeToken(e.target.value)}
                      placeholder="Make.com API token (not stored)"
                      {...inputProps}
                    />
                  </div>
                  <div>
                    <select
                      value={makeZone}
                      onChange={(e) => setMakeZone(e.target.value)}
                      {...selectProps}
                    >
                      {MAKE_ZONES.map((z) => (
                        <option key={z.value} value={z.value}>{z.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fetchMakeHooks}
                  disabled={makeFetching}
                  className="rounded-lg px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#16a34a,#15803d)" }}
                >
                  {makeFetching ? "Fetching hooks…" : "Fetch My Webhooks from Make.com"}
                </button>
                {makeError && (
                  <p className="text-xs" style={{ color: "#dc2626" }}>{makeError}</p>
                )}
                {makeHooks.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium" style={{ color: "#166534" }}>
                      Select a webhook to auto-fill the endpoint URL:
                    </p>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {makeHooks.map((hook) => (
                        <button
                          key={hook.id}
                          type="button"
                          onClick={() => {
                            set("endpoint", hook.url);
                            set("method", "POST");
                            set("authType", "none");
                            setMakeHooks([]);
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left text-xs"
                          style={{
                            background: "#fff",
                            border: "1px solid #86efac",
                            color: "#166534",
                          }}
                        >
                          <span className="font-semibold">{hook.name}</span>
                          <span
                            className="ml-2 rounded px-1 py-0.5 text-xs"
                            style={{
                              background: hook.enabled ? "#dcfce7" : "#fee2e2",
                              color: hook.enabled ? "#166534" : "#991b1b",
                            }}
                          >
                            {hook.enabled ? "active" : "off"}
                          </span>
                          <br />
                          <span className="opacity-60 font-mono" style={{ fontSize: 10 }}>
                            {hook.url}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="HTTP Method">
              <select
                value={form.method}
                onChange={(e) => set("method", e.target.value)}
                {...selectProps}
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </Field>
            <Field label="Endpoint URL *" className="md:col-span-2">
              <input
                required
                value={form.endpoint}
                onChange={(e) => set("endpoint", e.target.value)}
                placeholder="https://crm.example.com/api/leads"
                {...inputProps}
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Auth Type">
              <select
                value={form.authType}
                onChange={(e) => set("authType", e.target.value)}
                {...selectProps}
              >
                {AUTH_TYPES.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </Field>
            {form.authType !== "none" && (
              <>
                <Field label="Auth Header Name">
                  <input
                    value={form.authHeader}
                    onChange={(e) => set("authHeader", e.target.value)}
                    placeholder={
                      form.authType === "bearer" ? "Authorization" : "x-api-key"
                    }
                    {...inputProps}
                  />
                </Field>
                <Field label="Auth Value / Token">
                  <input
                    type="password"
                    value={form.authValue}
                    onChange={(e) => set("authValue", e.target.value)}
                    placeholder="sk-..."
                    {...inputProps}
                  />
                </Field>
              </>
            )}
          </div>

          <Field label="Field Mapping (JSON)">
            <p className="mb-2 text-xs" style={{ color: "#6b7280" }}>
              Map their field names to our data using <code style={{ color: "#d97706" }}>{`{{variable}}`}</code>.
              Available:{" "}
              <code style={{ color: "#374151" }}>
                firstName, lastName, fullName, email, phone, country, id, clickId, sub1-4, qualityScore, qualityTier
              </code>
            </p>
            <textarea
              value={form.fieldMapping}
              onChange={(e) => set("fieldMapping", e.target.value)}
              rows={10}
              placeholder={DEFAULT_FIELD_MAPPING}
              {...textareaProps}
            />
          </Field>

          <Field label="Body Template Override (optional JSON)">
            <p className="mb-2 text-xs" style={{ color: "#6b7280" }}>
              If set, overrides Field Mapping. Useful for complex nested payloads.
            </p>
            <textarea
              value={form.bodyTemplate}
              onChange={(e) => set("bodyTemplate", e.target.value)}
              rows={6}
              placeholder={`{"contact": {"email": "{{email}}", "name": "{{fullName}}"}}`}
              {...textareaProps}
            />
          </Field>

          {/* Test section */}
          {isEdit && (
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: "#374151" }}>
                  Test Connection
                </span>
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={testing}
                  className="rounded-lg px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#f0a500,#d4840a)" }}
                >
                  {testing ? "Testing…" : "Send Test Payload"}
                </button>
              </div>
              {testResult && (
                <div
                  className="rounded-lg p-3 text-xs font-mono overflow-auto max-h-40"
                  style={{
                    background: testResult.ok ? "#ecfdf5" : "#fef2f2",
                    color: testResult.ok ? "#065f46" : "#991b1b",
                    border: `1px solid ${testResult.ok ? "#6ee7b7" : "#fca5a5"}`,
                  }}
                >
                  <div>{testResult.ok ? "✓ OK" : "✗ FAILED"} - HTTP {testResult.status || "?"} ({testResult.durationMs}ms)</div>
                  {testResult.responseBody && (
                    <div className="mt-1 opacity-70">{testResult.responseBody.slice(0, 300)}</div>
                  )}
                  {testResult.error && <div>{testResult.error}</div>}
                </div>
              )}
            </div>
          )}
        </Section>
      )}

      {/* Inbound Tab */}
      {activeTab === "inbound" && (
        <Section title="Inbound - Receive Leads FROM This CRM">
          <div className="flex items-center gap-3 mb-4">
            <ToggleSwitch
              checked={form.inboundEnabled}
              onChange={(v) => set("inboundEnabled", v)}
            />
            <span className="text-sm" style={{ color: "#374151" }}>
              Enable Inbound Webhook
            </span>
          </div>

          {form.inboundEnabled && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Webhook Slug (URL path segment) *">
                  <div className="flex items-center">
                    <span
                      className="rounded-l-lg border-r-0 px-3 py-2.5 text-xs"
                      style={{
                        background: "#f3f4f6",
                        border: "1px solid #d1d5db",
                        color: "#6b7280",
                        borderRight: "none",
                      }}
                    >
                      /api/webhook/inbound/
                    </span>
                    <input
                      value={form.inboundSlug}
                      onChange={(e) =>
                        set(
                          "inboundSlug",
                          e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                        )
                      }
                      placeholder="my-crm"
                      className="flex-1 rounded-r-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none"
                      style={{
                        background: "#fff",
                        border: "1px solid #d1d5db",
                      }}
                    />
                  </div>
                </Field>
                <Field label="Accepted Method">
                  <select
                    value={form.inboundMethod}
                    onChange={(e) => set("inboundMethod", e.target.value)}
                    {...selectProps}
                  >
                    <option value="POST">POST only</option>
                    <option value="GET">GET only</option>
                    <option value="BOTH">POST + GET</option>
                  </select>
                </Field>
              </div>

              {form.inboundSlug && (
                <div
                  className="rounded-xl p-4 space-y-2"
                  style={{ background: "#ede9fe", border: "1px solid #c4b5fd" }}
                >
                  <p className="text-xs font-semibold" style={{ color: "#6d28d9" }}>
                    Webhook URL — paste this into Make.com or your CRM:
                  </p>
                  <code
                    className="text-xs block break-all select-all cursor-text rounded px-2 py-1"
                    style={{ color: "#374151", background: "#f5f3ff" }}
                  >
                    {typeof window !== "undefined" ? window.location.origin : "https://yourdomain.com"}
                    /api/webhook/inbound/{form.inboundSlug}
                  </code>
                  {form.platform === "make" && (
                    <p className="text-xs" style={{ color: "#6d28d9" }}>
                      In Make.com: use a <strong>Webhooks &gt; Custom webhook</strong> module to POST to this URL.
                      Use <code style={{fontFamily:"monospace"}}>?create_lead=1</code> to auto-create leads.
                    </p>
                  )}
                </div>
              )}

              {form.platform === "make" && (
                <div
                  className="rounded-xl p-3 text-xs"
                  style={{ background: "#fffbeb", border: "1px solid #fcd34d", color: "#78350f" }}
                >
                  <strong>Make.com outbound IPs</strong> (add to IP Whitelist below if needed):
                  <code className="block mt-1" style={{fontFamily:"monospace"}}>
                    91.228.170.0/24, 91.228.171.0/24, 188.116.36.0/24
                  </code>
                  <button
                    type="button"
                    className="mt-2 rounded px-2 py-1 text-xs font-medium"
                    style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" }}
                    onClick={() => set("inboundIpWhitelist", MAKE_IP_RANGES)}
                  >
                    Auto-fill Make.com IPs
                  </button>
                </div>
              )}

              <Field label="Secret Key (optional - they send via ?key= or X-Webhook-Key header)">
                <input
                  type="password"
                  value={form.inboundSecretKey}
                  onChange={(e) => set("inboundSecretKey", e.target.value)}
                  placeholder="Generate a random secret…"
                  {...inputProps}
                />
              </Field>

              <Field label="IP Whitelist for this integration (JSON array, e.g. [&quot;1.2.3.4&quot;])">
                <p className="mb-2 text-xs" style={{ color: "#6b7280" }}>
                  Leave empty to use the global IP whitelist. Enter as JSON array.
                </p>
                <input
                  value={form.inboundIpWhitelist}
                  onChange={(e) => set("inboundIpWhitelist", e.target.value)}
                  placeholder='["1.2.3.4", "5.6.7.8"]'
                  {...inputProps}
                />
              </Field>

              <Field label="Inbound Field Mapping (JSON)">
                <p className="mb-2 text-xs" style={{ color: "#6b7280" }}>
                  Map THEIR field names → OUR field names.
                  Format: <code style={{ color: "#d97706" }}>{`{"ourField": "theirField"}`}</code>
                  <br />
                  Our fields: <code style={{ color: "#374151" }}>fullName, email, phone, country</code>
                </p>
                <textarea
                  value={form.inboundFieldMapping}
                  onChange={(e) => set("inboundFieldMapping", e.target.value)}
                  rows={6}
                  placeholder={`{\n  "fullName": "contact_name",\n  "email": "contact_email",\n  "phone": "mobile_number",\n  "country": "country_code"\n}`}
                  {...textareaProps}
                />
              </Field>
            </div>
          )}
        </Section>
      )}

      {/* Advanced Tab */}
      {activeTab === "advanced" && (
        <Section title="Advanced Settings">
          <Field label="Extra Request Headers (JSON array)">
            <p className="mb-2 text-xs" style={{ color: "#6b7280" }}>
              Format: <code style={{ color: "#d97706" }}>{`[{"key":"X-Custom","value":"value"}]`}</code>
            </p>
            <textarea
              value={form.extraHeaders}
              onChange={(e) => set("extraHeaders", e.target.value)}
              rows={5}
              placeholder={`[\n  {"key": "X-Source", "value": "tradepilot"},\n  {"key": "X-Version", "value": "1.0"}\n]`}
              {...textareaProps}
            />
          </Field>

          <Field label="Our Outbound IP Note (for whitelisting in their CRM)">
            <p className="mb-2 text-xs" style={{ color: "#6b7280" }}>
              After saving, use the "Check Our IP" button on the detail page to find and note the IP.
            </p>
            <input
              value={form.outboundIpNote}
              onChange={(e) => set("outboundIpNote", e.target.value)}
              placeholder="e.g. 123.456.789.0"
              {...inputProps}
            />
          </Field>
        </Section>
      )}

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            color: "#991b1b",
          }}
        >
          Error: {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#f0a500,#d4840a)" }}
        >
          {saving
            ? "Saving…"
            : isEdit
            ? "Save Changes"
            : "Create Integration"}
        </button>
        <a
          href="/admin/crm"
          className="rounded-xl px-5 py-3 text-sm"
          style={{
            background: "#f3f4f6",
            border: "1px solid #e5e7eb",
            color: "#6b7280",
          }}
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

// ─── Shared style helpers ───────────────────────────────────────────────────

const inputProps = {
  className:
    "w-full rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none",
  style: {
    background: "#fff",
    border: "1px solid #d1d5db",
  },
} as const;

const selectProps = {
  className: "w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none",
  style: {
    background: "#fff",
    border: "1px solid #d1d5db",
    color: "#374151",
  },
} as const;

const textareaProps = {
  className:
    "w-full rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none font-mono",
  style: {
    background: "#f9fafb",
    border: "1px solid #d1d5db",
    resize: "vertical" as const,
  },
} as const;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-6 space-y-4"
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <h2
        className="text-sm font-semibold uppercase tracking-widest"
        style={{ color: "#9ca3af" }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        className="mb-1.5 block text-xs font-medium"
        style={{ color: "#374151" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative h-6 w-11 rounded-full transition-colors"
      style={{
        background: checked
          ? "#059669"
          : "#d1d5db",
      }}
    >
      <span
        className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}
