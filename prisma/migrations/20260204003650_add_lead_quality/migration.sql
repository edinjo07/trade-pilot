-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lead" (
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
    "qualityScore" INTEGER NOT NULL DEFAULT 0,
    "qualityTier" TEXT NOT NULL DEFAULT 'unknown',
    "qualityMeta" JSONB,
    CONSTRAINT "Lead_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "FunnelSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Lead" ("country", "createdAt", "disposableEmail", "email", "fullName", "id", "notes", "phone", "phoneCountryOk", "sessionId") SELECT "country", "createdAt", "disposableEmail", "email", "fullName", "id", "notes", "phone", "phoneCountryOk", "sessionId" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
CREATE UNIQUE INDEX "Lead_sessionId_key" ON "Lead"("sessionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
