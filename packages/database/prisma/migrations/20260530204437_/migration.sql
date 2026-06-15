/*
  Warnings:

  - You are about to drop the column `isWholesaler` on the `Customer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transferOrderId]` on the table `Shipment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[returnToSupplierOrderId]` on the table `Shipment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."SupplierType" AS ENUM ('VENDOR', 'FACTORY');

-- CreateEnum
CREATE TYPE "public"."CustomerType" AS ENUM ('RETAIL', 'WHOLESALE', 'VENDOR', 'TECHNICIAN');

-- CreateEnum
CREATE TYPE "public"."LedgerEntryType" AS ENUM ('PURCHASE', 'FREIGHT', 'HOLDING_COST', 'COGS', 'SHRINKAGE', 'INVENTORY_GAIN', 'SCRAP', 'RTV_CREDIT');

-- CreateEnum
CREATE TYPE "public"."TransferOrderStatus" AS ENUM ('DRAFT', 'APPROVED', 'IN_TRANSIT', 'PARTIAL', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ReturnToSupplierStatus" AS ENUM ('DRAFT', 'APPROVED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."Shipment" DROP CONSTRAINT "Shipment_salesOrderId_fkey";

-- AlterTable
ALTER TABLE "public"."AdvancedShippingNotice" ADD COLUMN     "transferOrderId" TEXT;

-- AlterTable
ALTER TABLE "public"."Asset" ADD COLUMN     "locationId" TEXT;

-- AlterTable
ALTER TABLE "public"."Customer" DROP COLUMN "isWholesaler",
ADD COLUMN     "type" "public"."CustomerType" NOT NULL DEFAULT 'RETAIL';

-- AlterTable
ALTER TABLE "public"."InventoryTransaction" ADD COLUMN     "totalValue" DECIMAL(18,4),
ADD COLUMN     "unitCost" DECIMAL(18,4);

-- AlterTable
ALTER TABLE "public"."ReceivingOrder" ADD COLUMN     "transferOrderId" TEXT;

-- AlterTable
ALTER TABLE "public"."Shipment" ADD COLUMN     "returnToSupplierOrderId" TEXT,
ADD COLUMN     "transferOrderId" TEXT,
ALTER COLUMN "salesOrderId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Supplier" ADD COLUMN     "addressId" TEXT,
ADD COLUMN     "type" "public"."SupplierType" NOT NULL DEFAULT 'VENDOR';

-- AlterTable
ALTER TABLE "public"."Warehouse" ADD COLUMN     "holdingCostPerVolumeUnit" DECIMAL(18,4),
ADD COLUMN     "holdingCostPerWeightUnit" DECIMAL(18,4);

-- CreateTable
CREATE TABLE "public"."InventoryCost" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "averageUnitCost" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CostLedger" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "warehouseId" TEXT,
    "type" "public"."LedgerEntryType" NOT NULL,
    "amount" DECIMAL(18,4) NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CostLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TransportationRoute" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "fromAddressId" TEXT NOT NULL,
    "toAddressId" TEXT NOT NULL,
    "distanceKm" DECIMAL(12,2) NOT NULL,
    "baseCostPerKm" DECIMAL(18,4),
    "costPerWeightUnitPerKm" DECIMAL(18,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportationRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TransferOrder" (
    "id" TEXT NOT NULL,
    "sourceWarehouseId" TEXT NOT NULL,
    "destinationWarehouseId" TEXT NOT NULL,
    "routeId" TEXT,
    "transferNumber" TEXT NOT NULL,
    "status" "public"."TransferOrderStatus" NOT NULL,
    "totalWeight" DECIMAL(18,4),
    "freightCost" DECIMAL(18,4),
    "shippedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransferOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TransferOrderItem" (
    "id" TEXT NOT NULL,
    "transferOrderId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "orderedQty" DECIMAL(18,4) NOT NULL,
    "shippedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "receivedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,

    CONSTRAINT "TransferOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReturnToSupplierOrder" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "routeId" TEXT,
    "rtvNumber" TEXT NOT NULL,
    "status" "public"."ReturnToSupplierStatus" NOT NULL,
    "totalWeight" DECIMAL(18,4),
    "freightCost" DECIMAL(18,4),
    "shippedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReturnToSupplierOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReturnToSupplierOrderItem" (
    "id" TEXT NOT NULL,
    "returnToSupplierOrderId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "shippedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,

    CONSTRAINT "ReturnToSupplierOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InventoryCost_warehouseId_skuId_key" ON "public"."InventoryCost"("warehouseId", "skuId");

-- CreateIndex
CREATE INDEX "CostLedger_organizationId_createdAt_idx" ON "public"."CostLedger"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "CostLedger_warehouseId_type_idx" ON "public"."CostLedger"("warehouseId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "TransportationRoute_fromAddressId_toAddressId_key" ON "public"."TransportationRoute"("fromAddressId", "toAddressId");

-- CreateIndex
CREATE UNIQUE INDEX "TransferOrder_sourceWarehouseId_transferNumber_key" ON "public"."TransferOrder"("sourceWarehouseId", "transferNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ReturnToSupplierOrder_warehouseId_rtvNumber_key" ON "public"."ReturnToSupplierOrder"("warehouseId", "rtvNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_transferOrderId_key" ON "public"."Shipment"("transferOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_returnToSupplierOrderId_key" ON "public"."Shipment"("returnToSupplierOrderId");

-- AddForeignKey
ALTER TABLE "public"."Asset" ADD CONSTRAINT "Asset_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Supplier" ADD CONSTRAINT "Supplier_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "public"."address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdvancedShippingNotice" ADD CONSTRAINT "AdvancedShippingNotice_transferOrderId_fkey" FOREIGN KEY ("transferOrderId") REFERENCES "public"."TransferOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReceivingOrder" ADD CONSTRAINT "ReceivingOrder_transferOrderId_fkey" FOREIGN KEY ("transferOrderId") REFERENCES "public"."TransferOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shipment" ADD CONSTRAINT "Shipment_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "public"."SalesOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shipment" ADD CONSTRAINT "Shipment_transferOrderId_fkey" FOREIGN KEY ("transferOrderId") REFERENCES "public"."TransferOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shipment" ADD CONSTRAINT "Shipment_returnToSupplierOrderId_fkey" FOREIGN KEY ("returnToSupplierOrderId") REFERENCES "public"."ReturnToSupplierOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryCost" ADD CONSTRAINT "InventoryCost_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryCost" ADD CONSTRAINT "InventoryCost_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."SKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CostLedger" ADD CONSTRAINT "CostLedger_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CostLedger" ADD CONSTRAINT "CostLedger_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransportationRoute" ADD CONSTRAINT "TransportationRoute_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransportationRoute" ADD CONSTRAINT "TransportationRoute_fromAddressId_fkey" FOREIGN KEY ("fromAddressId") REFERENCES "public"."address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransportationRoute" ADD CONSTRAINT "TransportationRoute_toAddressId_fkey" FOREIGN KEY ("toAddressId") REFERENCES "public"."address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransferOrder" ADD CONSTRAINT "TransferOrder_sourceWarehouseId_fkey" FOREIGN KEY ("sourceWarehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransferOrder" ADD CONSTRAINT "TransferOrder_destinationWarehouseId_fkey" FOREIGN KEY ("destinationWarehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransferOrder" ADD CONSTRAINT "TransferOrder_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "public"."TransportationRoute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransferOrderItem" ADD CONSTRAINT "TransferOrderItem_transferOrderId_fkey" FOREIGN KEY ("transferOrderId") REFERENCES "public"."TransferOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TransferOrderItem" ADD CONSTRAINT "TransferOrderItem_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."SKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReturnToSupplierOrder" ADD CONSTRAINT "ReturnToSupplierOrder_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReturnToSupplierOrder" ADD CONSTRAINT "ReturnToSupplierOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "public"."Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReturnToSupplierOrder" ADD CONSTRAINT "ReturnToSupplierOrder_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "public"."TransportationRoute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReturnToSupplierOrderItem" ADD CONSTRAINT "ReturnToSupplierOrderItem_returnToSupplierOrderId_fkey" FOREIGN KEY ("returnToSupplierOrderId") REFERENCES "public"."ReturnToSupplierOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReturnToSupplierOrderItem" ADD CONSTRAINT "ReturnToSupplierOrderItem_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."SKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
