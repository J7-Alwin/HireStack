-- CreateTable
CREATE TABLE "AiInsight" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT,
    "overallInsight" TEXT NOT NULL,
    "strengths" JSONB NOT NULL,
    "weaknesses" JSONB NOT NULL,
    "skillGaps" JSONB NOT NULL,
    "experienceConcerns" JSONB NOT NULL,
    "hiringRisks" JSONB NOT NULL,
    "hiringConfidence" INTEGER NOT NULL,
    "jobFitObservations" JSONB NOT NULL,
    "recruiterFocusAreas" JSONB NOT NULL,
    "recommendation" TEXT NOT NULL,
    "aiModel" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiInsight_candidateId_idx" ON "AiInsight"("candidateId");

-- CreateIndex
CREATE INDEX "AiInsight_jobId_idx" ON "AiInsight"("jobId");

-- CreateIndex
CREATE INDEX "AiInsight_candidateId_createdAt_idx" ON "AiInsight"("candidateId", "createdAt");

-- AddForeignKey
ALTER TABLE "AiInsight" ADD CONSTRAINT "AiInsight_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiInsight" ADD CONSTRAINT "AiInsight_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
