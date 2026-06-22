-- CreateEnum
CREATE TYPE "public"."WarehouseLayoutStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "public"."warehouse_layout" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "status" "public"."WarehouseLayoutStatus" NOT NULL DEFAULT 'DRAFT',
    "name" VARCHAR(255),
    "notes" TEXT,
    "scene" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "warehouse_layout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "warehouse_layout_organizationId_idx" ON "public"."warehouse_layout"("organizationId");

-- CreateIndex
CREATE INDEX "warehouse_layout_warehouseId_idx" ON "public"."warehouse_layout"("warehouseId");

-- CreateIndex
CREATE INDEX "warehouse_layout_warehouseId_status_idx" ON "public"."warehouse_layout"("warehouseId", "status");

-- AddForeignKey
ALTER TABLE "public"."warehouse_layout" ADD CONSTRAINT "warehouse_layout_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."warehouse_layout" ADD CONSTRAINT "warehouse_layout_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
