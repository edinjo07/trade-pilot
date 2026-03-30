-- CreateTable
CREATE TABLE "FunnelSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
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
    "responsibilityScore" INTEGER
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'CA',
    "sessionId" TEXT NOT NULL,
    "disposableEmail" BOOLEAN NOT NULL DEFAULT false,
    "phoneCountryOk" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    CONSTRAINT "Lead_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "FunnelSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FunnelEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "payload" TEXT,
    CONSTRAINT "FunnelEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "FunnelSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Click" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clickId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "sub1" TEXT,
    "sub2" TEXT,
    "sub3" TEXT,
    "sub4" TEXT,
    "offerKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Click_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Conversion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clickId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "payout" REAL,
    "currency" TEXT,
    "raw" JSONB,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Conversion_clickId_fkey" FOREIGN KEY ("clickId") REFERENCES "Click" ("clickId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_sessionId_key" ON "Lead"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Click_clickId_key" ON "Click"("clickId");
