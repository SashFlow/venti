-- AlterTable
ALTER TABLE "public"."sales_order" ADD COLUMN     "customerId" TEXT;

-- CreateTable
CREATE TABLE "public"."customer_location" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "customer_location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_location_addressId_key" ON "public"."customer_location"("addressId");

-- CreateIndex
CREATE INDEX "customer_location_customerId_idx" ON "public"."customer_location"("customerId");

-- CreateIndex
CREATE INDEX "customer_location_organizationId_idx" ON "public"."customer_location"("organizationId");

-- CreateIndex
CREATE INDEX "sales_order_customerId_idx" ON "public"."sales_order"("customerId");

-- AddForeignKey
ALTER TABLE "public"."customer_location" ADD CONSTRAINT "customer_location_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_location" ADD CONSTRAINT "customer_location_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customer_location" ADD CONSTRAINT "customer_location_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "public"."address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales_order" ADD CONSTRAINT "sales_order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
