-- CreateTable
CREATE TABLE "public"."customer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "isWholesaler" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "lastOrderAt" TIMESTAMP(3),
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customer_organizationId_idx" ON "public"."customer"("organizationId");

-- CreateIndex
CREATE INDEX "customer_organizationId_createdAt_idx" ON "public"."customer"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "customer_organizationId_name_idx" ON "public"."customer"("organizationId", "name");

-- CreateIndex
CREATE INDEX "customer_organizationId_email_idx" ON "public"."customer"("organizationId", "email");

-- AddForeignKey
ALTER TABLE "public"."customer" ADD CONSTRAINT "customer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
