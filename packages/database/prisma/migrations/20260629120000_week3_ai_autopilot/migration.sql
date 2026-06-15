-- CreateTable
CREATE TABLE "public"."autopilot_rule" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "lastRunAt" TIMESTAMP(3),
    "lastAction" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "autopilot_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."insight_dismissal" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "insightKey" TEXT NOT NULL,
    "dismissedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dismissedByUserId" TEXT,

    CONSTRAINT "insight_dismissal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "autopilot_rule_organizationId_enabled_idx" ON "public"."autopilot_rule"("organizationId", "enabled");

-- CreateIndex
CREATE UNIQUE INDEX "autopilot_rule_organizationId_key_key" ON "public"."autopilot_rule"("organizationId", "key");

-- CreateIndex
CREATE INDEX "insight_dismissal_organizationId_idx" ON "public"."insight_dismissal"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "insight_dismissal_organizationId_insightKey_key" ON "public"."insight_dismissal"("organizationId", "insightKey");

-- AddForeignKey
ALTER TABLE "public"."autopilot_rule" ADD CONSTRAINT "autopilot_rule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."insight_dismissal" ADD CONSTRAINT "insight_dismissal_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
