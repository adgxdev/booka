/*
  Warnings:

  - Added the required column `requestId` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `AuditLog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuditLogType" AS ENUM ('create', 'update', 'delete', 'system');

-- CreateEnum
CREATE TYPE "AuduitLogLevel" AS ENUM ('info', 'warning', 'error');

-- AlterEnum
ALTER TYPE "Entity" ADD VALUE 'waitlist';

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "adminId" TEXT,
ADD COLUMN     "level" "AuduitLogLevel" NOT NULL DEFAULT 'info',
ADD COLUMN     "requestId" TEXT NOT NULL,
ADD COLUMN     "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "type" "AuditLogType" NOT NULL,
ADD COLUMN     "universityId" TEXT;

-- CreateTable
CREATE TABLE "University" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waitlist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "referralCode" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "University_slug_key" ON "University"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Waitlist_email_key" ON "Waitlist"("email");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;
