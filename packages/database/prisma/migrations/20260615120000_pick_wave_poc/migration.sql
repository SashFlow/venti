-- CreateEnum
CREATE TYPE "WaveType" AS ENUM ('SINGLE_ORDER', 'BATCH', 'ZONE', 'CLUSTER');

-- AlterTable
ALTER TABLE "public"."PickWave" ADD COLUMN "type" "WaveType" NOT NULL DEFAULT 'BATCH';
ALTER TABLE "public"."PickWave" ADD COLUMN "notes" TEXT;
ALTER TABLE "public"."PickWave" ADD COLUMN "releasedAt" TIMESTAMP(3);
ALTER TABLE "public"."PickWave" ADD COLUMN "completedAt" TIMESTAMP(3);
ALTER TABLE "public"."PickWave" ADD COLUMN "releasedByUserId" TEXT;

-- CreateTable
CREATE TABLE "public"."PickWaveSalesOrder" (
    "pickWaveId" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,

    CONSTRAINT "PickWaveSalesOrder_pkey" PRIMARY KEY ("pickWaveId","salesOrderId")
);

-- CreateTable
CREATE TABLE "public"."PickWaveLine" (
    "id" TEXT NOT NULL,
    "pickWaveId" TEXT NOT NULL,
    "salesOrderItemId" TEXT NOT NULL,
    "qtyToPick" DECIMAL(18,4) NOT NULL,
    "qtyPicked" DECIMAL(18,4) NOT NULL DEFAULT 0,

    CONSTRAINT "PickWaveLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PickWaveLine_pickWaveId_idx" ON "public"."PickWaveLine"("pickWaveId");

-- CreateIndex
CREATE INDEX "PickWaveLine_salesOrderItemId_idx" ON "public"."PickWaveLine"("salesOrderItemId");

-- AddForeignKey
ALTER TABLE "public"."PickWave" ADD CONSTRAINT "PickWave_releasedByUserId_fkey" FOREIGN KEY ("releasedByUserId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PickWaveSalesOrder" ADD CONSTRAINT "PickWaveSalesOrder_pickWaveId_fkey" FOREIGN KEY ("pickWaveId") REFERENCES "public"."PickWave"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PickWaveSalesOrder" ADD CONSTRAINT "PickWaveSalesOrder_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "public"."SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PickWaveLine" ADD CONSTRAINT "PickWaveLine_pickWaveId_fkey" FOREIGN KEY ("pickWaveId") REFERENCES "public"."PickWave"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PickWaveLine" ADD CONSTRAINT "PickWaveLine_salesOrderItemId_fkey" FOREIGN KEY ("salesOrderItemId") REFERENCES "public"."SalesOrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
