-- ============================================================
--  TradePilot — Supabase Database Setup Script
--  Run this in the Supabase SQL Editor on a fresh project.
--  https://supabase.com/dashboard → SQL Editor → New query
-- ============================================================

-- Enable pgcrypto for gen_random_uuid() (available by default on Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ── 1. FunnelSession ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "FunnelSession" (
  "id"                   TEXT         PRIMARY KEY,
  "createdAt"            TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "updatedAt"            TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "country"              TEXT         NOT NULL DEFAULT 'CA',
  "userAgent"            TEXT,
  "ipHash"               TEXT,
  "entryChoice"          TEXT,
  "mirrorCount"          INT          NOT NULL DEFAULT 0,
  "frameChoice"          TEXT,
  "simAction"            TEXT,
  "simTimeTakenMs"       INT,
  "quizQuestionsCount"   INT          NOT NULL DEFAULT 0,
  "avoidanceType"        TEXT,
  "responsibilityScore"  INT
);


-- ── 2. Lead ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Lead" (
  "id"               TEXT         PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "createdAt"        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "firstName"        TEXT         NOT NULL DEFAULT '',
  "lastName"         TEXT         NOT NULL DEFAULT '',
  "fullName"         TEXT         NOT NULL,
  "email"            TEXT         NOT NULL,
  "phone"            TEXT         NOT NULL,
  "country"          TEXT         NOT NULL DEFAULT 'CA',
  "sessionId"        TEXT         NOT NULL UNIQUE REFERENCES "FunnelSession"("id") ON DELETE CASCADE,
  "disposableEmail"  BOOLEAN      NOT NULL DEFAULT false,
  "phoneCountryOk"   BOOLEAN      NOT NULL DEFAULT true,
  "notes"            TEXT,
  "qualityScore"     INT          NOT NULL DEFAULT 0,
  "qualityTier"      TEXT         NOT NULL DEFAULT 'unknown',
  "qualityMeta"      TEXT
);


-- ── 3. FunnelEvent ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "FunnelEvent" (
  "id"        TEXT        PRIMARY KEY,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "sessionId" TEXT        NOT NULL REFERENCES "FunnelSession"("id") ON DELETE CASCADE,
  "name"      TEXT        NOT NULL,
  "payload"   TEXT
);


-- ── 4. LeadEvent ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "LeadEvent" (
  "id"        TEXT        PRIMARY KEY,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "leadId"    TEXT        NOT NULL REFERENCES "Lead"("id") ON DELETE CASCADE,
  "type"      TEXT        NOT NULL,
  "payload"   TEXT
);

CREATE INDEX IF NOT EXISTS "LeadEvent_leadId_createdAt_idx" ON "LeadEvent"("leadId", "createdAt");
CREATE INDEX IF NOT EXISTS "LeadEvent_type_idx"             ON "LeadEvent"("type");


-- ── 5. Visitor ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Visitor" (
  "id"          TEXT        PRIMARY KEY,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "lastSeenAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  "ipHash"      TEXT        NOT NULL,
  "sessionId"   TEXT,
  "country"     TEXT        NOT NULL DEFAULT '',
  "city"        TEXT        NOT NULL DEFAULT '',
  "region"      TEXT        NOT NULL DEFAULT '',
  "userAgent"   TEXT,
  "device"      TEXT        NOT NULL DEFAULT 'desktop',
  "os"          TEXT        NOT NULL DEFAULT '',
  "browser"     TEXT        NOT NULL DEFAULT '',
  "referrer"    TEXT,
  "utmSource"   TEXT,
  "utmMedium"   TEXT,
  "utmCampaign" TEXT,
  "landingPath" TEXT        NOT NULL DEFAULT '/',
  "currentStep" TEXT        NOT NULL DEFAULT 'S1_HOOK',
  "convertedAt" TIMESTAMPTZ,
  "isBot"       BOOLEAN     NOT NULL DEFAULT false,
  "botType"     TEXT
);

CREATE INDEX IF NOT EXISTS "Visitor_createdAt_idx" ON "Visitor"("createdAt");
CREATE INDEX IF NOT EXISTS "Visitor_country_idx"   ON "Visitor"("country");
CREATE INDEX IF NOT EXISTS "Visitor_ipHash_idx"    ON "Visitor"("ipHash");
CREATE INDEX IF NOT EXISTS "Visitor_isBot_idx"     ON "Visitor"("isBot");


-- ── 6. Click ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Click" (
  "id"        TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "clickId"   TEXT        NOT NULL UNIQUE,
  "leadId"    TEXT        NOT NULL REFERENCES "Lead"("id") ON DELETE CASCADE,
  "sub1"      TEXT,
  "sub2"      TEXT,
  "sub3"      TEXT,
  "sub4"      TEXT,
  "offerKey"  TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ── 7. Conversion ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Conversion" (
  "id"            TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "clickId"       TEXT        NOT NULL REFERENCES "Click"("clickId") ON DELETE CASCADE,
  "status"        TEXT        NOT NULL,
  "payout"        FLOAT,
  "currency"      TEXT,
  "txid"          TEXT,
  "conversionKey" TEXT        NOT NULL UNIQUE,
  "raw"           TEXT,
  "receivedAt"    TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ── 8. ApiHit ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ApiHit" (
  "id"        TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "ip"        TEXT        NOT NULL,
  "route"     TEXT        NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "ApiHit_ip_route_createdAt_idx" ON "ApiHit"("ip", "route", "createdAt");


