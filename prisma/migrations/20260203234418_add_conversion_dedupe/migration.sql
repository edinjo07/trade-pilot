/*
  Warnings:

  - Added the required column `conversionKey` to the `Conversion` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Conversion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clickId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "payout" REAL,
    "currency" TEXT,
    "txid" TEXT,
    "conversionKey" TEXT NOT NULL,
    "raw" JSONB,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Conversion_clickId_fkey" FOREIGN KEY ("clickId") REFERENCES "Click" ("clickId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Conversion" ("clickId", "currency", "id", "payout", "raw", "receivedAt", "status") SELECT "clickId", "currency", "id", "payout", "raw", "receivedAt", "status" FROM "Conversion";
DROP TABLE "Conversion";
ALTER TABLE "new_Conversion" RENAME TO "Conversion";
CREATE UNIQUE INDEX "Conversion_conversionKey_key" ON "Conversion"("conversionKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
