-- CreateTable
CREATE TABLE "ApiHit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ip" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ApiHit_ip_route_createdAt_idx" ON "ApiHit"("ip", "route", "createdAt");
