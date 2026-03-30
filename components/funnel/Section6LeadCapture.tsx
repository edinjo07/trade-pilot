"use client";

import { useState, useRef, useEffect } from "react";
import { useT } from "@/components/LocaleProvider";

// ── Country dial-codes ────────────────────────────────────────────────────────
const COUNTRY_CODES = [
  { code: "+1",   flag: "🇺🇸", name: "United States" },
  { code: "+1",   flag: "🇨🇦", name: "Canada" },
  { code: "+44",  flag: "🇬🇧", name: "United Kingdom" },
  { code: "+61",  flag: "🇦🇺", name: "Australia" },
  { code: "+64",  flag: "🇳🇿", name: "New Zealand" },
  { code: "+353", flag: "🇮🇪", name: "Ireland" },
  { code: "+27",  flag: "🇿🇦", name: "South Africa" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+65",  flag: "🇸🇬", name: "Singapore" },
  { code: "+60",  flag: "🇲🇾", name: "Malaysia" },
  { code: "+49",  flag: "🇩🇪", name: "Germany" },
  { code: "+33",  flag: "🇫🇷", name: "France" },
  { code: "+39",  flag: "🇮🇹", name: "Italy" },
  { code: "+34",  flag: "🇪🇸", name: "Spain" },
  { code: "+31",  flag: "🇳🇱", name: "Netherlands" },
  { code: "+32",  flag: "🇧🇪", name: "Belgium" },
  { code: "+41",  flag: "🇨🇭", name: "Switzerland" },
  { code: "+43",  flag: "🇦🇹", name: "Austria" },
  { code: "+46",  flag: "🇸🇪", name: "Sweden" },
  { code: "+47",  flag: "🇳🇴", name: "Norway" },
  { code: "+45",  flag: "🇩🇰", name: "Denmark" },
  { code: "+358", flag: "🇫🇮", name: "Finland" },
  { code: "+48",  flag: "🇵🇱", name: "Poland" },
  { code: "+351", flag: "🇵🇹", name: "Portugal" },
  { code: "+30",  flag: "🇬🇷", name: "Greece" },
  { code: "+7",   flag: "🇷🇺", name: "Russia" },
  { code: "+380", flag: "🇺🇦", name: "Ukraine" },
  { code: "+90",  flag: "🇹🇷", name: "Turkey" },
  { code: "+972", flag: "🇮🇱", name: "Israel" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "+20",  flag: "🇪🇬", name: "Egypt" },
  { code: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "+254", flag: "🇰🇪", name: "Kenya" },
  { code: "+233", flag: "🇬🇭", name: "Ghana" },
  { code: "+91",  flag: "🇮🇳", name: "India" },
  { code: "+92",  flag: "🇵🇰", name: "Pakistan" },
  { code: "+880", flag: "🇧🇩", name: "Bangladesh" },
  { code: "+94",  flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+977", flag: "🇳🇵", name: "Nepal" },
  { code: "+81",  flag: "🇯🇵", name: "Japan" },
  { code: "+82",  flag: "🇰🇷", name: "South Korea" },
  { code: "+86",  flag: "🇨🇳", name: "China" },
  { code: "+852", flag: "🇭🇰", name: "Hong Kong" },
  { code: "+886", flag: "🇹🇼", name: "Taiwan" },
  { code: "+62",  flag: "🇮🇩", name: "Indonesia" },
  { code: "+63",  flag: "🇵🇭", name: "Philippines" },
  { code: "+66",  flag: "🇹🇭", name: "Thailand" },
  { code: "+84",  flag: "🇻🇳", name: "Vietnam" },
  { code: "+55",  flag: "🇧🇷", name: "Brazil" },
  { code: "+52",  flag: "🇲🇽", name: "Mexico" },
  { code: "+54",  flag: "🇦🇷", name: "Argentina" },
  { code: "+56",  flag: "🇨🇱", name: "Chile" },
  { code: "+57",  flag: "🇨🇴", name: "Colombia" },
  { code: "+51",  flag: "🇵🇪", name: "Peru" },
];

import React from "react";

interface Props {
  sessionId: string;
  clickId?: string;
  subId?: string;
  quizAnswers?: Array<{ qid: string; aid: string }>;
  onLeadId: (id: string) => void;
  onDone: () => void;
}

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 transition";
const inputNormal = "border-gray-300 focus:border-amber-500 focus:ring-amber-500/50";
const inputError  = "border-red-500 focus:border-red-500 focus:ring-red-500/40";

// ── Field wrapper  must live at module scope so React never remounts inputs ──
function Field({
  label, htmlFor, error, children,
}: {
  label: string; htmlFor: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1" htmlFor={htmlFor}>{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ── Form draft  persisted to sessionStorage so data survives step changes ──
const FORM_DRAFT_KEY = "__tf_form";
type FormDraft = {
  firstName: string; lastName: string; email: string;
  dialCode: string; phoneLocal: string; emailConfirmed: boolean;
};
function loadDraft(): FormDraft {
  try {
    const r = typeof window !== "undefined" ? sessionStorage.getItem(FORM_DRAFT_KEY) : null;
    if (r) return JSON.parse(r) as FormDraft;
  } catch { /* ignore */ }
  return { firstName: "", lastName: "", email: "", dialCode: "+1", phoneLocal: "", emailConfirmed: false };
}
function saveDraft(d: FormDraft) {
  try { sessionStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(d)); } catch { /* ignore */ }
}
function clearDraft() {
  try { sessionStorage.removeItem(FORM_DRAFT_KEY); } catch { /* ignore */ }
}

// Dial code → ISO 3166-1 alpha-2 (best-match; +1 defaults to US)
const DIAL_CODE_TO_ISO: Record<string, string> = {
  "+1":"US","+44":"GB","+61":"AU","+64":"NZ","+353":"IE","+27":"ZA",
  "+971":"AE","+65":"SG","+60":"MY","+49":"DE","+33":"FR","+39":"IT",
  "+34":"ES","+31":"NL","+32":"BE","+41":"CH","+43":"AT","+46":"SE",
  "+47":"NO","+45":"DK","+358":"FI","+48":"PL","+351":"PT","+30":"GR",
  "+7":"RU","+380":"UA","+90":"TR","+972":"IL","+966":"SA","+974":"QA",
  "+965":"KW","+20":"EG","+234":"NG","+254":"KE","+233":"GH","+91":"IN",
  "+92":"PK","+880":"BD","+94":"LK","+977":"NP","+81":"JP","+82":"KR",
  "+86":"CN","+852":"HK","+886":"TW","+62":"ID","+63":"PH","+66":"TH",
  "+84":"VN","+55":"BR","+52":"MX","+54":"AR","+56":"CL","+57":"CO","+51":"PE",
};

export default function Section6LeadCapture({ sessionId, clickId, subId, quizAnswers, onLeadId, onDone }: Props) {
  // Load saved draft so all fields survive step navigation / refresh
  const [draft] = useState(loadDraft);
  const [firstName,  setFirstName]  = useState(draft.firstName);
  const [lastName,   setLastName]   = useState(draft.lastName);
  const [email,      setEmail]      = useState(draft.email);
  const [dialCode,   setDialCode]   = useState(draft.dialCode || "+1");
  const [phoneLocal, setPhoneLocal] = useState(draft.phoneLocal);
  const [consent,    setConsent]    = useState(false);
  const [website,    setWebsite]    = useState(""); // honeypot
  const [loading,    setLoading]    = useState(false);
  const [err,        setErr]        = useState<string | null>(null);
  const [fieldErr,   setFieldErr]   = useState<{
    firstName?: string; lastName?: string; email?: string; phone?: string;
  }>({});
  const submitCount = useRef(0);
  const [emailConfirmed, setEmailConfirmed] = useState(draft.emailConfirmed);
  const t = useT();

  // Persist all fields to sessionStorage whenever they change
  useEffect(() => {
    saveDraft({ firstName, lastName, email, dialCode, phoneLocal, emailConfirmed });
  }, [firstName, lastName, email, dialCode, phoneLocal, emailConfirmed]);

  const countryIso = DIAL_CODE_TO_ISO[dialCode] ?? "US";
  const fullPhone = `${dialCode}${phoneLocal.replace(/^0+/, "")}`;
  const canSubmit =
    firstName.trim().length >= 1 &&
    lastName.trim().length  >= 1 &&
    email.includes("@") &&
    phoneLocal.replace(/\D/g, "").length >= 6 &&
    consent &&
    !loading;

  async function handleSubmit() {
    setErr(null);
    setFieldErr({});
    submitCount.current += 1;
    if (submitCount.current > 5) {
      setErr(t.err_too_many);
      return;
    }

    const errs: typeof fieldErr = {};
    if (firstName.trim().length < 1) errs.firstName = t.err_first_name;
    if (lastName.trim().length  < 1) errs.lastName  = t.err_last_name;
    if (!email.includes("@"))         errs.email     = t.err_email;
    if (phoneLocal.replace(/\D/g, "").length < 6) errs.phone = t.err_phone;
    if (Object.keys(errs).length) { setFieldErr(errs); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          firstName:   firstName.trim(),
          lastName:    lastName.trim(),
          fullName:    `${firstName.trim()} ${lastName.trim()}`,
          email:       email.trim().toLowerCase(),
          phone:       fullPhone,
          country:     countryIso,
          clickId:     clickId     || undefined,
          subId:       subId       || undefined,
          quizAnswers: quizAnswers ?? [],
          _hp:         website,
        }),
      });

      const data = await res.json().catch(() => ({} as Record<string, unknown>));

      if (!res.ok) {
        const code = (data?.code as string) ?? "";
        if (code === "DISPOSABLE_EMAIL") {
          setFieldErr((e) => ({ ...e, email: t.err_email_personal }));
        } else if (code === "INVALID_EMAIL") {
          setFieldErr((e) => ({ ...e, email: t.err_email }));
        } else if (code === "INVALID_PHONE") {
          setFieldErr((e) => ({ ...e, phone: t.err_phone_invalid }));
        } else if (code === "RATE_LIMIT") {
          setErr(t.err_rate_limit);
        } else if (code === "INVALID_NAME") {
          setFieldErr((e) => ({ ...e, firstName: t.err_full_name }));
        } else {
          setErr(t.err_generic);
        }
        setLoading(false);
        return;
      }

      if (data?.leadId) onLeadId(String(data.leadId));
      clearDraft(); // wipe saved draft on successful registration
      onDone();
    } catch {
      setErr(t.err_network);
      setLoading(false);
    }
  }

  function handleEmailContinue() {
    if (!email.includes("@") || email.trim().length < 5) {
      setFieldErr((e) => ({ ...e, email: t.err_email }));
      return;
    }
    setFieldErr((e) => ({ ...e, email: undefined }));
    setEmailConfirmed(true);
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
          <span>{t.s6_progress_label}</span>
          <span>100%</span>
        </div>
        <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "rgba(240,165,0,0.2)" }}>
          <div className="h-full w-full rounded-full" style={{ background: "linear-gradient(90deg,#f0a500,#f5b523)" }} />
        </div>
        <h2 className="mt-4 text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug">
          {t.s6_headline}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {t.s6_subtext}
        </p>
        <p className="mt-2 text-xs text-gray-400">
          {t.s6_min_deposit_label} <span className="text-amber-500 font-semibold">$250</span>
        </p>
      </div>

      {/* ── Human intro ─────────────────────────────────────────────────── */}
      <div
        className="flex items-start gap-4 rounded-2xl p-4 sm:p-5"
        style={{ background: "rgba(240,165,0,0.04)", border: "1px solid rgba(240,165,0,0.16)" }}
      >
        <div className="relative shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://randomuser.me/api/portraits/men/43.jpg"
            alt="Alex M., Senior Trading Specialist"
            width={52}
            height={52}
            className="h-13 w-13 rounded-full border-2 object-cover"
            style={{ borderColor: "rgba(240,165,0,0.5)", height: 52, width: 52 }}
            onError={(e) => {
              e.currentTarget.src = "";
              e.currentTarget.style.display = "none";
              const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
              if (fb) fb.style.display = "flex";
            }}
          />
          <div
            className="hidden h-[52px] w-[52px] items-center justify-center rounded-full border-2 text-base font-bold text-black"
            style={{ background: "linear-gradient(135deg,#f0a500,#d4840a)", borderColor: "rgba(240,165,0,0.5)" }}
          >
            A
          </div>
          {/* Online indicator */}
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">Alex M. &middot; <span className="font-normal text-gray-500">{t.s6_specialist_role}</span></p>
          <p className="mt-1 text-sm text-gray-600 leading-relaxed">
            &ldquo;{t.s6_specialist_quote}&rdquo;
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-600 font-medium">{t.s6_specialist_online}</span>
          </div>
        </div>
      </div>

      {/* Honeypot */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0 pointer-events-none"
      />

      {!emailConfirmed ? (
        /* ── Step 1: Email only ──────────────────────────────────────────── */
        <div className="space-y-4">
          <div
            className="rounded-2xl p-5 text-center space-y-1"
            style={{ background: "rgba(240,165,0,0.04)", border: "1px solid rgba(240,165,0,0.14)" }}
          >
            <p className="text-2xl">📬</p>
            <p className="text-sm font-semibold text-gray-900">{t.s6_step1_title}</p>
            <p className="text-xs text-gray-400">{t.s6_step1_sub}</p>
          </div>
          <Field label={t.s6_email_label} htmlFor="ag-email-s1" error={fieldErr.email}>
            <input
              id="ag-email-s1"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleEmailContinue(); }}
              placeholder={t.s6_email_placeholder}
              className={`${inputBase} ${fieldErr.email ? inputError : inputNormal}`}
            />
          </Field>
          <button
            onClick={handleEmailContinue}
            className="btn-gold-gradient group w-full rounded-2xl px-6 py-4 text-base font-bold text-black flex items-center justify-center gap-2"
            style={{ boxShadow: "0 4px 20px rgba(240,165,0,0.30)" }}
          >
            {t.s6_continue_btn}
            <span className="transition-transform duration-150 group-hover:translate-x-1.5">→</span>
          </button>
          <p className="text-center text-xs text-gray-400">{t.s6_no_spam}</p>
        </div>
      ) : (
        /* ── Step 2: Remaining details ───────────────────────────────────── */
        <div className="space-y-4">
          {/* Email confirmed badge */}
          <div className="flex items-center gap-3 rounded-xl border border-emerald-700/30 bg-emerald-950/20 px-4 py-3">
            <span className="text-emerald-400 text-lg">✓</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-emerald-400 font-semibold">{t.s6_confirmed_label}</p>
              <p className="text-xs text-gray-400 truncate">{email}</p>
            </div>
            <button
              onClick={() => setEmailConfirmed(false)}
              className="text-xs text-gray-500 hover:text-gray-400 shrink-0 underline"
            >
              {t.s6_change}
            </button>
          </div>

          {/* First + Last name */}
          <div className="grid grid-cols-2 gap-3">
            <Field label={t.s6_first_name_label} htmlFor="ag-fname" error={fieldErr.firstName}>
              <input
                id="ag-fname"
                type="text"
                autoComplete="given-name"
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t.s6_fname_placeholder}
                className={`${inputBase} ${fieldErr.firstName ? inputError : inputNormal}`}
              />
            </Field>
            <Field label={t.s6_last_name_label} htmlFor="ag-lname" error={fieldErr.lastName}>
              <input
                id="ag-lname"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t.s6_lname_placeholder}
                className={`${inputBase} ${fieldErr.lastName ? inputError : inputNormal}`}
              />
            </Field>
          </div>

          {/* Phone + country code */}
          <Field label={t.s6_phone_label} htmlFor="ag-phone" error={fieldErr.phone}>
            <div
              className={`flex rounded-xl border overflow-hidden transition ${
                fieldErr.phone
                  ? "border-red-500"
                  : "border-gray-300 focus-within:border-amber-500"
              }`}
            >
              <select
                value={dialCode}
                onChange={(e) => setDialCode(e.target.value)}
                aria-label="Country code"
                className="shrink-0 bg-gray-100 text-gray-800 text-sm border-r border-gray-200 px-3 py-3 focus:outline-none cursor-pointer appearance-none"
                style={{ minWidth: "92px" }}
              >
                {COUNTRY_CODES.map((c, i) => (
                  <option key={i} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <input
                id="ag-phone"
                type="tel"
                autoComplete="tel-national"
                value={phoneLocal}
                onChange={(e) => setPhoneLocal(e.target.value)}
                placeholder="555 000 0000"
                className="flex-1 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {t.s6_phone_sub}
            </p>
          </Field>
        </div>
      )}

      {emailConfirmed && err && (
        <p className="rounded-xl border border-red-800/40 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {err}
        </p>
      )}

      {emailConfirmed && (
      <>
      {/* ── Consent / GDPR checkbox ────────────────────────────────── */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-600 bg-neutral-900 accent-amber-500 cursor-pointer"
        />
        <span className="text-xs text-gray-500 leading-relaxed">
          {t.s6_consent_text}
        </span>
      </label>

      {/* Trust strip */}
      <div className="flex items-center justify-center gap-3 text-xs text-gray-400 flex-wrap">
        <span>{t.s6_trust1}</span>
        <span className="text-gray-300">·</span>
        <span>{t.s6_trust2}</span>
        <span className="text-gray-300">·</span>
        <span>{t.s6_trust3}</span>
      </div>

      <button
        disabled={!canSubmit}
        onClick={handleSubmit}
        className="
          btn-gold-gradient group w-full rounded-2xl px-6 py-4
          text-base font-bold text-black
          disabled:opacity-40 disabled:cursor-not-allowed
          active:scale-95 transition-all duration-150
          flex items-center justify-center gap-2
        "
      >
        {loading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
            {t.s6_loading_btn}
          </>
        ) : (
          <>
            {t.s6_confirm_btn}
            <span className="transition-transform duration-150 group-hover:translate-x-1">→</span>
          </>
        )}
      </button>

      <div className="glass rounded-xl px-4 py-3 text-center space-y-1" style={{ border: "1px solid rgba(240,165,0,0.1)" }}>
        <p className="text-xs text-gray-400">
          {t.s6_privacy_note}
        </p>
        <p className="text-xs text-gray-400">
          {t.s6_min_note} <span className="text-amber-500 font-semibold">$250</span>
        </p>
        <p className="text-xs text-gray-400">
          {t.s6_terms_note}{" "}
          <a href="/terms" className="underline hover:text-neutral-400">{t.s6_terms_link}</a> {t.s6_and}{" "}
          <a href="/privacy" className="underline hover:text-neutral-400">{t.s6_privacy_link}</a>.
        </p>
      </div>
      </>
      )}
    </div>
  );
}
