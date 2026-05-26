/*
  Warnings:

  - A unique constraint covering the columns `[warehouseId,shipmentNumber]` on the table `Shipment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shipmentNumber` to the `Shipment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Shipment" ADD COLUMN     "dockDoorId" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "shipmentNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_warehouseId_shipmentNumber_key" ON "public"."Shipment"("warehouseId", "shipmentNumber");
