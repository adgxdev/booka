/*
  Warnings:

  - A unique constraint covering the columns `[referralCode]` on the table `Waitlist` will be added. If there are existing duplicate values, this will fail.
  - Made the column `referralCode` on table `Waitlist` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Waitlist" ADD COLUMN     "parentCode" TEXT,
ALTER COLUMN "referralCode" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Waitlist_referralCode_key" ON "Waitlist"("referralCode");

-- AddForeignKey
ALTER TABLE "Waitlist" ADD CONSTRAINT "Waitlist_parentCode_fkey" FOREIGN KEY ("parentCode") REFERENCES "Waitlist"("referralCode") ON DELETE SET NULL ON UPDATE CASCADE;
