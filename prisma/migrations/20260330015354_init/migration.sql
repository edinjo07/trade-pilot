-- CreateTable
CREATE TABLE "FunnelSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'CA',
    "userAgent" TEXT,
    "ipHash" TEXT,
    "entryChoice" TEXT,
    "mirrorCount" INTEGER NOT NULL DEFAULT 0,
    "frameChoice" TEXT,
    "simAction" TEXT,
    "simTimeTakenMs" INTEGER,
    "quizQuestionsCount" INTEGER NOT NULL DEFAULT 0,
    "avoidanceType" TEXT,
    "responsibilityScore" INTEGER,

    CONSTRAINT "FunnelSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstName" TEXT NOT NULL DEFAULT '',
    "lastName" TEXT NOT NULL DEFAULT '',
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'CA',
    "sessionId" TEXT NOT NULL,
    "disposableEmail" BOOLEAN NOT NULL DEFAULT false,
    "phoneCountryOk" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "qualityScore" INTEGER NOT NULL DEFAULT 0,
    "qualityTier" TEXT NOT NULL DEFAULT 'unknown',
    "qualityMeta" TEXT,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FunnelEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "payload" TEXT,

    CONSTRAINT "FunnelEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leadId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" TEXT,

    CONSTRAINT "LeadEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Click" (
    "id" TEXT NOT NULL,
    "clickId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "sub1" TEXT,
    "sub2" TEXT,
    "sub3" TEXT,
    "sub4" TEXT,
    "offerKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Click_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversion" (
    "id" TEXT NOT NULL,
    "clickId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "payout" DOUBLE PRECISION,
    "currency" TEXT,
    "txid" TEXT,
    "conversionKey" TEXT NOT NULL,
    "raw" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiHit" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiHit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmIntegration" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "method" TEXT NOT NULL DEFAULT 'POST',
    "endpoint" TEXT NOT NULL,
    "authType" TEXT NOT NULL DEFAULT 'bearer',
    "authHeader" TEXT NOT NULL DEFAULT 'Authorization',
    "authValue" TEXT NOT NULL DEFAULT '',
    "extraHeaders" TEXT,
    "fieldMapping" TEXT,
    "bodyTemplate" TEXT,
    "outboundIpNote" TEXT,
    "inboundEnabled" BOOLEAN NOT NULL DEFAULT false,
    "inboundSlug" TEXT,
    "inboundSecretKey" TEXT,
    "inboundIpWhitelist" TEXT,
    "inboundFieldMapping" TEXT,
    "inboundMethod" TEXT NOT NULL DEFAULT 'POST',

    CONSTRAINT "CrmIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmDelivery" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "integrationId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "requestUrl" TEXT NOT NULL,
    "requestMethod" TEXT NOT NULL,
    "requestHeaders" TEXT,
    "requestBody" TEXT,
    "responseStatus" INTEGER,
    "responseBody" TEXT,
    "durationMs" INTEGER,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "lastError" TEXT,

    CONSTRAINT "CrmDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboundLead" (
    "id" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "integrationId" TEXT,
    "sourceIp" TEXT,
    "rawPayload" TEXT NOT NULL,
    "mappedData" TEXT,
    "createdLeadId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "error" TEXT,

    CONSTRAINT "InboundLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IpWhitelistEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT NOT NULL,
    "label" TEXT,
    "note" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "IpWhitelistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboundCrmJob" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "leadId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "lastAttemptAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "idempotencyKey" TEXT NOT NULL,
    "payload" TEXT,

    CONSTRAINT "OutboundCrmJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_sessionId_key" ON "Lead"("sessionId");

-- CreateIndex
CREATE INDEX "LeadEvent_leadId_createdAt_idx" ON "LeadEvent"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "LeadEvent_type_idx" ON "LeadEvent"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Click_clickId_key" ON "Click"("clickId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversion_conversionKey_key" ON "Conversion"("conversionKey");

-- CreateIndex
CREATE INDEX "ApiHit_ip_route_createdAt_idx" ON "ApiHit"("ip", "route", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_key_key" ON "RateLimit"("key");

-- CreateIndex
CREATE UNIQUE INDEX "CrmIntegration_inboundSlug_key" ON "CrmIntegration"("inboundSlug");

-- CreateIndex
CREATE INDEX "CrmIntegration_active_idx" ON "CrmIntegration"("active");

-- CreateIndex
CREATE INDEX "CrmIntegration_inboundSlug_idx" ON "CrmIntegration"("inboundSlug");

-- CreateIndex
CREATE INDEX "CrmDelivery_integrationId_createdAt_idx" ON "CrmDelivery"("integrationId", "createdAt");

-- CreateIndex
CREATE INDEX "CrmDelivery_leadId_idx" ON "CrmDelivery"("leadId");

-- CreateIndex
CREATE INDEX "CrmDelivery_status_idx" ON "CrmDelivery"("status");

-- CreateIndex
CREATE INDEX "InboundLead_receivedAt_idx" ON "InboundLead"("receivedAt");

-- CreateIndex
CREATE INDEX "InboundLead_integrationId_idx" ON "InboundLead"("integrationId");

-- CreateIndex
CREATE INDEX "InboundLead_status_idx" ON "InboundLead"("status");

-- CreateIndex
CREATE INDEX "IpWhitelistEntry_active_idx" ON "IpWhitelistEntry"("active");

-- CreateIndex
CREATE UNIQUE INDEX "IpWhitelistEntry_ip_key" ON "IpWhitelistEntry"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "OutboundCrmJob_idempotencyKey_key" ON "OutboundCrmJob"("idempotencyKey");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "FunnelSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FunnelEvent" ADD CONSTRAINT "FunnelEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "FunnelSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadEvent" ADD CONSTRAINT "LeadEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Click" ADD CONSTRAINT "Click_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversion" ADD CONSTRAINT "Conversion_clickId_fkey" FOREIGN KEY ("clickId") REFERENCES "Click"("clickId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmDelivery" ADD CONSTRAINT "CrmDelivery_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "CrmIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboundLead" ADD CONSTRAINT "InboundLead_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "CrmIntegration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboundCrmJob" ADD CONSTRAINT "OutboundCrmJob_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
