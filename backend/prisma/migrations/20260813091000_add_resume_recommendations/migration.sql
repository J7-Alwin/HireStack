-- CreateEnum
CREATE TYPE "ResumeRecommendationMode" AS ENUM ('GENERAL', 'JOB_SPECIFIC');

-- CreateTable
CREATE TABLE "ResumeRecommendation" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT,
    "mode" "ResumeRecommendationMode" NOT NULL,
    "overallSummary" TEXT NOT NULL,
    "recommendations" JSONB NOT NULL,
    "aiModel" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResumeRecommendation_candidateId_idx" ON "ResumeRecommendation"("candidateId");

-- CreateIndex
CREATE INDEX "ResumeRecommendation_jobId_idx" ON "ResumeRecommendation"("jobId");

-- AddForeignKey
ALTER TABLE "ResumeRecommendation" ADD CONSTRAINT "ResumeRecommendation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeRecommendation" ADD CONSTRAINT "ResumeRecommendation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
