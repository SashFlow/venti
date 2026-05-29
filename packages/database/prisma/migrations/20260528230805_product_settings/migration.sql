-- CreateEnum
CREATE TYPE "public"."DeadStockAction" AS ENUM ('SCRAP', 'REFURBISH', 'RETURN_TO_VENDOR', 'RETURN_TO_FACTORY');

-- CreateEnum
CREATE TYPE "public"."ReturnAction" AS ENUM ('RESTOCK', 'SCRAP', 'REFURBISH', 'RETURN_TO_VENDOR', 'RETURN_TO_FACTORY');

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "deadStockAction" "public"."DeadStockAction" DEFAULT 'REFURBISH',
ADD COLUMN     "deadStockValue" DECIMAL(18,4),
ADD COLUMN     "defaultReturnWindowDays" INTEGER DEFAULT 30,
ADD COLUMN     "onReturn" "public"."ReturnAction" NOT NULL DEFAULT 'RESTOCK',
ADD COLUMN     "returnEnabled" BOOLEAN NOT NULL DEFAULT false;
