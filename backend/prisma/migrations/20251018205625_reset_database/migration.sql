-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('manager', 'super');

-- CreateEnum
CREATE TYPE "Entity" AS ENUM ('admin');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'manager',
    "password" TEXT NOT NULL,
    "commissions" INTEGER,
    "lastUpdate" TIMESTAMP(3),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "entity" "Entity" NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");
