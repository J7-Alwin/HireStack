-- AlterEnum
ALTER TYPE "AccountStatus" ADD VALUE 'PENDING';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'COMPANY_ADMIN';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "name" TEXT;
