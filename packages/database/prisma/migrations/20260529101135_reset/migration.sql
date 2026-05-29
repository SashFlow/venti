/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,name]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."SKU" DROP CONSTRAINT "SKU_productId_fkey";

-- DropIndex
DROP INDEX "public"."Product_organizationId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Product_organizationId_name_key" ON "public"."Product"("organizationId", "name");

-- AddForeignKey
ALTER TABLE "public"."SKU" ADD CONSTRAINT "SKU_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
