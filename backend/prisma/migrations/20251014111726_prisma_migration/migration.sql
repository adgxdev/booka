/*
  Warnings:

  - You are about to drop the column `phone_number` on the `Admin` table. All the data in the column will be lost.
  - Added the required column `phoneNumber` to the `Admin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "phone_number",
ADD COLUMN     "phoneNumber" TEXT NOT NULL;
