-- CreateEnum
CREATE TYPE "public"."UploadFileScope" AS ENUM ('ORGANIZATION_LOGO', 'USER_AVATAR', 'NOTE_IMAGE', 'GENERIC');

-- CreateEnum
CREATE TYPE "public"."UploadFileStatus" AS ENUM ('PENDING', 'UPLOADED', 'FAILED', 'DELETED');

-- AlterTable
ALTER TABLE "public"."organization" ADD COLUMN     "logoUploadFileId" TEXT;

-- CreateTable
CREATE TABLE "public"."upload_file" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "uploadedByUserId" TEXT,
    "bucket" VARCHAR(100) NOT NULL,
    "path" VARCHAR(1024) NOT NULL,
    "fileName" VARCHAR(255),
    "mimeType" VARCHAR(255),
    "sizeBytes" INTEGER,
    "checksum" VARCHAR(255),
    "scope" "public"."UploadFileScope" NOT NULL DEFAULT 'GENERIC',
    "status" "public"."UploadFileStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upload_file_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "upload_file_organizationId_idx" ON "public"."upload_file"("organizationId");

-- CreateIndex
CREATE INDEX "upload_file_uploadedByUserId_idx" ON "public"."upload_file"("uploadedByUserId");

-- CreateIndex
CREATE INDEX "upload_file_scope_idx" ON "public"."upload_file"("scope");

-- CreateIndex
CREATE INDEX "upload_file_status_idx" ON "public"."upload_file"("status");

-- CreateIndex
CREATE UNIQUE INDEX "upload_file_bucket_path_key" ON "public"."upload_file"("bucket", "path");

-- CreateIndex
CREATE INDEX "organization_logoUploadFileId_idx" ON "public"."organization"("logoUploadFileId");

-- AddForeignKey
ALTER TABLE "public"."organization" ADD CONSTRAINT "organization_logoUploadFileId_fkey" FOREIGN KEY ("logoUploadFileId") REFERENCES "public"."upload_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."upload_file" ADD CONSTRAINT "upload_file_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."upload_file" ADD CONSTRAINT "upload_file_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
