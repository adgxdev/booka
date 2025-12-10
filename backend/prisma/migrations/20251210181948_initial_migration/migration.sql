/*
  Warnings:

  - You are about to drop the column `adminId` on the `University` table. All the data in the column will be lost.
  - Added the required column `city` to the `University` table without a default value. This is not possible if the table is not empty.
  - Added the required column `logoFileId` to the `University` table without a default value. This is not possible if the table is not empty.
  - Added the required column `logoUrl` to the `University` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `University` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BookStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'confirmed', 'purchased', 'ready', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'processing', 'success', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "FulfillmentType" AS ENUM ('delivery', 'pickup');

-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterEnum
ALTER TYPE "AdminRole" ADD VALUE 'operator';

-- DropForeignKey
ALTER TABLE "University" DROP CONSTRAINT "University_adminId_fkey";

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "universityId" TEXT;

-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "requestId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "University" DROP COLUMN "adminId",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "logoFileId" TEXT NOT NULL,
ADD COLUMN     "logoUrl" TEXT NOT NULL,
ADD COLUMN     "maxAgents" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "pickupLocations" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "signedUpAgentsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "state" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "password" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryAgent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "assignedZones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "totalCommissions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pendingOrdersCount" INTEGER NOT NULL DEFAULT 0,
    "status" "AgentStatus" NOT NULL DEFAULT 'pending',
    "studentIdUrl" TEXT,
    "ninSlipUrl" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "DeliveryAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "edition" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "lowAlert" INTEGER NOT NULL DEFAULT 0,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT NOT NULL,
    "imageFileId" TEXT NOT NULL,
    "status" "BookStatus" NOT NULL DEFAULT 'draft',
    "universityId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "agentId" TEXT,
    "booksTotal" DOUBLE PRECISION NOT NULL,
    "serviceFee" DOUBLE PRECISION NOT NULL,
    "agentCommission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "managerCommission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "paymentReference" TEXT,
    "paystackReference" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "fulfillmentType" "FulfillmentType" NOT NULL,
    "fulfillmentDate" TIMESTAMP(3) NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "slotExpired" BOOLEAN NOT NULL DEFAULT false,
    "slotExpiredAt" TIMESTAMP(3),
    "deliveryAddress" TEXT,
    "pickupLocation" TEXT,
    "qrCode" TEXT,
    "qrCodeScannedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "rescheduledCount" INTEGER NOT NULL DEFAULT 0,
    "lastRescheduledAt" TIMESTAMP(3),
    "reschedulingFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "bookTitle" TEXT NOT NULL,
    "bookPrice" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyReport" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "reportDate" DATE NOT NULL,
    "totalOrdersScheduled" INTEGER NOT NULL DEFAULT 0,
    "completedPickups" INTEGER NOT NULL DEFAULT 0,
    "completedDeliveries" INTEGER NOT NULL DEFAULT 0,
    "missedSlots" INTEGER NOT NULL DEFAULT 0,
    "reschedules" INTEGER NOT NULL DEFAULT 0,
    "totalOrderValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalServiceFees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRescheduleFees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "agentPerformance" JSONB NOT NULL,
    "topBooks" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "DailyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyReport" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "weekStartDate" DATE NOT NULL,
    "weekEndDate" DATE NOT NULL,
    "totalOrdersScheduled" INTEGER NOT NULL DEFAULT 0,
    "completedPickups" INTEGER NOT NULL DEFAULT 0,
    "completedDeliveries" INTEGER NOT NULL DEFAULT 0,
    "missedSlots" INTEGER NOT NULL DEFAULT 0,
    "reschedules" INTEGER NOT NULL DEFAULT 0,
    "totalOrderValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalServiceFees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRescheduleFees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "agentPerformance" JSONB NOT NULL,
    "topBooks" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "WeeklyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyReport" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "reportMonth" DATE NOT NULL,
    "totalOrdersScheduled" INTEGER NOT NULL DEFAULT 0,
    "completedPickups" INTEGER NOT NULL DEFAULT 0,
    "completedDeliveries" INTEGER NOT NULL DEFAULT 0,
    "missedSlots" INTEGER NOT NULL DEFAULT 0,
    "reschedules" INTEGER NOT NULL DEFAULT 0,
    "totalOrderValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalServiceFees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRescheduleFees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "agentPerformance" JSONB NOT NULL,
    "topBooks" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MonthlyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryAgent_email_key" ON "DeliveryAgent"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryAgent_idempotencyKey_key" ON "DeliveryAgent"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "Order_paymentReference_key" ON "Order"("paymentReference");

-- CreateIndex
CREATE UNIQUE INDEX "Order_paystackReference_key" ON "Order"("paystackReference");

-- CreateIndex
CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "Order_qrCode_key" ON "Order"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "Config_key_key" ON "Config"("key");

-- CreateIndex
CREATE INDEX "DailyReport_reportDate_idx" ON "DailyReport"("reportDate");

-- CreateIndex
CREATE UNIQUE INDEX "DailyReport_universityId_reportDate_key" ON "DailyReport"("universityId", "reportDate");

-- CreateIndex
CREATE INDEX "WeeklyReport_weekStartDate_idx" ON "WeeklyReport"("weekStartDate");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyReport_universityId_weekStartDate_key" ON "WeeklyReport"("universityId", "weekStartDate");

-- CreateIndex
CREATE INDEX "MonthlyReport_reportMonth_idx" ON "MonthlyReport"("reportMonth");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyReport_universityId_reportMonth_key" ON "MonthlyReport"("universityId", "reportMonth");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryAgent" ADD CONSTRAINT "DeliveryAgent_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "DeliveryAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyReport" ADD CONSTRAINT "DailyReport_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyReport" ADD CONSTRAINT "WeeklyReport_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyReport" ADD CONSTRAINT "MonthlyReport_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
