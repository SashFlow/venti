-- CreateEnum
CREATE TYPE "public"."PurchaseType" AS ENUM ('SUBSCRIPTION', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "public"."UploadFileScope" AS ENUM ('ORGANIZATION_LOGO', 'USER_AVATAR', 'NOTE_IMAGE', 'GENERIC');

-- CreateEnum
CREATE TYPE "public"."UploadFileStatus" AS ENUM ('PENDING', 'UPLOADED', 'FAILED', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."WarehouseStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "public"."LocationType" AS ENUM ('FLOOR', 'ZONE', 'AISLE', 'RACK', 'SHELF', 'BIN', 'PALLET', 'DOCK', 'STAGING', 'PACKING', 'QC', 'QUARANTINE');

-- CreateEnum
CREATE TYPE "public"."QCStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED', 'HOLD');

-- CreateEnum
CREATE TYPE "public"."InventoryState" AS ENUM ('AVAILABLE', 'RESERVED', 'QC', 'HOLD', 'DAMAGED', 'QUARANTINE', 'EXPIRED', 'INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "public"."ReservationStatus" AS ENUM ('ACTIVE', 'RELEASED', 'CONSUMED');

-- CreateEnum
CREATE TYPE "public"."InventoryTransactionType" AS ENUM ('RECEIVE', 'PUTAWAY', 'PICK', 'PACK', 'SHIP', 'MOVE', 'ADJUSTMENT', 'CYCLE_COUNT', 'RETURN', 'DAMAGE', 'REPLENISHMENT');

-- CreateEnum
CREATE TYPE "public"."ASNStatus" AS ENUM ('CREATED', 'IN_TRANSIT', 'ARRIVED', 'RECEIVING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PurchaseOrderStatus" AS ENUM ('DRAFT', 'APPROVED', 'IN_TRANSIT', 'PARTIAL', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ReceivingStatus" AS ENUM ('PENDING', 'RECEIVING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."SalesOrderStatus" AS ENUM ('DRAFT', 'ALLOCATED', 'PICKING', 'PACKING', 'SHIPPED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ShipmentStatus" AS ENUM ('PENDING', 'PACKED', 'SHIPPED', 'DELIVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."ReturnDisposition" AS ENUM ('RESTOCK', 'SCRAP', 'REFURBISH', 'RETURN_TO_VENDOR');

-- CreateEnum
CREATE TYPE "public"."ReturnOrderStatus" AS ENUM ('CREATED', 'IN_TRANSIT', 'RECEIVED', 'INSPECTING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."WaveStatus" AS ENUM ('CREATED', 'RELEASED', 'PICKING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."WarehouseTaskType" AS ENUM ('RECEIVE', 'PUTAWAY', 'PICK', 'PACK', 'SHIP', 'MOVE', 'REPLENISHMENT', 'CYCLE_COUNT', 'QC');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."TaskPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."WorkflowType" AS ENUM ('INBOUND', 'OUTBOUND', 'INVENTORY', 'RETURNS');

-- CreateEnum
CREATE TYPE "public"."WorkflowExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."CycleCountStatus" AS ENUM ('CREATED', 'COUNTING', 'APPROVED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."ScanEventType" AS ENUM ('RECEIVE', 'PICK', 'PUTAWAY', 'MOVE', 'PACK', 'SHIP', 'COUNT');

-- CreateTable
CREATE TABLE "public"."user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "username" TEXT,
    "role" TEXT,
    "banned" BOOLEAN,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "paymentsCustomerId" TEXT,
    "locale" TEXT,
    "twoFactorEnabled" BOOLEAN,
    "aiOptOut" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "impersonatedBy" TEXT,
    "activeOrganizationId" TEXT,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "password" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."passkey" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "publicKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credentialID" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "deviceType" TEXT NOT NULL,
    "backedUp" BOOLEAN NOT NULL,
    "transports" TEXT,
    "createdAt" TIMESTAMP(3),

    CONSTRAINT "passkey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."two_factor" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "two_factor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "logo" TEXT,
    "logoUploadFileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "paymentsCustomerId" TEXT,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organization_config" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "headquarterId" TEXT,
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
CREATE TABLE "public"."address" (
    "id" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customer_location" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."member" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "roleGroupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "status" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "inviterId" TEXT NOT NULL,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."purchase" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "userId" TEXT,
    "type" "public"."PurchaseType" NOT NULL,
    "customerId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "productId" TEXT NOT NULL,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_log" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."upload_file" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "uploadedByUserId" TEXT,
    "bucket" VARCHAR(100) NOT NULL,
    "path" VARCHAR(1024) NOT NULL,
    "fileName" VARCHAR(255),
    "mimeType" VARCHAR(255),
    "sizeBytes" INTEGER,
    "checksum" VARCHAR(255),
    "scope" "public"."UploadFileScope" NOT NULL DEFAULT 'GENERIC',
    "status" "public"."UploadFileStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upload_file_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "public"."Warehouse" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "status" "public"."WarehouseStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Location" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "parentLocationId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "type" "public"."LocationType" NOT NULL,
    "barcode" TEXT,
    "sequence" INTEGER,
    "isPickable" BOOLEAN NOT NULL DEFAULT true,
    "isReceivable" BOOLEAN NOT NULL DEFAULT true,
    "isReservable" BOOLEAN NOT NULL DEFAULT true,
    "isQuarantine" BOOLEAN NOT NULL DEFAULT false,
    "capacityVolume" DECIMAL(18,4),
    "capacityWeight" DECIMAL(18,4),
    "currentVolume" DECIMAL(18,4),
    "currentWeight" DECIMAL(18,4),
    "x" DECIMAL(12,2),
    "y" DECIMAL(12,2),
    "z" DECIMAL(12,2),
    "width" DECIMAL(12,2),
    "height" DECIMAL(12,2),
    "depth" DECIMAL(12,2),
    "rotationX" DECIMAL(12,2),
    "rotationY" DECIMAL(12,2),
    "rotationZ" DECIMAL(12,2),
    "meshType" TEXT,
    "colorHex" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPerishable" BOOLEAN NOT NULL DEFAULT false,
    "isBatchTracked" BOOLEAN NOT NULL DEFAULT false,
    "isSerialTracked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SKU" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "barcode" TEXT,
    "width" DECIMAL(12,2),
    "height" DECIMAL(12,2),
    "length" DECIMAL(12,2),
    "weight" DECIMAL(12,2),
    "baseUomId" TEXT NOT NULL,
    "unitPrice" DECIMAL(18,4),
    "organizationId" TEXT,

    CONSTRAINT "SKU_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UnitOfMeasure" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "UnitOfMeasure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InventoryLot" (
    "id" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "manufactureDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "qcStatus" "public"."QCStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "InventoryLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InventorySerial" (
    "id" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "locationId" TEXT,
    "status" "public"."InventoryState" NOT NULL,

    CONSTRAINT "InventorySerial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InventoryBalance" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "lotId" TEXT,
    "state" "public"."InventoryState" NOT NULL DEFAULT 'AVAILABLE',
    "quantityAvailable" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "quantityReserved" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "quantityDamaged" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "quantityInbound" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InventoryReservation" (
    "id" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "salesOrderItemId" TEXT,
    "quantity" DECIMAL(18,4) NOT NULL,
    "status" "public"."ReservationStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InventoryTransaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "warehouseId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "lotId" TEXT,
    "fromLocationId" TEXT,
    "toLocationId" TEXT,
    "quantity" DECIMAL(18,4) NOT NULL,
    "transactionType" "public"."InventoryTransactionType" NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "performedById" TEXT,
    "metadata" JSONB,

    CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Supplier" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdvancedShippingNotice" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "purchaseOrderId" TEXT,
    "asnNumber" TEXT NOT NULL,
    "expectedArrival" TIMESTAMP(3),
    "pallets" INTEGER,
    "cartons" INTEGER,
    "status" "public"."ASNStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdvancedShippingNotice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ASNItem" (
    "id" TEXT NOT NULL,
    "asnId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "expectedQty" DECIMAL(18,4) NOT NULL,
    "receivedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "lotNumber" TEXT,

    CONSTRAINT "ASNItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PurchaseOrder" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "poNumber" TEXT NOT NULL,
    "status" "public"."PurchaseOrderStatus" NOT NULL,
    "expectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PurchaseOrderItem" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "orderedQty" DECIMAL(18,4) NOT NULL,
    "receivedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "unitPrice" DECIMAL(18,4),

    CONSTRAINT "PurchaseOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReceivingOrder" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "purchaseOrderId" TEXT,
    "asnId" TEXT,
    "status" "public"."ReceivingStatus" NOT NULL,
    "receivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReceivingOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SalesOrder" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" "public"."SalesOrderStatus" NOT NULL,
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SalesOrderItem" (
    "id" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "orderedQty" DECIMAL(18,4) NOT NULL,
    "allocatedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "pickedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,

    CONSTRAINT "SalesOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Shipment" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "trackingNumber" TEXT,
    "carrier" TEXT,
    "shippedAt" TIMESTAMP(3),
    "status" "public"."ShipmentStatus" NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReturnOrder" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "salesOrderId" TEXT,
    "returnNumber" TEXT NOT NULL,
    "reason" TEXT,
    "status" "public"."ReturnOrderStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReturnOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReturnOrderItem" (
    "id" TEXT NOT NULL,
    "returnOrderId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "disposition" "public"."ReturnDisposition",

    CONSTRAINT "ReturnOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReturnInspection" (
    "id" TEXT NOT NULL,
    "returnOrderId" TEXT NOT NULL,
    "inspectedById" TEXT,
    "result" "public"."QCStatus" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReturnInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PickWave" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "waveNumber" TEXT NOT NULL,
    "status" "public"."WaveStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PickWave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WarehouseTask" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "assignedUserId" TEXT,
    "pickWaveId" TEXT,
    "type" "public"."WarehouseTaskType" NOT NULL,
    "status" "public"."TaskStatus" NOT NULL,
    "priority" "public"."TaskPriority" NOT NULL,
    "fromLocationId" TEXT,
    "toLocationId" TEXT,
    "skuId" TEXT,
    "quantity" DECIMAL(18,4),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WarehouseTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowDefinition" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."WorkflowType" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowNode" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "positionX" DECIMAL(12,2) NOT NULL,
    "positionY" DECIMAL(12,2) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "WorkflowNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowEdge" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "sourceNodeId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "label" TEXT,
    "metadata" JSONB,

    CONSTRAINT "WorkflowEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowExecution" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "status" "public"."WorkflowExecutionStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "WorkflowExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowExecutionStep" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "status" "public"."WorkflowExecutionStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "WorkflowExecutionStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReplenishmentRule" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "minQty" DECIMAL(18,4) NOT NULL,
    "maxQty" DECIMAL(18,4) NOT NULL,
    "replenishQty" DECIMAL(18,4) NOT NULL,

    CONSTRAINT "ReplenishmentRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CycleCountSession" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "status" "public"."CycleCountStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CycleCountSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CycleCountItem" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "expectedQty" DECIMAL(18,4) NOT NULL,
    "countedQty" DECIMAL(18,4) NOT NULL,
    "variance" DECIMAL(18,4) NOT NULL,

    CONSTRAINT "CycleCountItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ScanEvent" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "userId" TEXT,
    "locationId" TEXT,
    "barcode" TEXT NOT NULL,
    "eventType" "public"."ScanEventType" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_RoleGroupWarehouses" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RoleGroupWarehouses_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "public"."user"("username");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "public"."session"("userId");

-- CreateIndex
CREATE INDEX "session_expiresAt_idx" ON "public"."session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "public"."session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "public"."account"("userId");

-- CreateIndex
CREATE INDEX "account_providerId_accountId_idx" ON "public"."account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "public"."verification"("identifier");

-- CreateIndex
CREATE INDEX "verification_expiresAt_idx" ON "public"."verification"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "passkey_credentialID_key" ON "public"."passkey"("credentialID");

-- CreateIndex
CREATE INDEX "passkey_userId_idx" ON "public"."passkey"("userId");

-- CreateIndex
CREATE INDEX "two_factor_userId_idx" ON "public"."two_factor"("userId");

-- CreateIndex
CREATE INDEX "organization_logoUploadFileId_idx" ON "public"."organization"("logoUploadFileId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "public"."organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organization_config_organizationId_key" ON "public"."organization_config"("organizationId");

-- CreateIndex
CREATE INDEX "customer_location_organizationId_idx" ON "public"."customer_location"("organizationId");

-- CreateIndex
CREATE INDEX "customer_location_customerId_idx" ON "public"."customer_location"("customerId");

-- CreateIndex
CREATE INDEX "member_userId_idx" ON "public"."member"("userId");

-- CreateIndex
CREATE INDEX "member_roleGroupId_idx" ON "public"."member"("roleGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "member_organizationId_userId_key" ON "public"."member"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "invitation_organizationId_idx" ON "public"."invitation"("organizationId");

-- CreateIndex
CREATE INDEX "invitation_email_idx" ON "public"."invitation"("email");

-- CreateIndex
CREATE INDEX "invitation_inviterId_idx" ON "public"."invitation"("inviterId");

-- CreateIndex
CREATE INDEX "invitation_expiresAt_idx" ON "public"."invitation"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_subscriptionId_key" ON "public"."purchase"("subscriptionId");

-- CreateIndex
CREATE INDEX "purchase_subscriptionId_idx" ON "public"."purchase"("subscriptionId");

-- CreateIndex
CREATE INDEX "purchase_organizationId_idx" ON "public"."purchase"("organizationId");

-- CreateIndex
CREATE INDEX "purchase_userId_idx" ON "public"."purchase"("userId");

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
CREATE INDEX "upload_file_organizationId_idx" ON "public"."upload_file"("organizationId");

-- CreateIndex
CREATE INDEX "upload_file_uploadedByUserId_idx" ON "public"."upload_file"("uploadedByUserId");

-- CreateIndex
CREATE INDEX "upload_file_scope_idx" ON "public"."upload_file"("scope");

-- CreateIndex
CREATE INDEX "upload_file_status_idx" ON "public"."upload_file"("status");

-- CreateIndex
CREATE UNIQUE INDEX "upload_file_bucket_path_key" ON "public"."upload_file"("bucket", "path");

-- CreateIndex
CREATE INDEX "role_group_organizationId_idx" ON "public"."role_group"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_organizationId_code_key" ON "public"."Warehouse"("organizationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Location_barcode_key" ON "public"."Location"("barcode");

-- CreateIndex
CREATE INDEX "Location_warehouseId_type_idx" ON "public"."Location"("warehouseId", "type");

-- CreateIndex
CREATE INDEX "Location_parentLocationId_idx" ON "public"."Location"("parentLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_warehouseId_code_key" ON "public"."Location"("warehouseId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Product_organizationId_code_key" ON "public"."Product"("organizationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "SKU_productId_code_key" ON "public"."SKU"("productId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "UnitOfMeasure_code_key" ON "public"."UnitOfMeasure"("code");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryLot_skuId_lotNumber_key" ON "public"."InventoryLot"("skuId", "lotNumber");

-- CreateIndex
CREATE UNIQUE INDEX "InventorySerial_skuId_serialNumber_key" ON "public"."InventorySerial"("skuId", "serialNumber");

-- CreateIndex
CREATE INDEX "InventoryBalance_warehouseId_skuId_idx" ON "public"."InventoryBalance"("warehouseId", "skuId");

-- CreateIndex
CREATE INDEX "InventoryBalance_locationId_skuId_idx" ON "public"."InventoryBalance"("locationId", "skuId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryBalance_locationId_skuId_lotId_state_key" ON "public"."InventoryBalance"("locationId", "skuId", "lotId", "state");

-- CreateIndex
CREATE INDEX "InventoryReservation_skuId_idx" ON "public"."InventoryReservation"("skuId");

-- CreateIndex
CREATE INDEX "InventoryTransaction_warehouseId_createdAt_idx" ON "public"."InventoryTransaction"("warehouseId", "createdAt");

-- CreateIndex
CREATE INDEX "InventoryTransaction_skuId_createdAt_idx" ON "public"."InventoryTransaction"("skuId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_organizationId_code_key" ON "public"."Supplier"("organizationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "AdvancedShippingNotice_warehouseId_asnNumber_key" ON "public"."AdvancedShippingNotice"("warehouseId", "asnNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_warehouseId_poNumber_key" ON "public"."PurchaseOrder"("warehouseId", "poNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_organizationId_code_key" ON "public"."Customer"("organizationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrder_warehouseId_orderNumber_key" ON "public"."SalesOrder"("warehouseId", "orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_salesOrderId_key" ON "public"."Shipment"("salesOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "ReturnOrder_warehouseId_returnNumber_key" ON "public"."ReturnOrder"("warehouseId", "returnNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PickWave_warehouseId_waveNumber_key" ON "public"."PickWave"("warehouseId", "waveNumber");

-- CreateIndex
CREATE INDEX "WarehouseTask_warehouseId_status_idx" ON "public"."WarehouseTask"("warehouseId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ReplenishmentRule_locationId_skuId_key" ON "public"."ReplenishmentRule"("locationId", "skuId");

-- CreateIndex
CREATE INDEX "ScanEvent_warehouseId_createdAt_idx" ON "public"."ScanEvent"("warehouseId", "createdAt");

-- CreateIndex
CREATE INDEX "_RoleGroupWarehouses_B_index" ON "public"."_RoleGroupWarehouses"("B");

-- AddForeignKey
ALTER TABLE "public"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."passkey" ADD CONSTRAINT "passkey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."two_factor" ADD CONSTRAINT "two_factor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization" ADD CONSTRAINT "organization_logoUploadFileId_fkey" FOREIGN KEY ("logoUploadFileId") REFERENCES "public"."upload_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_config" ADD CONSTRAINT "organization_config_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_config" ADD CONSTRAINT "organization_config_headquarterId_fkey" FOREIGN KEY ("headquarterId") REFERENCES "public"."address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_location" ADD CONSTRAINT "customer_location_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_location" ADD CONSTRAINT "customer_location_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_location" ADD CONSTRAINT "customer_location_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "public"."address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member" ADD CONSTRAINT "member_roleGroupId_fkey" FOREIGN KEY ("roleGroupId") REFERENCES "public"."role_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase" ADD CONSTRAINT "purchase_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase" ADD CONSTRAINT "purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_log" ADD CONSTRAINT "audit_log_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_log" ADD CONSTRAINT "audit_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."upload_file" ADD CONSTRAINT "upload_file_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."upload_file" ADD CONSTRAINT "upload_file_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_group" ADD CONSTRAINT "role_group_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Warehouse" ADD CONSTRAINT "Warehouse_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Location" ADD CONSTRAINT "Location_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Location" ADD CONSTRAINT "Location_parentLocationId_fkey" FOREIGN KEY ("parentLocationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SKU" ADD CONSTRAINT "SKU_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SKU" ADD CONSTRAINT "SKU_baseUomId_fkey" FOREIGN KEY ("baseUomId") REFERENCES "public"."UnitOfMeasure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SKU" ADD CONSTRAINT "SKU_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryLot" ADD CONSTRAINT "InventoryLot_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."SKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventorySerial" ADD CONSTRAINT "InventorySerial_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."SKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventorySerial" ADD CONSTRAINT "InventorySerial_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryBalance" ADD CONSTRAINT "InventoryBalance_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryBalance" ADD CONSTRAINT "InventoryBalance_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryBalance" ADD CONSTRAINT "InventoryBalance_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."SKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryBalance" ADD CONSTRAINT "InventoryBalance_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "public"."InventoryLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryReservation" ADD CONSTRAINT "InventoryReservation_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."SKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryReservation" ADD CONSTRAINT "InventoryReservation_salesOrderItemId_fkey" FOREIGN KEY ("salesOrderItemId") REFERENCES "public"."SalesOrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."SKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "public"."InventoryLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Supplier" ADD CONSTRAINT "Supplier_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdvancedShippingNotice" ADD CONSTRAINT "AdvancedShippingNotice_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdvancedShippingNotice" ADD CONSTRAINT "AdvancedShippingNotice_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "public"."Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdvancedShippingNotice" ADD CONSTRAINT "AdvancedShippingNotice_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "public"."PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ASNItem" ADD CONSTRAINT "ASNItem_asnId_fkey" FOREIGN KEY ("asnId") REFERENCES "public"."AdvancedShippingNotice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ASNItem" ADD CONSTRAINT "ASNItem_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."SKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "public"."Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "public"."PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."SKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReceivingOrder" ADD CONSTRAINT "ReceivingOrder_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReceivingOrder" ADD CONSTRAINT "ReceivingOrder_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "public"."PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReceivingOrder" ADD CONSTRAINT "ReceivingOrder_asnId_fkey" FOREIGN KEY ("asnId") REFERENCES "public"."AdvancedShippingNotice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesOrder" ADD CONSTRAINT "SalesOrder_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesOrder" ADD CONSTRAINT "SalesOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "public"."SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."SKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shipment" ADD CONSTRAINT "Shipment_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shipment" ADD CONSTRAINT "Shipment_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "public"."SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReturnOrder" ADD CONSTRAINT "ReturnOrder_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReturnOrder" ADD CONSTRAINT "ReturnOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReturnOrder" ADD CONSTRAINT "ReturnOrder_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "public"."SalesOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReturnOrderItem" ADD CONSTRAINT "ReturnOrderItem_returnOrderId_fkey" FOREIGN KEY ("returnOrderId") REFERENCES "public"."ReturnOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReturnOrderItem" ADD CONSTRAINT "ReturnOrderItem_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."SKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReturnInspection" ADD CONSTRAINT "ReturnInspection_returnOrderId_fkey" FOREIGN KEY ("returnOrderId") REFERENCES "public"."ReturnOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReturnInspection" ADD CONSTRAINT "ReturnInspection_inspectedById_fkey" FOREIGN KEY ("inspectedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PickWave" ADD CONSTRAINT "PickWave_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WarehouseTask" ADD CONSTRAINT "WarehouseTask_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WarehouseTask" ADD CONSTRAINT "WarehouseTask_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WarehouseTask" ADD CONSTRAINT "WarehouseTask_pickWaveId_fkey" FOREIGN KEY ("pickWaveId") REFERENCES "public"."PickWave"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WarehouseTask" ADD CONSTRAINT "WarehouseTask_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WarehouseTask" ADD CONSTRAINT "WarehouseTask_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WarehouseTask" ADD CONSTRAINT "WarehouseTask_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."SKU"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowDefinition" ADD CONSTRAINT "WorkflowDefinition_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowNode" ADD CONSTRAINT "WorkflowNode_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."WorkflowDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowEdge" ADD CONSTRAINT "WorkflowEdge_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."WorkflowDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowExecution" ADD CONSTRAINT "WorkflowExecution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."WorkflowDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowExecutionStep" ADD CONSTRAINT "WorkflowExecutionStep_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "public"."WorkflowExecution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReplenishmentRule" ADD CONSTRAINT "ReplenishmentRule_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReplenishmentRule" ADD CONSTRAINT "ReplenishmentRule_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."SKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CycleCountSession" ADD CONSTRAINT "CycleCountSession_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CycleCountItem" ADD CONSTRAINT "CycleCountItem_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."CycleCountSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CycleCountItem" ADD CONSTRAINT "CycleCountItem_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CycleCountItem" ADD CONSTRAINT "CycleCountItem_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "public"."SKU"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScanEvent" ADD CONSTRAINT "ScanEvent_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScanEvent" ADD CONSTRAINT "ScanEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScanEvent" ADD CONSTRAINT "ScanEvent_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_RoleGroupWarehouses" ADD CONSTRAINT "_RoleGroupWarehouses_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."role_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_RoleGroupWarehouses" ADD CONSTRAINT "_RoleGroupWarehouses_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
