-- CreateEnum
CREATE TYPE "InterviewAssistantMode" AS ENUM ('GENERAL', 'JOB_SPECIFIC');

-- CreateTable
CREATE TABLE "InterviewAssistant" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT,
    "mode" "InterviewAssistantMode" NOT NULL,
    "overallSummary" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "aiModel" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewAssistant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InterviewAssistant_candidateId_idx" ON "InterviewAssistant"("candidateId");

-- CreateIndex
CREATE INDEX "InterviewAssistant_jobId_idx" ON "InterviewAssistant"("jobId");

-- CreateIndex
CREATE INDEX "InterviewAssistant_candidateId_createdAt_idx" ON "InterviewAssistant"("candidateId", "createdAt");

-- AddForeignKey
ALTER TABLE "InterviewAssistant" ADD CONSTRAINT "InterviewAssistant_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewAssistant" ADD CONSTRAINT "InterviewAssistant_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
