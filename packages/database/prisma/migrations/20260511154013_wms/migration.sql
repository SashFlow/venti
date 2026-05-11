/*
  Warnings:

  - The `metadata` column on the `organization` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `fell` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `picture` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `twoFactor` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `note_tag` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[credentialID]` on the table `passkey` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."WarehouseStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."FloorStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "public"."ZoneType" AS ENUM ('BULK', 'PICKING', 'SPARE_PARTS', 'INBOUND', 'OUTBOUND', 'RETURNS', 'QC', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."StorageUnitType" AS ENUM ('AREA', 'FLOOR_LOCATION', 'FLOOR_STACK', 'RACK', 'RACK_LEVEL', 'PALLET_SLOT', 'SHELF', 'SHELF_LEVEL', 'BIN', 'STAGING', 'QC', 'RETURNS', 'DAMAGE', 'PICKING', 'CROSS_DOCK', 'SECURE_CAGE', 'MEZZANINE', 'TOOL_STORAGE', 'PACKAGING_STORAGE', 'REFRIGERANT_STORAGE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."StorageUnitStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'FULL', 'MAINTENANCE', 'DISABLED');

-- CreateEnum
CREATE TYPE "public"."HandlingUnitType" AS ENUM ('PALLET', 'CARTON', 'TOTE', 'CRATE', 'LOOSE');

-- CreateEnum
CREATE TYPE "public"."HandlingUnitStatus" AS ENUM ('ACTIVE', 'SEALED', 'DAMAGED', 'DISPATCHED');

-- CreateEnum
CREATE TYPE "public"."InventoryStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'DAMAGED', 'QC_HOLD', 'RETURNED');

-- CreateEnum
CREATE TYPE "public"."InventoryTransactionType" AS ENUM ('RECEIVED', 'PUTAWAY', 'INTERNAL_TRANSFER', 'PICK', 'PACK', 'STAGING', 'SHIP', 'RETURN_RECEIVED', 'RETURN_RESTOCK', 'QC_HOLD', 'QC_RELEASE', 'DAMAGE', 'ADJUSTMENT', 'SPLIT', 'MERGE', 'PALLETIZE', 'DEPALLETIZE', 'CYCLE_COUNT');

-- CreateEnum
CREATE TYPE "public"."InventoryMovementStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."LayoutVersionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."TaskType" AS ENUM ('RECEIVE', 'PUTAWAY', 'PICK', 'PACK', 'SHIP', 'TRANSFER', 'CYCLE_COUNT', 'QC_INSPECT', 'REPLENISH', 'RETURNS_INTAKE');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."TaskPriority" AS ENUM ('CRITICAL', 'HIGH', 'NORMAL', 'LOW');

-- CreateEnum
CREATE TYPE "public"."SKULifecycle" AS ENUM ('ACTIVE', 'DISCONTINUED', 'OBSOLETE');

-- CreateEnum
CREATE TYPE "public"."AllocationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PARTIALLY_RELEASED', 'RELEASED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."CycleCountType" AS ENUM ('FULL', 'PARTIAL', 'BLIND', 'ABC_A', 'ABC_B', 'ABC_C', 'RANDOM');

-- CreateEnum
CREATE TYPE "public"."CycleCountStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'PENDING_APPROVAL', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."CycleCountLineStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COUNTED', 'RECOUNT_REQUIRED', 'APPROVED', 'DISCREPANCY_ACCEPTED');

-- CreateEnum
CREATE TYPE "public"."DockDoorType" AS ENUM ('INBOUND', 'OUTBOUND', 'BIDIRECTIONAL');

-- CreateEnum
CREATE TYPE "public"."DockDoorStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'DISABLED');

-- CreateEnum
CREATE TYPE "public"."PurchaseOrderStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'SENT_TO_SUPPLIER', 'ACKNOWLEDGED', 'PARTIALLY_RECEIVED', 'FULLY_RECEIVED', 'CANCELLED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."PurchaseOrderLineStatus" AS ENUM ('PENDING', 'PARTIALLY_RECEIVED', 'FULLY_RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ASNStatus" AS ENUM ('DRAFT', 'SENT', 'IN_TRANSIT', 'ARRIVED', 'PARTIALLY_RECEIVED', 'FULLY_RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ReceiptStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."SalesOrderStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'PARTIALLY_ALLOCATED', 'FULLY_ALLOCATED', 'PARTIALLY_PICKED', 'FULLY_PICKED', 'PARTIALLY_SHIPPED', 'FULLY_SHIPPED', 'CANCELLED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."SalesOrderLineStatus" AS ENUM ('PENDING', 'PARTIALLY_ALLOCATED', 'FULLY_ALLOCATED', 'PARTIALLY_PICKED', 'FULLY_PICKED', 'PARTIALLY_SHIPPED', 'FULLY_SHIPPED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."SalesOrderPriority" AS ENUM ('CRITICAL', 'HIGH', 'NORMAL', 'LOW');

-- CreateEnum
CREATE TYPE "public"."WaveStatus" AS ENUM ('DRAFT', 'RELEASED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."WaveType" AS ENUM ('SINGLE_ORDER', 'BATCH', 'ZONE', 'CLUSTER');

-- CreateEnum
CREATE TYPE "public"."ShipmentStatus" AS ENUM ('PENDING', 'READY_TO_SHIP', 'LOADED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'RETURNED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."twoFactor" DROP CONSTRAINT "twoFactor_userId_fkey";

-- AlterTable
ALTER TABLE "public"."audit_log" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "public"."member" ADD COLUMN     "roleGroupId" TEXT;

-- AlterTable
ALTER TABLE "public"."organization" DROP COLUMN "metadata",
ADD COLUMN     "metadata" JSONB;

-- DropTable
DROP TABLE "public"."fell";

-- DropTable
DROP TABLE "public"."picture";

-- DropTable
DROP TABLE "public"."twoFactor";

-- CreateTable
CREATE TABLE "public"."two_factor" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "two_factor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role_group" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" TEXT[],

    CONSTRAINT "role_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."address" (
    "id" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."task" (
    "id" TEXT NOT NULL,
    "type" "public"."TaskType" NOT NULL,
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "public"."TaskPriority" NOT NULL DEFAULT 'NORMAL',
    "description" TEXT NOT NULL,
    "assignedToId" TEXT,
    "assignedById" TEXT,
    "warehouseId" TEXT,
    "deadline" TIMESTAMP(3),
    "slaDeadline" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organization_config" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "headquarterId" TEXT NOT NULL,
    "fulfillment" JSONB,
    "inventory" JSONB,
    "units" JSONB,
    "barcodeScanner" JSONB,
    "purchaseOrders" JSONB,
    "transfers" JSONB,
    "cycleCount" JSONB,
    "dataRetention" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."uom" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "abbreviation" VARCHAR(20) NOT NULL,
    "isBase" BOOLEAN NOT NULL DEFAULT false,
    "precision" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "uom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."uom_conversion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fromUomId" TEXT NOT NULL,
    "toUomId" TEXT NOT NULL,
    "factor" DECIMAL(18,8) NOT NULL,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),

    CONSTRAINT "uom_conversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sku_category" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "sku_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."supplier" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "defaultLeadTimeDays" INTEGER,
    "metadata" JSONB,

    CONSTRAINT "supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sku_supplier" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "skuId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "vendorCode" VARCHAR(100),
    "leadTimeDays" INTEGER,
    "moq" DECIMAL(12,4),
    "unitPrice" DECIMAL(18,4),

    CONSTRAINT "sku_supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."warehouse" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "addressId" TEXT,
    "returnAddressId" TEXT,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'UTC',
    "status" "public"."WarehouseStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."warehouse_floor" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "floorNumber" INTEGER NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255),
    "status" "public"."FloorStatus" NOT NULL DEFAULT 'ACTIVE',
    "widthMm" DECIMAL(12,2),
    "lengthMm" DECIMAL(12,2),
    "heightMm" DECIMAL(12,2),
    "originX" DECIMAL(12,2) DEFAULT 0,
    "originY" DECIMAL(12,2) DEFAULT 0,
    "originZ" DECIMAL(12,2) DEFAULT 0,
    "elevationMm" DECIMAL(12,2) DEFAULT 0,
    "metadata" JSONB,

    CONSTRAINT "warehouse_floor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."zone" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" "public"."ZoneType" NOT NULL,
    "colorHex" VARCHAR(20),
    "metadata" JSONB,

    CONSTRAINT "zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."storage_unit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "floorId" TEXT,
    "zoneId" TEXT,
    "parentStorageUnitId" TEXT,
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255),
    "barcode" VARCHAR(255),
    "qrCode" VARCHAR(255),
    "type" "public"."StorageUnitType" NOT NULL,
    "status" "public"."StorageUnitStatus" NOT NULL DEFAULT 'ACTIVE',
    "startX" DECIMAL(12,2) DEFAULT 0,
    "startY" DECIMAL(12,2) DEFAULT 0,
    "startZ" DECIMAL(12,2) DEFAULT 0,
    "widthMm" DECIMAL(12,2),
    "lengthMm" DECIMAL(12,2),
    "heightMm" DECIMAL(12,2),
    "rotationXDeg" DECIMAL(8,2) DEFAULT 0,
    "rotationYDeg" DECIMAL(8,2) DEFAULT 0,
    "rotationZDeg" DECIMAL(8,2) DEFAULT 0,
    "maxWeightKg" DECIMAL(12,2),
    "maxVolumeM3" DECIMAL(12,4),
    "maxPallets" INTEGER,
    "maxUnits" INTEGER,
    "levelIndex" INTEGER,
    "positionIndex" INTEGER,
    "sequence" INTEGER,
    "allowMixedSku" BOOLEAN NOT NULL DEFAULT false,
    "allowMixedBatch" BOOLEAN NOT NULL DEFAULT false,
    "allowLooseInventory" BOOLEAN NOT NULL DEFAULT true,
    "allowPalletInventory" BOOLEAN NOT NULL DEFAULT true,
    "allowCartonInventory" BOOLEAN NOT NULL DEFAULT true,
    "isPickable" BOOLEAN NOT NULL DEFAULT true,
    "isStorable" BOOLEAN NOT NULL DEFAULT true,
    "isInboundAllowed" BOOLEAN NOT NULL DEFAULT true,
    "isOutboundAllowed" BOOLEAN NOT NULL DEFAULT true,
    "isCycleCountEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "colorHex" VARCHAR(20),
    "labelColorHex" VARCHAR(20),
    "icon" VARCHAR(100),
    "metadata" JSONB,

    CONSTRAINT "storage_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."handling_unit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "barcode" VARCHAR(255),
    "type" "public"."HandlingUnitType" NOT NULL,
    "status" "public"."HandlingUnitStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentStorageUnitId" TEXT,
    "parentHandlingUnitId" TEXT,
    "widthMm" DECIMAL(12,2),
    "lengthMm" DECIMAL(12,2),
    "heightMm" DECIMAL(12,2),
    "weightKg" DECIMAL(12,2),
    "metadata" JSONB,

    CONSTRAINT "handling_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sku" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "skuCode" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "lifecycle" "public"."SKULifecycle" NOT NULL DEFAULT 'ACTIVE',
    "gtin" VARCHAR(50),
    "uomId" TEXT,
    "categoryId" TEXT,
    "widthMm" DECIMAL(12,2),
    "lengthMm" DECIMAL(12,2),
    "heightMm" DECIMAL(12,2),
    "weightKg" DECIMAL(12,2),
    "reorderPoint" DECIMAL(12,4),
    "minStock" DECIMAL(12,4),
    "maxStock" DECIMAL(12,4),
    "serialTracking" BOOLEAN NOT NULL DEFAULT false,
    "batchTracking" BOOLEAN NOT NULL DEFAULT false,
    "expiryTracking" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,

    CONSTRAINT "sku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inventory_item" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "currentStorageUnitId" TEXT,
    "currentHandlingUnitId" TEXT,
    "serialNumber" VARCHAR(255),
    "batchNumber" VARCHAR(255),
    "expiryDate" TIMESTAMP(3),
    "manufactureDate" TIMESTAMP(3),
    "quantity" DECIMAL(12,4) NOT NULL DEFAULT 1,
    "costPrice" DECIMAL(18,4),
    "status" "public"."InventoryStatus" NOT NULL DEFAULT 'AVAILABLE',
    "metadata" JSONB,

    CONSTRAINT "inventory_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inventory_movement" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "transactionType" "public"."InventoryTransactionType" NOT NULL,
    "status" "public"."InventoryMovementStatus" NOT NULL DEFAULT 'PENDING',
    "fromStorageUnitId" TEXT,
    "fromHandlingUnitId" TEXT,
    "toStorageUnitId" TEXT,
    "toHandlingUnitId" TEXT,
    "quantity" DECIMAL(12,4) NOT NULL,
    "referenceNumber" VARCHAR(100),
    "notes" TEXT,
    "metadata" JSONB,
    "performedByUserId" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "transferGroupId" TEXT,

    CONSTRAINT "inventory_movement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."layout_version" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "floorId" TEXT,
    "version" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "status" "public"."LayoutVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "publishedByUserId" TEXT,
    "sceneDataUrl" TEXT,
    "notes" TEXT,

    CONSTRAINT "layout_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inventory_allocation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "allocatedQty" DECIMAL(12,4) NOT NULL,
    "releasedQty" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "status" "public"."AllocationStatus" NOT NULL DEFAULT 'PENDING',
    "salesOrderId" TEXT,
    "waveId" TEXT,
    "pickTaskId" TEXT,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "inventory_allocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inventory_balance" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "storageUnitId" TEXT,
    "handlingUnitId" TEXT,
    "batchNumber" VARCHAR(255),
    "expiryDate" TIMESTAMP(3),
    "qtyOnHand" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "qtyReserved" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "qtyDamaged" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "qtyQcHold" DECIMAL(12,4) NOT NULL DEFAULT 0,

    CONSTRAINT "inventory_balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cycle_count_session" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "type" "public"."CycleCountType" NOT NULL,
    "status" "public"."CycleCountStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledDate" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "assignedToId" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "cycle_count_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cycle_count_line" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,
    "storageUnitId" TEXT NOT NULL,
    "skuId" TEXT,
    "batchNumber" VARCHAR(255),
    "expiryDate" TIMESTAMP(3),
    "systemQty" DECIMAL(12,4) NOT NULL,
    "countedQty" DECIMAL(12,4),
    "discrepancyQty" DECIMAL(12,4),
    "status" "public"."CycleCountLineStatus" NOT NULL DEFAULT 'PENDING',
    "recountRequired" BOOLEAN NOT NULL DEFAULT false,
    "countedById" TEXT,
    "countedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "cycle_count_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."carrier" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "scac" VARCHAR(10),
    "trackingUrl" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,

    CONSTRAINT "carrier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."dock_door" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255),
    "type" "public"."DockDoorType" NOT NULL,
    "status" "public"."DockDoorStatus" NOT NULL DEFAULT 'AVAILABLE',
    "metadata" JSONB,

    CONSTRAINT "dock_door_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."purchase_order" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "poNumber" VARCHAR(100) NOT NULL,
    "status" "public"."PurchaseOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "expectedDate" TIMESTAMP(3),
    "orderedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "metadata" JSONB,

    CONSTRAINT "purchase_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."purchase_order_line" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "lineNumber" INTEGER NOT NULL,
    "skuId" TEXT NOT NULL,
    "uomId" TEXT,
    "orderedQty" DECIMAL(12,4) NOT NULL,
    "receivedQty" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "unitCost" DECIMAL(18,4),
    "status" "public"."PurchaseOrderLineStatus" NOT NULL DEFAULT 'PENDING',
    "expectedDate" TIMESTAMP(3),

    CONSTRAINT "purchase_order_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."asn" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "asnNumber" VARCHAR(100) NOT NULL,
    "status" "public"."ASNStatus" NOT NULL DEFAULT 'DRAFT',
    "expectedDate" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "arrivedAt" TIMESTAMP(3),
    "carrierName" VARCHAR(255),
    "trackingNumber" VARCHAR(255),
    "notes" TEXT,
    "metadata" JSONB,

    CONSTRAINT "asn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."asn_line" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "asnId" TEXT NOT NULL,
    "purchaseOrderLineId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "expectedQty" DECIMAL(12,4) NOT NULL,
    "receivedQty" DECIMAL(12,4) NOT NULL DEFAULT 0,

    CONSTRAINT "asn_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."receipt" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "asnId" TEXT,
    "receiptNumber" VARCHAR(100) NOT NULL,
    "status" "public"."ReceiptStatus" NOT NULL DEFAULT 'DRAFT',
    "dockDoorId" TEXT,
    "receivedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "metadata" JSONB,

    CONSTRAINT "receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."receipt_line" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "receiptId" TEXT NOT NULL,
    "purchaseOrderLineId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "uomId" TEXT,
    "receivedQty" DECIMAL(12,4) NOT NULL,
    "acceptedQty" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "rejectedQty" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "batchNumber" VARCHAR(255),
    "expiryDate" TIMESTAMP(3),
    "serialNumbers" TEXT[],
    "notes" TEXT,

    CONSTRAINT "receipt_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sales_order" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "orderNumber" VARCHAR(100) NOT NULL,
    "status" "public"."SalesOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "public"."SalesOrderPriority" NOT NULL DEFAULT 'NORMAL',
    "customerName" VARCHAR(255),
    "customerEmail" VARCHAR(255),
    "customerRef" VARCHAR(100),
    "requestedShipDate" TIMESTAMP(3),
    "requiredByDate" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "shippingAddress" JSONB,
    "notes" TEXT,
    "metadata" JSONB,

    CONSTRAINT "sales_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sales_order_line" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "lineNumber" INTEGER NOT NULL,
    "skuId" TEXT NOT NULL,
    "uomId" TEXT,
    "orderedQty" DECIMAL(12,4) NOT NULL,
    "allocatedQty" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "pickedQty" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "shippedQty" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "unitPrice" DECIMAL(18,4),
    "status" "public"."SalesOrderLineStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "sales_order_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wave" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "waveNumber" VARCHAR(100) NOT NULL,
    "type" "public"."WaveType" NOT NULL DEFAULT 'SINGLE_ORDER',
    "status" "public"."WaveStatus" NOT NULL DEFAULT 'DRAFT',
    "releasedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "releasedById" TEXT,
    "notes" TEXT,
    "metadata" JSONB,

    CONSTRAINT "wave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wave_line" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "waveId" TEXT NOT NULL,
    "salesOrderLineId" TEXT NOT NULL,
    "qtyToPick" DECIMAL(12,4) NOT NULL,
    "qtyPicked" DECIMAL(12,4) NOT NULL DEFAULT 0,

    CONSTRAINT "wave_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shipment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "shipmentNumber" VARCHAR(100) NOT NULL,
    "status" "public"."ShipmentStatus" NOT NULL DEFAULT 'PENDING',
    "carrierId" TEXT,
    "trackingNumber" VARCHAR(255),
    "dockDoorId" TEXT,
    "shippingAddress" JSONB,
    "scheduledAt" TIMESTAMP(3),
    "dispatchedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "dispatchedById" TEXT,
    "notes" TEXT,
    "metadata" JSONB,

    CONSTRAINT "shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shipment_line" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "salesOrderLineId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "shippedQty" DECIMAL(12,4) NOT NULL,
    "serialNumbers" TEXT[],
    "batchNumber" VARCHAR(255),

    CONSTRAINT "shipment_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_RoleGroupWarehouses" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RoleGroupWarehouses_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_WaveSalesOrders" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_WaveSalesOrders_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "two_factor_userId_idx" ON "public"."two_factor"("userId");

-- CreateIndex
CREATE INDEX "role_group_organizationId_idx" ON "public"."role_group"("organizationId");

-- CreateIndex
CREATE INDEX "task_warehouseId_idx" ON "public"."task"("warehouseId");

-- CreateIndex
CREATE INDEX "task_warehouseId_status_idx" ON "public"."task"("warehouseId", "status");

-- CreateIndex
CREATE INDEX "task_assignedToId_idx" ON "public"."task"("assignedToId");

-- CreateIndex
CREATE INDEX "task_assignedToId_status_idx" ON "public"."task"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "task_assignedById_idx" ON "public"."task"("assignedById");

-- CreateIndex
CREATE INDEX "task_status_idx" ON "public"."task"("status");

-- CreateIndex
CREATE INDEX "task_type_idx" ON "public"."task"("type");

-- CreateIndex
CREATE INDEX "task_priority_idx" ON "public"."task"("priority");

-- CreateIndex
CREATE INDEX "task_deadline_idx" ON "public"."task"("deadline");

-- CreateIndex
CREATE UNIQUE INDEX "organization_config_organizationId_key" ON "public"."organization_config"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_config_headquarterId_key" ON "public"."organization_config"("headquarterId");

-- CreateIndex
CREATE INDEX "uom_organizationId_idx" ON "public"."uom"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "uom_organizationId_code_key" ON "public"."uom"("organizationId", "code");

-- CreateIndex
CREATE INDEX "uom_conversion_fromUomId_toUomId_idx" ON "public"."uom_conversion"("fromUomId", "toUomId");

-- CreateIndex
CREATE INDEX "uom_conversion_fromUomId_idx" ON "public"."uom_conversion"("fromUomId");

-- CreateIndex
CREATE INDEX "uom_conversion_toUomId_idx" ON "public"."uom_conversion"("toUomId");

-- CreateIndex
CREATE INDEX "uom_conversion_fromUomId_effectiveFrom_idx" ON "public"."uom_conversion"("fromUomId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "sku_category_organizationId_idx" ON "public"."sku_category"("organizationId");

-- CreateIndex
CREATE INDEX "sku_category_parentId_idx" ON "public"."sku_category"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "sku_category_organizationId_name_key" ON "public"."sku_category"("organizationId", "name");

-- CreateIndex
CREATE INDEX "supplier_organizationId_idx" ON "public"."supplier"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_organizationId_code_key" ON "public"."supplier"("organizationId", "code");

-- CreateIndex
CREATE INDEX "sku_supplier_skuId_idx" ON "public"."sku_supplier"("skuId");

-- CreateIndex
CREATE INDEX "sku_supplier_supplierId_idx" ON "public"."sku_supplier"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "sku_supplier_skuId_supplierId_key" ON "public"."sku_supplier"("skuId", "supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_addressId_key" ON "public"."warehouse"("addressId");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_returnAddressId_key" ON "public"."warehouse"("returnAddressId");

-- CreateIndex
CREATE INDEX "warehouse_organizationId_idx" ON "public"."warehouse"("organizationId");

-- CreateIndex
CREATE INDEX "warehouse_status_idx" ON "public"."warehouse"("status");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_organizationId_code_key" ON "public"."warehouse"("organizationId", "code");

-- CreateIndex
CREATE INDEX "warehouse_floor_warehouseId_idx" ON "public"."warehouse_floor"("warehouseId");

-- CreateIndex
CREATE INDEX "warehouse_floor_status_idx" ON "public"."warehouse_floor"("status");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_floor_warehouseId_floorNumber_key" ON "public"."warehouse_floor"("warehouseId", "floorNumber");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_floor_warehouseId_code_key" ON "public"."warehouse_floor"("warehouseId", "code");

-- CreateIndex
CREATE INDEX "zone_warehouseId_idx" ON "public"."zone"("warehouseId");

-- CreateIndex
CREATE INDEX "zone_type_idx" ON "public"."zone"("type");

-- CreateIndex
CREATE UNIQUE INDEX "zone_warehouseId_code_key" ON "public"."zone"("warehouseId", "code");

-- CreateIndex
CREATE INDEX "storage_unit_warehouseId_idx" ON "public"."storage_unit"("warehouseId");

-- CreateIndex
CREATE INDEX "storage_unit_floorId_idx" ON "public"."storage_unit"("floorId");

-- CreateIndex
CREATE INDEX "storage_unit_zoneId_idx" ON "public"."storage_unit"("zoneId");

-- CreateIndex
CREATE INDEX "storage_unit_parentStorageUnitId_idx" ON "public"."storage_unit"("parentStorageUnitId");

-- CreateIndex
CREATE INDEX "storage_unit_type_idx" ON "public"."storage_unit"("type");

-- CreateIndex
CREATE INDEX "storage_unit_status_idx" ON "public"."storage_unit"("status");

-- CreateIndex
CREATE INDEX "storage_unit_warehouseId_status_idx" ON "public"."storage_unit"("warehouseId", "status");

-- CreateIndex
CREATE INDEX "storage_unit_levelIndex_idx" ON "public"."storage_unit"("levelIndex");

-- CreateIndex
CREATE INDEX "storage_unit_positionIndex_idx" ON "public"."storage_unit"("positionIndex");

-- CreateIndex
CREATE UNIQUE INDEX "storage_unit_warehouseId_code_key" ON "public"."storage_unit"("warehouseId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "storage_unit_warehouseId_barcode_key" ON "public"."storage_unit"("warehouseId", "barcode");

-- CreateIndex
CREATE UNIQUE INDEX "storage_unit_warehouseId_qrCode_key" ON "public"."storage_unit"("warehouseId", "qrCode");

-- CreateIndex
CREATE INDEX "handling_unit_warehouseId_idx" ON "public"."handling_unit"("warehouseId");

-- CreateIndex
CREATE INDEX "handling_unit_warehouseId_status_idx" ON "public"."handling_unit"("warehouseId", "status");

-- CreateIndex
CREATE INDEX "handling_unit_type_idx" ON "public"."handling_unit"("type");

-- CreateIndex
CREATE INDEX "handling_unit_status_idx" ON "public"."handling_unit"("status");

-- CreateIndex
CREATE INDEX "handling_unit_currentStorageUnitId_idx" ON "public"."handling_unit"("currentStorageUnitId");

-- CreateIndex
CREATE UNIQUE INDEX "handling_unit_warehouseId_code_key" ON "public"."handling_unit"("warehouseId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "handling_unit_warehouseId_barcode_key" ON "public"."handling_unit"("warehouseId", "barcode");

-- CreateIndex
CREATE INDEX "sku_organizationId_idx" ON "public"."sku"("organizationId");

-- CreateIndex
CREATE INDEX "sku_lifecycle_idx" ON "public"."sku"("lifecycle");

-- CreateIndex
CREATE INDEX "sku_uomId_idx" ON "public"."sku"("uomId");

-- CreateIndex
CREATE INDEX "sku_categoryId_idx" ON "public"."sku"("categoryId");

-- CreateIndex
CREATE INDEX "sku_serialTracking_idx" ON "public"."sku"("serialTracking");

-- CreateIndex
CREATE INDEX "sku_batchTracking_idx" ON "public"."sku"("batchTracking");

-- CreateIndex
CREATE INDEX "sku_gtin_idx" ON "public"."sku"("gtin");

-- CreateIndex
CREATE UNIQUE INDEX "sku_organizationId_skuCode_key" ON "public"."sku"("organizationId", "skuCode");

-- CreateIndex
CREATE INDEX "inventory_item_warehouseId_idx" ON "public"."inventory_item"("warehouseId");

-- CreateIndex
CREATE INDEX "inventory_item_warehouseId_status_idx" ON "public"."inventory_item"("warehouseId", "status");

-- CreateIndex
CREATE INDEX "inventory_item_warehouseId_skuId_batchNumber_currentStorage_idx" ON "public"."inventory_item"("warehouseId", "skuId", "batchNumber", "currentStorageUnitId");

-- CreateIndex
CREATE INDEX "inventory_item_skuId_idx" ON "public"."inventory_item"("skuId");

-- CreateIndex
CREATE INDEX "inventory_item_currentStorageUnitId_idx" ON "public"."inventory_item"("currentStorageUnitId");

-- CreateIndex
CREATE INDEX "inventory_item_currentHandlingUnitId_idx" ON "public"."inventory_item"("currentHandlingUnitId");

-- CreateIndex
CREATE INDEX "inventory_item_serialNumber_idx" ON "public"."inventory_item"("serialNumber");

-- CreateIndex
CREATE INDEX "inventory_item_batchNumber_idx" ON "public"."inventory_item"("batchNumber");

-- CreateIndex
CREATE INDEX "inventory_item_status_idx" ON "public"."inventory_item"("status");

-- CreateIndex
CREATE INDEX "inventory_item_warehouseId_expiryDate_idx" ON "public"."inventory_item"("warehouseId", "expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_item_warehouseId_skuId_serialNumber_key" ON "public"."inventory_item"("warehouseId", "skuId", "serialNumber");

-- CreateIndex
CREATE INDEX "inventory_movement_inventoryItemId_idx" ON "public"."inventory_movement"("inventoryItemId");

-- CreateIndex
CREATE INDEX "inventory_movement_warehouseId_idx" ON "public"."inventory_movement"("warehouseId");

-- CreateIndex
CREATE INDEX "inventory_movement_warehouseId_status_idx" ON "public"."inventory_movement"("warehouseId", "status");

-- CreateIndex
CREATE INDEX "inventory_movement_transactionType_idx" ON "public"."inventory_movement"("transactionType");

-- CreateIndex
CREATE INDEX "inventory_movement_status_idx" ON "public"."inventory_movement"("status");

-- CreateIndex
CREATE INDEX "inventory_movement_fromStorageUnitId_idx" ON "public"."inventory_movement"("fromStorageUnitId");

-- CreateIndex
CREATE INDEX "inventory_movement_toStorageUnitId_idx" ON "public"."inventory_movement"("toStorageUnitId");

-- CreateIndex
CREATE INDEX "inventory_movement_fromHandlingUnitId_idx" ON "public"."inventory_movement"("fromHandlingUnitId");

-- CreateIndex
CREATE INDEX "inventory_movement_toHandlingUnitId_idx" ON "public"."inventory_movement"("toHandlingUnitId");

-- CreateIndex
CREATE INDEX "inventory_movement_completedAt_idx" ON "public"."inventory_movement"("completedAt");

-- CreateIndex
CREATE INDEX "inventory_movement_startedAt_idx" ON "public"."inventory_movement"("startedAt");

-- CreateIndex
CREATE INDEX "inventory_movement_createdAt_idx" ON "public"."inventory_movement"("createdAt");

-- CreateIndex
CREATE INDEX "inventory_movement_referenceNumber_idx" ON "public"."inventory_movement"("referenceNumber");

-- CreateIndex
CREATE INDEX "inventory_movement_transferGroupId_idx" ON "public"."inventory_movement"("transferGroupId");

-- CreateIndex
CREATE INDEX "inventory_movement_performedByUserId_idx" ON "public"."inventory_movement"("performedByUserId");

-- CreateIndex
CREATE INDEX "layout_version_publishedByUserId_idx" ON "public"."layout_version"("publishedByUserId");

-- CreateIndex
CREATE INDEX "layout_version_warehouseId_idx" ON "public"."layout_version"("warehouseId");

-- CreateIndex
CREATE INDEX "layout_version_floorId_idx" ON "public"."layout_version"("floorId");

-- CreateIndex
CREATE INDEX "layout_version_status_idx" ON "public"."layout_version"("status");

-- CreateIndex
CREATE UNIQUE INDEX "layout_version_warehouseId_version_key" ON "public"."layout_version"("warehouseId", "version");

-- CreateIndex
CREATE INDEX "inventory_allocation_inventoryItemId_idx" ON "public"."inventory_allocation"("inventoryItemId");

-- CreateIndex
CREATE INDEX "inventory_allocation_warehouseId_idx" ON "public"."inventory_allocation"("warehouseId");

-- CreateIndex
CREATE INDEX "inventory_allocation_status_idx" ON "public"."inventory_allocation"("status");

-- CreateIndex
CREATE INDEX "inventory_allocation_salesOrderId_idx" ON "public"."inventory_allocation"("salesOrderId");

-- CreateIndex
CREATE INDEX "inventory_allocation_waveId_idx" ON "public"."inventory_allocation"("waveId");

-- CreateIndex
CREATE INDEX "inventory_allocation_expiresAt_idx" ON "public"."inventory_allocation"("expiresAt");

-- CreateIndex
CREATE INDEX "inventory_balance_warehouseId_skuId_idx" ON "public"."inventory_balance"("warehouseId", "skuId");

-- CreateIndex
CREATE INDEX "inventory_balance_warehouseId_idx" ON "public"."inventory_balance"("warehouseId");

-- CreateIndex
CREATE INDEX "inventory_balance_skuId_idx" ON "public"."inventory_balance"("skuId");

-- CreateIndex
CREATE INDEX "inventory_balance_storageUnitId_idx" ON "public"."inventory_balance"("storageUnitId");

-- CreateIndex
CREATE INDEX "inventory_balance_handlingUnitId_idx" ON "public"."inventory_balance"("handlingUnitId");

-- CreateIndex
CREATE INDEX "inventory_balance_warehouseId_expiryDate_idx" ON "public"."inventory_balance"("warehouseId", "expiryDate");

-- CreateIndex
CREATE INDEX "cycle_count_session_warehouseId_idx" ON "public"."cycle_count_session"("warehouseId");

-- CreateIndex
CREATE INDEX "cycle_count_session_status_idx" ON "public"."cycle_count_session"("status");

-- CreateIndex
CREATE INDEX "cycle_count_session_assignedToId_idx" ON "public"."cycle_count_session"("assignedToId");

-- CreateIndex
CREATE INDEX "cycle_count_session_scheduledDate_idx" ON "public"."cycle_count_session"("scheduledDate");

-- CreateIndex
CREATE UNIQUE INDEX "cycle_count_session_warehouseId_code_key" ON "public"."cycle_count_session"("warehouseId", "code");

-- CreateIndex
CREATE INDEX "cycle_count_line_sessionId_idx" ON "public"."cycle_count_line"("sessionId");

-- CreateIndex
CREATE INDEX "cycle_count_line_storageUnitId_idx" ON "public"."cycle_count_line"("storageUnitId");

-- CreateIndex
CREATE INDEX "cycle_count_line_skuId_idx" ON "public"."cycle_count_line"("skuId");

-- CreateIndex
CREATE INDEX "cycle_count_line_status_idx" ON "public"."cycle_count_line"("status");

-- CreateIndex
CREATE UNIQUE INDEX "carrier_code_key" ON "public"."carrier"("code");

-- CreateIndex
CREATE INDEX "dock_door_warehouseId_idx" ON "public"."dock_door"("warehouseId");

-- CreateIndex
CREATE INDEX "dock_door_status_idx" ON "public"."dock_door"("status");

-- CreateIndex
CREATE UNIQUE INDEX "dock_door_warehouseId_code_key" ON "public"."dock_door"("warehouseId", "code");

-- CreateIndex
CREATE INDEX "purchase_order_organizationId_idx" ON "public"."purchase_order"("organizationId");

-- CreateIndex
CREATE INDEX "purchase_order_warehouseId_idx" ON "public"."purchase_order"("warehouseId");

-- CreateIndex
CREATE INDEX "purchase_order_supplierId_idx" ON "public"."purchase_order"("supplierId");

-- CreateIndex
CREATE INDEX "purchase_order_status_idx" ON "public"."purchase_order"("status");

-- CreateIndex
CREATE INDEX "purchase_order_expectedDate_idx" ON "public"."purchase_order"("expectedDate");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_order_organizationId_poNumber_key" ON "public"."purchase_order"("organizationId", "poNumber");

-- CreateIndex
CREATE INDEX "purchase_order_line_purchaseOrderId_idx" ON "public"."purchase_order_line"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "purchase_order_line_skuId_idx" ON "public"."purchase_order_line"("skuId");

-- CreateIndex
CREATE INDEX "purchase_order_line_status_idx" ON "public"."purchase_order_line"("status");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_order_line_purchaseOrderId_lineNumber_key" ON "public"."purchase_order_line"("purchaseOrderId", "lineNumber");

-- CreateIndex
CREATE INDEX "asn_purchaseOrderId_idx" ON "public"."asn"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "asn_status_idx" ON "public"."asn"("status");

-- CreateIndex
CREATE INDEX "asn_expectedDate_idx" ON "public"."asn"("expectedDate");

-- CreateIndex
CREATE UNIQUE INDEX "asn_purchaseOrderId_asnNumber_key" ON "public"."asn"("purchaseOrderId", "asnNumber");

-- CreateIndex
CREATE INDEX "asn_line_asnId_idx" ON "public"."asn_line"("asnId");

-- CreateIndex
CREATE INDEX "asn_line_purchaseOrderLineId_idx" ON "public"."asn_line"("purchaseOrderLineId");

-- CreateIndex
CREATE INDEX "asn_line_skuId_idx" ON "public"."asn_line"("skuId");

-- CreateIndex
CREATE INDEX "receipt_warehouseId_idx" ON "public"."receipt"("warehouseId");

-- CreateIndex
CREATE INDEX "receipt_purchaseOrderId_idx" ON "public"."receipt"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "receipt_asnId_idx" ON "public"."receipt"("asnId");

-- CreateIndex
CREATE INDEX "receipt_status_idx" ON "public"."receipt"("status");

-- CreateIndex
CREATE UNIQUE INDEX "receipt_warehouseId_receiptNumber_key" ON "public"."receipt"("warehouseId", "receiptNumber");

-- CreateIndex
CREATE INDEX "receipt_line_receiptId_idx" ON "public"."receipt_line"("receiptId");

-- CreateIndex
CREATE INDEX "receipt_line_purchaseOrderLineId_idx" ON "public"."receipt_line"("purchaseOrderLineId");

-- CreateIndex
CREATE INDEX "receipt_line_skuId_idx" ON "public"."receipt_line"("skuId");

-- CreateIndex
CREATE INDEX "sales_order_organizationId_idx" ON "public"."sales_order"("organizationId");

-- CreateIndex
CREATE INDEX "sales_order_warehouseId_idx" ON "public"."sales_order"("warehouseId");

-- CreateIndex
CREATE INDEX "sales_order_status_idx" ON "public"."sales_order"("status");

-- CreateIndex
CREATE INDEX "sales_order_priority_idx" ON "public"."sales_order"("priority");

-- CreateIndex
CREATE INDEX "sales_order_requestedShipDate_idx" ON "public"."sales_order"("requestedShipDate");

-- CreateIndex
CREATE INDEX "sales_order_requiredByDate_idx" ON "public"."sales_order"("requiredByDate");

-- CreateIndex
CREATE UNIQUE INDEX "sales_order_organizationId_orderNumber_key" ON "public"."sales_order"("organizationId", "orderNumber");

-- CreateIndex
CREATE INDEX "sales_order_line_salesOrderId_idx" ON "public"."sales_order_line"("salesOrderId");

-- CreateIndex
CREATE INDEX "sales_order_line_skuId_idx" ON "public"."sales_order_line"("skuId");

-- CreateIndex
CREATE INDEX "sales_order_line_status_idx" ON "public"."sales_order_line"("status");

-- CreateIndex
CREATE UNIQUE INDEX "sales_order_line_salesOrderId_lineNumber_key" ON "public"."sales_order_line"("salesOrderId", "lineNumber");

-- CreateIndex
CREATE INDEX "wave_warehouseId_idx" ON "public"."wave"("warehouseId");

-- CreateIndex
CREATE INDEX "wave_status_idx" ON "public"."wave"("status");

-- CreateIndex
CREATE INDEX "wave_releasedAt_idx" ON "public"."wave"("releasedAt");

-- CreateIndex
CREATE UNIQUE INDEX "wave_warehouseId_waveNumber_key" ON "public"."wave"("warehouseId", "waveNumber");

-- CreateIndex
CREATE INDEX "wave_line_waveId_idx" ON "public"."wave_line"("waveId");

-- CreateIndex
CREATE INDEX "wave_line_salesOrderLineId_idx" ON "public"."wave_line"("salesOrderLineId");

-- CreateIndex
CREATE UNIQUE INDEX "wave_line_waveId_salesOrderLineId_key" ON "public"."wave_line"("waveId", "salesOrderLineId");

-- CreateIndex
CREATE INDEX "shipment_warehouseId_idx" ON "public"."shipment"("warehouseId");

-- CreateIndex
CREATE INDEX "shipment_salesOrderId_idx" ON "public"."shipment"("salesOrderId");

-- CreateIndex
CREATE INDEX "shipment_carrierId_idx" ON "public"."shipment"("carrierId");

-- CreateIndex
CREATE INDEX "shipment_status_idx" ON "public"."shipment"("status");

-- CreateIndex
CREATE INDEX "shipment_scheduledAt_idx" ON "public"."shipment"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "shipment_warehouseId_shipmentNumber_key" ON "public"."shipment"("warehouseId", "shipmentNumber");

-- CreateIndex
CREATE INDEX "shipment_line_shipmentId_idx" ON "public"."shipment_line"("shipmentId");

-- CreateIndex
CREATE INDEX "shipment_line_salesOrderLineId_idx" ON "public"."shipment_line"("salesOrderLineId");

-- CreateIndex
CREATE INDEX "shipment_line_skuId_idx" ON "public"."shipment_line"("skuId");

-- CreateIndex
CREATE INDEX "_RoleGroupWarehouses_B_index" ON "public"."_RoleGroupWarehouses"("B");

-- CreateIndex
CREATE INDEX "_WaveSalesOrders_B_index" ON "public"."_WaveSalesOrders"("B");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "public"."account"("userId");

-- CreateIndex
CREATE INDEX "account_providerId_accountId_idx" ON "public"."account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "ai_chat_userId_idx" ON "public"."ai_chat"("userId");

-- CreateIndex
CREATE INDEX "ai_chat_organizationId_idx" ON "public"."ai_chat"("organizationId");

-- CreateIndex
CREATE INDEX "audit_log_organizationId_idx" ON "public"."audit_log"("organizationId");

-- CreateIndex
CREATE INDEX "audit_log_userId_idx" ON "public"."audit_log"("userId");

-- CreateIndex
CREATE INDEX "audit_log_resource_idx" ON "public"."audit_log"("resource");

-- CreateIndex
CREATE INDEX "audit_log_resourceId_idx" ON "public"."audit_log"("resourceId");

-- CreateIndex
CREATE INDEX "audit_log_createdAt_idx" ON "public"."audit_log"("createdAt");

-- CreateIndex
CREATE INDEX "invitation_organizationId_idx" ON "public"."invitation"("organizationId");

-- CreateIndex
CREATE INDEX "invitation_email_idx" ON "public"."invitation"("email");

-- CreateIndex
CREATE INDEX "invitation_inviterId_idx" ON "public"."invitation"("inviterId");

-- CreateIndex
CREATE INDEX "invitation_expiresAt_idx" ON "public"."invitation"("expiresAt");

-- CreateIndex
CREATE INDEX "member_userId_idx" ON "public"."member"("userId");

-- CreateIndex
CREATE INDEX "member_roleGroupId_idx" ON "public"."member"("roleGroupId");

-- CreateIndex
CREATE INDEX "note_noteTagId_idx" ON "public"."note"("noteTagId");

-- CreateIndex
CREATE UNIQUE INDEX "note_tag_name_key" ON "public"."note_tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "passkey_credentialID_key" ON "public"."passkey"("credentialID");

-- CreateIndex
CREATE INDEX "passkey_userId_idx" ON "public"."passkey"("userId");

-- CreateIndex
CREATE INDEX "purchase_organizationId_idx" ON "public"."purchase"("organizationId");

-- CreateIndex
CREATE INDEX "purchase_userId_idx" ON "public"."purchase"("userId");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "public"."session"("userId");

-- CreateIndex
CREATE INDEX "session_expiresAt_idx" ON "public"."session"("expiresAt");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "public"."verification"("identifier");

-- CreateIndex
CREATE INDEX "verification_expiresAt_idx" ON "public"."verification"("expiresAt");

-- AddForeignKey
ALTER TABLE "public"."two_factor" ADD CONSTRAINT "two_factor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member" ADD CONSTRAINT "member_roleGroupId_fkey" FOREIGN KEY ("roleGroupId") REFERENCES "public"."role_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_log" ADD CONSTRAINT "audit_log_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_group" ADD CONSTRAINT "role_group_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task" ADD CONSTRAINT "task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task" ADD CONSTRAINT "task_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task" ADD CONSTRAINT "task_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_config" ADD CONSTRAINT "organization_config_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_config" ADD CONSTRAINT "organization_config_headquarterId_fkey" FOREIGN KEY ("headquarterId") REFERENCES "public"."address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."uom" ADD CONSTRAINT "uom_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."uom_conversion" ADD CONSTRAINT "uom_conversion_fromUomId_fkey" FOREIGN KEY ("fromUomId") REFERENCES "public"."uom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."uom_conversion" ADD CONSTRAINT "uom_conversion_toUomId_fkey" FOREIGN KEY ("toUomId") REFERENCES "public"."uom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sku_category" ADD CONSTRAINT "sku_category_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sku_category" ADD CONSTRAINT "sku_category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."sku_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supplier" ADD CONSTRAINT "supplier_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sku_supplier" ADD CONSTRAINT "sku_supplier_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."sku"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sku_supplier" ADD CONSTRAINT "sku_supplier_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "public"."supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."warehouse" ADD CONSTRAINT "warehouse_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."warehouse" ADD CONSTRAINT "warehouse_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "public"."address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."warehouse" ADD CONSTRAINT "warehouse_returnAddressId_fkey" FOREIGN KEY ("returnAddressId") REFERENCES "public"."address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."warehouse_floor" ADD CONSTRAINT "warehouse_floor_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."zone" ADD CONSTRAINT "zone_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."storage_unit" ADD CONSTRAINT "storage_unit_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."storage_unit" ADD CONSTRAINT "storage_unit_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "public"."warehouse_floor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."storage_unit" ADD CONSTRAINT "storage_unit_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "public"."zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."storage_unit" ADD CONSTRAINT "storage_unit_parentStorageUnitId_fkey" FOREIGN KEY ("parentStorageUnitId") REFERENCES "public"."storage_unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."handling_unit" ADD CONSTRAINT "handling_unit_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."handling_unit" ADD CONSTRAINT "handling_unit_currentStorageUnitId_fkey" FOREIGN KEY ("currentStorageUnitId") REFERENCES "public"."storage_unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."handling_unit" ADD CONSTRAINT "handling_unit_parentHandlingUnitId_fkey" FOREIGN KEY ("parentHandlingUnitId") REFERENCES "public"."handling_unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sku" ADD CONSTRAINT "sku_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sku" ADD CONSTRAINT "sku_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "public"."uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sku" ADD CONSTRAINT "sku_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."sku_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_item" ADD CONSTRAINT "inventory_item_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_item" ADD CONSTRAINT "inventory_item_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."sku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_item" ADD CONSTRAINT "inventory_item_currentStorageUnitId_fkey" FOREIGN KEY ("currentStorageUnitId") REFERENCES "public"."storage_unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_item" ADD CONSTRAINT "inventory_item_currentHandlingUnitId_fkey" FOREIGN KEY ("currentHandlingUnitId") REFERENCES "public"."handling_unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_movement" ADD CONSTRAINT "inventory_movement_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_movement" ADD CONSTRAINT "inventory_movement_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "public"."inventory_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_movement" ADD CONSTRAINT "inventory_movement_fromStorageUnitId_fkey" FOREIGN KEY ("fromStorageUnitId") REFERENCES "public"."storage_unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_movement" ADD CONSTRAINT "inventory_movement_fromHandlingUnitId_fkey" FOREIGN KEY ("fromHandlingUnitId") REFERENCES "public"."handling_unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_movement" ADD CONSTRAINT "inventory_movement_toStorageUnitId_fkey" FOREIGN KEY ("toStorageUnitId") REFERENCES "public"."storage_unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_movement" ADD CONSTRAINT "inventory_movement_toHandlingUnitId_fkey" FOREIGN KEY ("toHandlingUnitId") REFERENCES "public"."handling_unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_movement" ADD CONSTRAINT "inventory_movement_performedByUserId_fkey" FOREIGN KEY ("performedByUserId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."layout_version" ADD CONSTRAINT "layout_version_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."layout_version" ADD CONSTRAINT "layout_version_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "public"."warehouse_floor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."layout_version" ADD CONSTRAINT "layout_version_publishedByUserId_fkey" FOREIGN KEY ("publishedByUserId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_allocation" ADD CONSTRAINT "inventory_allocation_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_allocation" ADD CONSTRAINT "inventory_allocation_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "public"."inventory_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_allocation" ADD CONSTRAINT "inventory_allocation_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "public"."sales_order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_allocation" ADD CONSTRAINT "inventory_allocation_waveId_fkey" FOREIGN KEY ("waveId") REFERENCES "public"."wave"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_balance" ADD CONSTRAINT "inventory_balance_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_balance" ADD CONSTRAINT "inventory_balance_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."sku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_balance" ADD CONSTRAINT "inventory_balance_storageUnitId_fkey" FOREIGN KEY ("storageUnitId") REFERENCES "public"."storage_unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_balance" ADD CONSTRAINT "inventory_balance_handlingUnitId_fkey" FOREIGN KEY ("handlingUnitId") REFERENCES "public"."handling_unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cycle_count_session" ADD CONSTRAINT "cycle_count_session_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cycle_count_session" ADD CONSTRAINT "cycle_count_session_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cycle_count_session" ADD CONSTRAINT "cycle_count_session_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cycle_count_line" ADD CONSTRAINT "cycle_count_line_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."cycle_count_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cycle_count_line" ADD CONSTRAINT "cycle_count_line_storageUnitId_fkey" FOREIGN KEY ("storageUnitId") REFERENCES "public"."storage_unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cycle_count_line" ADD CONSTRAINT "cycle_count_line_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."sku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cycle_count_line" ADD CONSTRAINT "cycle_count_line_countedById_fkey" FOREIGN KEY ("countedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dock_door" ADD CONSTRAINT "dock_door_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_order" ADD CONSTRAINT "purchase_order_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_order" ADD CONSTRAINT "purchase_order_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_order" ADD CONSTRAINT "purchase_order_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "public"."supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_order" ADD CONSTRAINT "purchase_order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_order" ADD CONSTRAINT "purchase_order_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_order_line" ADD CONSTRAINT "purchase_order_line_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "public"."purchase_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_order_line" ADD CONSTRAINT "purchase_order_line_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."sku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_order_line" ADD CONSTRAINT "purchase_order_line_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "public"."uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asn" ADD CONSTRAINT "asn_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "public"."purchase_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asn_line" ADD CONSTRAINT "asn_line_asnId_fkey" FOREIGN KEY ("asnId") REFERENCES "public"."asn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asn_line" ADD CONSTRAINT "asn_line_purchaseOrderLineId_fkey" FOREIGN KEY ("purchaseOrderLineId") REFERENCES "public"."purchase_order_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asn_line" ADD CONSTRAINT "asn_line_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."sku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."receipt" ADD CONSTRAINT "receipt_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."receipt" ADD CONSTRAINT "receipt_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "public"."purchase_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."receipt" ADD CONSTRAINT "receipt_asnId_fkey" FOREIGN KEY ("asnId") REFERENCES "public"."asn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."receipt" ADD CONSTRAINT "receipt_dockDoorId_fkey" FOREIGN KEY ("dockDoorId") REFERENCES "public"."dock_door"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."receipt_line" ADD CONSTRAINT "receipt_line_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "public"."receipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."receipt_line" ADD CONSTRAINT "receipt_line_purchaseOrderLineId_fkey" FOREIGN KEY ("purchaseOrderLineId") REFERENCES "public"."purchase_order_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."receipt_line" ADD CONSTRAINT "receipt_line_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."sku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."receipt_line" ADD CONSTRAINT "receipt_line_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "public"."uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_order" ADD CONSTRAINT "sales_order_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_order" ADD CONSTRAINT "sales_order_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_order" ADD CONSTRAINT "sales_order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_order_line" ADD CONSTRAINT "sales_order_line_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "public"."sales_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_order_line" ADD CONSTRAINT "sales_order_line_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."sku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_order_line" ADD CONSTRAINT "sales_order_line_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "public"."uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wave" ADD CONSTRAINT "wave_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wave" ADD CONSTRAINT "wave_releasedById_fkey" FOREIGN KEY ("releasedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wave_line" ADD CONSTRAINT "wave_line_waveId_fkey" FOREIGN KEY ("waveId") REFERENCES "public"."wave"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wave_line" ADD CONSTRAINT "wave_line_salesOrderLineId_fkey" FOREIGN KEY ("salesOrderLineId") REFERENCES "public"."sales_order_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipment" ADD CONSTRAINT "shipment_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipment" ADD CONSTRAINT "shipment_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "public"."sales_order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipment" ADD CONSTRAINT "shipment_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "public"."carrier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipment" ADD CONSTRAINT "shipment_dockDoorId_fkey" FOREIGN KEY ("dockDoorId") REFERENCES "public"."dock_door"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipment" ADD CONSTRAINT "shipment_dispatchedById_fkey" FOREIGN KEY ("dispatchedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipment_line" ADD CONSTRAINT "shipment_line_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "public"."shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipment_line" ADD CONSTRAINT "shipment_line_salesOrderLineId_fkey" FOREIGN KEY ("salesOrderLineId") REFERENCES "public"."sales_order_line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipment_line" ADD CONSTRAINT "shipment_line_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."sku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_RoleGroupWarehouses" ADD CONSTRAINT "_RoleGroupWarehouses_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."role_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_RoleGroupWarehouses" ADD CONSTRAINT "_RoleGroupWarehouses_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_WaveSalesOrders" ADD CONSTRAINT "_WaveSalesOrders_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."sales_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_WaveSalesOrders" ADD CONSTRAINT "_WaveSalesOrders_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."wave"("id") ON DELETE CASCADE ON UPDATE CASCADE;
