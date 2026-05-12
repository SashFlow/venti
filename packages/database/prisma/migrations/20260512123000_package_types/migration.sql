-- CreateTable
CREATE TABLE "public"."package_type" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "packageType" VARCHAR(50) NOT NULL,
    "price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "length" DECIMAL(12,2) NOT NULL DEFAULT 1,
    "width" DECIMAL(12,2) NOT NULL DEFAULT 1,
    "height" DECIMAL(12,2) NOT NULL DEFAULT 1,
    "weight" DECIMAL(12,2) NOT NULL DEFAULT 1,
    "dimensionUnit" VARCHAR(10) NOT NULL DEFAULT 'in',
    "weightUnit" VARCHAR(10) NOT NULL DEFAULT 'lb',
    "applyToAllWarehouses" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,

    CONSTRAINT "package_type_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "package_type_organizationId_idx" ON "public"."package_type"("organizationId");

-- CreateIndex
CREATE INDEX "package_type_organizationId_createdAt_idx" ON "public"."package_type"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "package_type_organizationId_name_idx" ON "public"."package_type"("organizationId", "name");

-- AddForeignKey
ALTER TABLE "public"."package_type" ADD CONSTRAINT "package_type_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
