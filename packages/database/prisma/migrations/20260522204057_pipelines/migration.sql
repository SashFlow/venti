-- CreateEnum
CREATE TYPE "public"."WaveLineStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'PICKED', 'SHORT_PICKED', 'CANCELLED');

-- AlterTable
ALTER TABLE "public"."wave_line" ADD COLUMN     "pickSequence" INTEGER,
ADD COLUMN     "shortQty" DECIMAL(12,4),
ADD COLUMN     "status" "public"."WaveLineStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "wave_line_status_idx" ON "public"."wave_line"("status");

-- CreateIndex
CREATE INDEX "wave_line_pickSequence_idx" ON "public"."wave_line"("pickSequence");
