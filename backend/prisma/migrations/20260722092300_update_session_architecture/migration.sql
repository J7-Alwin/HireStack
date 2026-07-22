-- DropIndex
DROP INDEX "Session_tokenHash_key";

-- DropIndex
DROP INDEX "User_emailVerificationToken_key";

-- DropIndex
DROP INDEX "User_passwordResetToken_key";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "isBlocked",
DROP COLUMN "tokenHash",
ADD COLUMN     "lastUsedAt" TIMESTAMP(3),
ADD COLUMN     "refreshTokenHash" TEXT NOT NULL,
ADD COLUMN     "revokedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Session_refreshTokenHash_idx" ON "Session"("refreshTokenHash");
