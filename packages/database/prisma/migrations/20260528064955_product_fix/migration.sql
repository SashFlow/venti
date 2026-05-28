/*
  Warnings:

  - You are about to drop the column `code` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `baseUomId` on the `SKU` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `SKU` table. All the data in the column will be lost.
  - You are about to drop the `UnitOfMeasure` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[organizationId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."SKU" DROP CONSTRAINT "SKU_baseUomId_fkey";

-- DropIndex
DROP INDEX "public"."Product_organizationId_code_key";

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "code";

-- AlterTable
ALTER TABLE "public"."SKU" DROP COLUMN "baseUomId",
DROP COLUMN "name";

-- DropTable
DROP TABLE "public"."UnitOfMeasure";

-- CreateIndex
CREATE UNIQUE INDEX "Product_organizationId_key" ON "public"."Product"("organizationId");
