/*
  Warnings:

  - You are about to drop the column `aiOptOut` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `ai_chat` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `addressId` to the `Warehouse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sameReturn` to the `Warehouse` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ai_chat" DROP CONSTRAINT "ai_chat_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ai_chat" DROP CONSTRAINT "ai_chat_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Warehouse" ADD COLUMN     "addressId" TEXT NOT NULL,
ADD COLUMN     "returnId" TEXT,
ADD COLUMN     "sameReturn" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "public"."user" DROP COLUMN "aiOptOut";

-- DropTable
DROP TABLE "public"."ai_chat";

-- AddForeignKey
ALTER TABLE "public"."Warehouse" ADD CONSTRAINT "Warehouse_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "public"."address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Warehouse" ADD CONSTRAINT "Warehouse_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "public"."address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
