-- AlterTable PickWave
ALTER TABLE "public"."PickWave" ADD COLUMN "routePlan" JSONB;
ALTER TABLE "public"."PickWave" ADD COLUMN "naiveDistanceM" DECIMAL(12,2);
ALTER TABLE "public"."PickWave" ADD COLUMN "optimizedDistanceM" DECIMAL(12,2);
ALTER TABLE "public"."PickWave" ADD COLUMN "savingsPercent" DECIMAL(5,2);
ALTER TABLE "public"."PickWave" ADD COLUMN "pickerCount" INTEGER;

-- AlterTable PickWaveLine
ALTER TABLE "public"."PickWaveLine" ADD COLUMN "locationId" TEXT;
ALTER TABLE "public"."PickWaveLine" ADD COLUMN "pickSequence" INTEGER;
ALTER TABLE "public"."PickWaveLine" ADD COLUMN "pickerLabel" TEXT;
ALTER TABLE "public"."PickWaveLine" ADD COLUMN "cartId" TEXT;
ALTER TABLE "public"."PickWaveLine" ADD COLUMN "zoneCode" TEXT;

-- CreateIndex
CREATE INDEX "PickWaveLine_locationId_idx" ON "public"."PickWaveLine"("locationId");

-- AddForeignKey
ALTER TABLE "public"."PickWaveLine" ADD CONSTRAINT "PickWaveLine_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