-- ── 9. GeoConfig ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "GeoConfig" (
  "id"        INT         PRIMARY KEY DEFAULT 1,
  "mode"      TEXT        NOT NULL DEFAULT 'all',
  "countries" TEXT        NOT NULL DEFAULT '[]',
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the single config row
INSERT INTO "GeoConfig" ("id", "mode", "countries")
VALUES (1, 'all', '[]')
ON CONFLICT ("id") DO NOTHING;


-- ── 10. RateLimit ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "RateLimit" (
  "id"          TEXT        PRIMARY KEY,
  "key"         TEXT        NOT NULL UNIQUE,
  "count"       INT         NOT NULL DEFAULT 0,
  "windowStart" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ── 11. CrmIntegration ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "CrmIntegration" (
  "id"                  TEXT        PRIMARY KEY,
  "createdAt"           TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"           TIMESTAMPTZ NOT NULL DEFAULT now(),
  "name"                TEXT        NOT NULL,
  "platform"            TEXT        NOT NULL,
  "active"              BOOLEAN     NOT NULL DEFAULT true,
  "method"              TEXT        NOT NULL DEFAULT 'POST',
  "endpoint"            TEXT        NOT NULL,
  "authType"            TEXT        NOT NULL DEFAULT 'bearer',
  "authHeader"          TEXT        NOT NULL DEFAULT 'Authorization',
  "authValue"           TEXT        NOT NULL DEFAULT '',
  "extraHeaders"        TEXT,
  "fieldMapping"        TEXT,
  "bodyTemplate"        TEXT,
  "outboundIpNote"      TEXT,
  "inboundEnabled"      BOOLEAN     NOT NULL DEFAULT false,
  "inboundSlug"         TEXT        UNIQUE,
  "inboundSecretKey"    TEXT,
  "inboundIpWhitelist"  TEXT,
  "inboundFieldMapping" TEXT,
  "inboundMethod"       TEXT        NOT NULL DEFAULT 'POST'
);

CREATE INDEX IF NOT EXISTS "CrmIntegration_active_idx"       ON "CrmIntegration"("active");
CREATE INDEX IF NOT EXISTS "CrmIntegration_inboundSlug_idx"  ON "CrmIntegration"("inboundSlug");


-- ── 12. CrmDelivery ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "CrmDelivery" (
  "id"              TEXT        PRIMARY KEY,
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT now(),
  "integrationId"   TEXT        NOT NULL REFERENCES "CrmIntegration"("id") ON DELETE CASCADE,
  "leadId"          TEXT        NOT NULL,
  "status"          TEXT        NOT NULL,
  "requestUrl"      TEXT        NOT NULL,
  "requestMethod"   TEXT        NOT NULL,
  "requestHeaders"  TEXT,
  "requestBody"     TEXT,
  "responseStatus"  INT,
  "responseBody"    TEXT,
  "durationMs"      INT,
  "attempts"        INT         NOT NULL DEFAULT 1,
  "lastError"       TEXT
);

CREATE INDEX IF NOT EXISTS "CrmDelivery_integrationId_createdAt_idx" ON "CrmDelivery"("integrationId", "createdAt");
CREATE INDEX IF NOT EXISTS "CrmDelivery_leadId_idx"                   ON "CrmDelivery"("leadId");
CREATE INDEX IF NOT EXISTS "CrmDelivery_status_idx"                   ON "CrmDelivery"("status");


-- ── 13. InboundLead ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "InboundLead" (
  "id"            TEXT        PRIMARY KEY,
  "receivedAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "integrationId" TEXT        REFERENCES "CrmIntegration"("id") ON DELETE SET NULL,
  "sourceIp"      TEXT,
  "rawPayload"    TEXT        NOT NULL,
  "mappedData"    TEXT,
  "createdLeadId" TEXT,
  "status"        TEXT        NOT NULL DEFAULT 'RECEIVED',
  "error"         TEXT
);

CREATE INDEX IF NOT EXISTS "InboundLead_receivedAt_idx"    ON "InboundLead"("receivedAt");
CREATE INDEX IF NOT EXISTS "InboundLead_integrationId_idx" ON "InboundLead"("integrationId");
CREATE INDEX IF NOT EXISTS "InboundLead_status_idx"        ON "InboundLead"("status");


-- ── 14. IpWhitelistEntry ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "IpWhitelistEntry" (
  "id"        TEXT        PRIMARY KEY,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "ip"        TEXT        NOT NULL UNIQUE,
  "label"     TEXT,
  "note"      TEXT,
  "active"    BOOLEAN     NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS "IpWhitelistEntry_active_idx" ON "IpWhitelistEntry"("active");


-- ── 15. OutboundCrmJob ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "OutboundCrmJob" (
  "id"             TEXT        PRIMARY KEY,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT now(),
  "leadId"         TEXT        NOT NULL REFERENCES "Lead"("id") ON DELETE CASCADE,
  "status"         TEXT        NOT NULL DEFAULT 'PENDING',
  "attempts"       INT         NOT NULL DEFAULT 0,
  "lastError"      TEXT,
  "lastAttemptAt"  TIMESTAMPTZ,
  "sentAt"         TIMESTAMPTZ,
  "idempotencyKey" TEXT        NOT NULL UNIQUE,
  "payload"        TEXT
);


-- ============================================================
--  Done. All 15 tables created.
--  Next steps:
--  1. Copy your new DATABASE_URL and DATABASE_URL_DIRECT from
--     Supabase → Project Settings → Database → Connection string
--  2. Paste them into your .env (and Vercel env vars)
--  3. Run: npx prisma generate  (no migration needed — tables exist)
-- ============================================================
