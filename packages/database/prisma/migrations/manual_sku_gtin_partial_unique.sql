-- Partial unique index on SKU.gtin scoped per organization.
-- Prisma cannot express WHERE-conditional unique indexes in schema.prisma,
-- so this must be applied manually after running `prisma migrate dev`.
--
-- Run once against your database:
--   psql $DATABASE_URL -f manual_sku_gtin_partial_unique.sql
-- or paste into your next migration's SQL file.

CREATE UNIQUE INDEX IF NOT EXISTS sku_org_gtin_unique
    ON sku (organization_id, gtin)
    WHERE gtin IS NOT NULL;
