-- Unique index for InventoryBalance using NULLS NOT DISTINCT (PostgreSQL 15+).
-- Standard SQL unique constraints treat NULLs as distinct, allowing duplicate
-- balance rows for the same (warehouse, sku, location, hu, batch, expiry) when
-- any dimension is NULL. NULLS NOT DISTINCT fixes this.
--
-- Run once against your database after running `prisma migrate dev`:
--   psql $DATABASE_URL -f manual_inventory_balance_unique.sql
-- or paste into your next migration's SQL file.

CREATE UNIQUE INDEX IF NOT EXISTS inventory_balance_dim_unique
    ON inventory_balance (
        warehouse_id,
        sku_id,
        storage_unit_id,
        handling_unit_id,
        batch_number,
        expiry_date
    )
    NULLS NOT DISTINCT;
