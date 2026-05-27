/*
  Warnings:

  - The values [AISLE,DOCK,STAGING,PACKING,QC,QUARANTINE] on the enum `LocationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."AssetType" AS ENUM ('AISLE', 'DOCK_DOOR', 'STAIRS', 'WALL');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."LocationType_new" AS ENUM ('FLOOR', 'ZONE', 'BLOCK', 'RACK', 'SHELF', 'BIN', 'PALLET');
ALTER TABLE "public"."Location" ALTER COLUMN "type" TYPE "public"."LocationType_new" USING ("type"::text::"public"."LocationType_new");
ALTER TYPE "public"."LocationType" RENAME TO "LocationType_old";
ALTER TYPE "public"."LocationType_new" RENAME TO "LocationType";
DROP TYPE "public"."LocationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "life" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."SKU" ADD COLUMN     "metadata" JSONB;

-- CreateTable
CREATE TABLE "public"."Asset" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "name" TEXT,
    "type" "public"."AssetType" NOT NULL,
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

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Asset_warehouseId_type_idx" ON "public"."Asset"("warehouseId", "type");

-- AddForeignKey
ALTER TABLE "public"."Asset" ADD CONSTRAINT "Asset_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "public"."Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
