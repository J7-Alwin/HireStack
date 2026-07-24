/*
  Warnings:

  - You are about to drop the column `coverImage` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `facebook` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `foundedYear` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `instagram` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `linkedin` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `twitter` on the `Company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company" DROP COLUMN "coverImage",
DROP COLUMN "email",
DROP COLUMN "facebook",
DROP COLUMN "foundedYear",
DROP COLUMN "instagram",
DROP COLUMN "linkedin",
DROP COLUMN "phone",
DROP COLUMN "twitter",
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT;
