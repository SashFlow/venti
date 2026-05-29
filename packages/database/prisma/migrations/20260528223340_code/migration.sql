/*
  Warnings:

  - You are about to drop the column `code` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `Supplier` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[organizationId,name]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId,name]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Customer_organizationId_code_key";

-- DropIndex
DROP INDEX "public"."Supplier_organizationId_code_key";

-- AlterTable
ALTER TABLE "public"."Customer" DROP COLUMN "code";

-- AlterTable
ALTER TABLE "public"."Supplier" DROP COLUMN "code";

-- CreateIndex
CREATE UNIQUE INDEX "Customer_organizationId_name_key" ON "public"."Customer"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_organizationId_name_key" ON "public"."Supplier"("organizationId", "name");
