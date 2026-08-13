/*
  Warnings:

  - Added the required column `companyId` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employmentType` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobCode` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openings` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workplaceType` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Made the column `departmentId` on table `Job` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY', 'FREELANCE');

-- CreateEnum
CREATE TYPE "WorkplaceType" AS ENUM ('ONSITE', 'REMOTE', 'HYBRID');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'OPEN', 'PAUSED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('INTERNAL', 'PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('ACTIVE', 'PASSIVE', 'ON_HOLD', 'BLACKLISTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('EMPLOYED', 'UNEMPLOYED', 'STUDENT', 'FREELANCER', 'SELF_EMPLOYED', 'CONTRACT');

-- CreateEnum
CREATE TYPE "CandidateSource" AS ENUM ('REFERRAL', 'LINKEDIN', 'NAUKRI', 'INDEED', 'CAREER_PAGE', 'CONSULTANCY', 'CAMPUS', 'WALK_IN', 'IMPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "SkillProficiency" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('RESUME', 'COVER_LETTER', 'CERTIFICATE', 'PORTFOLIO', 'OTHER');

-- CreateEnum
CREATE TYPE "ApplicationStage" AS ENUM ('APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW', 'OFFER');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('ACTIVE', 'HIRED', 'REJECTED', 'WITHDRAWN', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('INTERNAL', 'CLIENT', 'CAMPUS', 'WALK_IN', 'OTHER');

-- CreateEnum
CREATE TYPE "InterviewRound" AS ENUM ('SCREENING', 'TECHNICAL', 'MANAGERIAL', 'HR', 'FINAL');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "InterviewOutcome" AS ENUM ('PASS', 'FAIL', 'ON_HOLD', 'RECOMMENDED', 'STRONG_RECOMMEND', 'NOT_RECOMMENDED');

-- CreateEnum
CREATE TYPE "InterviewMode" AS ENUM ('ONLINE', 'ONSITE', 'PHONE');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'VIEWED', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD');

-- CreateEnum
CREATE TYPE "PipelineStage" AS ENUM ('APPLIED', 'SCREENING', 'SHORTLISTED', 'HR_INTERVIEW', 'TECHNICAL_INTERVIEW', 'FINAL_INTERVIEW', 'OFFER_PENDING', 'OFFER_SENT', 'OFFER_ACCEPTED', 'HIRED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "PipelineTimelineEventType" AS ENUM ('APPLICATION_SUBMITTED', 'CANDIDATE_SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFER_PENDING', 'OFFER_SENT', 'OFFER_ACCEPTED', 'CANDIDATE_HIRED', 'CANDIDATE_REJECTED', 'CANDIDATE_WITHDRAWN', 'RECRUITER_ADDED_NOTE', 'STAGE_OVERRIDE');

-- CreateEnum
CREATE TYPE "ResumeRecommendationMode" AS ENUM ('GENERAL', 'JOB_SPECIFIC');

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_departmentId_fkey";

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "benefits" TEXT,
ADD COLUMN     "closingDate" TIMESTAMP(3),
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "employmentType" "EmploymentType" NOT NULL,
ADD COLUMN     "experienceMax" INTEGER,
ADD COLUMN     "experienceMin" INTEGER,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "jobCode" TEXT NOT NULL,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "openings" INTEGER NOT NULL,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "requirements" TEXT,
ADD COLUMN     "responsibilities" TEXT,
ADD COLUMN     "salaryMax" DOUBLE PRECISION,
ADD COLUMN     "salaryMin" DOUBLE PRECISION,
ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
ADD COLUMN     "workplaceType" "WorkplaceType" NOT NULL,
ALTER COLUMN "departmentId" SET NOT NULL;

-- CreateTable
CREATE TABLE "JobRecruiter" (
    "jobId" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobRecruiter_pkey" PRIMARY KEY ("jobId","recruiterId")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSkill" (
    "jobId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSkill_pkey" PRIMARY KEY ("jobId","skillId")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "primaryRecruiterId" TEXT NOT NULL,
    "candidateCode" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "alternatePhone" TEXT,
    "gender" "Gender",
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zipCode" TEXT,
    "currentCompany" TEXT,
    "currentDesignation" TEXT,
    "experienceYears" INTEGER,
    "experienceMonths" INTEGER,
    "expectedSalary" DOUBLE PRECISION,
    "currentSalary" DOUBLE PRECISION,
    "currency" TEXT,
    "noticePeriod" INTEGER,
    "employmentStatus" "EmploymentStatus",
    "source" "CandidateSource",
    "linkedInUrl" TEXT,
    "githubUrl" TEXT,
    "portfolioUrl" TEXT,
    "status" "CandidateStatus" NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateSkill" (
    "candidateId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "proficiency" "SkillProficiency" NOT NULL DEFAULT 'INTERMEDIATE',
    "experienceYears" INTEGER,
    "experienceMonths" INTEGER,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CandidateSkill_pkey" PRIMARY KEY ("candidateId","skillId")
);

-- CreateTable
CREATE TABLE "CandidateEducation" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "specialization" TEXT,
    "institution" TEXT NOT NULL,
    "university" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "graduationYear" INTEGER,
    "grade" TEXT,
    "isHighest" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateEducation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateExperience" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "employmentType" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateDocument" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "documentType" "DocumentType" NOT NULL DEFAULT 'RESUME',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateNote" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateTag" (
    "candidateId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CandidateTag_pkey" PRIMARY KEY ("candidateId","tagId")
);

-- CreateTable
CREATE TABLE "CompanyCandidateCounter" (
    "companyId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CompanyCandidateCounter_pkey" PRIMARY KEY ("companyId")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "applicationCode" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "assignedRecruiterId" TEXT NOT NULL,
    "stage" "ApplicationStage" NOT NULL DEFAULT 'APPLIED',
    "status" "ApplicationStatus" NOT NULL DEFAULT 'ACTIVE',
    "source" "CandidateSource",
    "remarks" VARCHAR(3000),
    "rejectionReasonCode" TEXT,
    "rejectionReasonNote" VARCHAR(1000),
    "withdrawalReasonCode" TEXT,
    "withdrawalReasonNote" VARCHAR(1000),
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyApplicationCounter" (
    "companyId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CompanyApplicationCounter_pkey" PRIMARY KEY ("companyId")
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "interviewCode" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "interviewType" "InterviewType" NOT NULL,
    "round" "InterviewRound" NOT NULL,
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "outcome" "InterviewOutcome",
    "mode" "InterviewMode" NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "timeZone" TEXT NOT NULL,
    "meetingLink" VARCHAR(2048),
    "location" VARCHAR(500),
    "notes" VARCHAR(3000),
    "resultNotes" VARCHAR(3000),
    "cancellationReason" VARCHAR(1000),
    "cancelledAt" TIMESTAMP(3),
    "cancelledById" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewInterviewer" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewInterviewer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyInterviewCounter" (
    "companyId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CompanyInterviewCounter_pkey" PRIMARY KEY ("companyId")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "offerCode" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "OfferStatus" NOT NULL DEFAULT 'DRAFT',
    "salary" DECIMAL(12,2) NOT NULL,
    "currency" "Currency" NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "benefits" VARCHAR(5000),
    "notes" VARCHAR(3000),
    "offerLetterUrl" VARCHAR(2048),
    "offerLetterFileName" VARCHAR(500),
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyOfferCounter" (
    "companyId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CompanyOfferCounter_pkey" PRIMARY KEY ("companyId")
);

-- CreateTable
CREATE TABLE "HiringPipeline" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "currentStage" "PipelineStage" NOT NULL DEFAULT 'APPLIED',
    "previousStage" "PipelineStage",
    "stageChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stageOrder" INTEGER NOT NULL DEFAULT 1,
    "notes" VARCHAR(2000),
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "HiringPipeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipelineHistory" (
    "id" TEXT NOT NULL,
    "pipelineId" TEXT NOT NULL,
    "fromStage" "PipelineStage",
    "toStage" "PipelineStage" NOT NULL,
    "movedById" TEXT NOT NULL,
    "reason" VARCHAR(500),
    "comments" VARCHAR(2000),
    "movedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PipelineHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipelineTimeline" (
    "id" TEXT NOT NULL,
    "pipelineId" TEXT NOT NULL,
    "eventType" "PipelineTimelineEventType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(2000) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PipelineTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ATSScore" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "skillScore" INTEGER NOT NULL,
    "experienceScore" INTEGER NOT NULL,
    "educationScore" INTEGER NOT NULL,
    "keywordScore" INTEGER NOT NULL,
    "certificationScore" INTEGER NOT NULL,
    "strengths" JSONB NOT NULL,
    "weaknesses" JSONB NOT NULL,
    "missingSkills" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "hiringRecommendation" TEXT NOT NULL,
    "overallReason" TEXT NOT NULL,
    "aiModel" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ATSScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobMatch" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "matchPercentage" INTEGER NOT NULL,
    "skillMatch" INTEGER NOT NULL,
    "experienceMatch" INTEGER NOT NULL,
    "educationMatch" INTEGER NOT NULL,
    "projectMatch" INTEGER NOT NULL,
    "keywordMatch" INTEGER NOT NULL,
    "strengths" JSONB NOT NULL,
    "missingSkills" JSONB NOT NULL,
    "overallReason" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "aiModel" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobMatch_pkey" PRIMARY KEY ("id")
);

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
CREATE INDEX "JobRecruiter_recruiterId_idx" ON "JobRecruiter"("recruiterId");

-- CreateIndex
CREATE INDEX "JobRecruiter_jobId_idx" ON "JobRecruiter"("jobId");

-- CreateIndex
CREATE INDEX "JobSkill_jobId_idx" ON "JobSkill"("jobId");

-- CreateIndex
CREATE INDEX "JobSkill_skillId_idx" ON "JobSkill"("skillId");

-- CreateIndex
CREATE INDEX "Candidate_companyId_idx" ON "Candidate"("companyId");

-- CreateIndex
CREATE INDEX "Candidate_primaryRecruiterId_idx" ON "Candidate"("primaryRecruiterId");

-- CreateIndex
CREATE INDEX "Candidate_status_idx" ON "Candidate"("status");

-- CreateIndex
CREATE INDEX "Candidate_deletedAt_idx" ON "Candidate"("deletedAt");

-- CreateIndex
CREATE INDEX "Candidate_email_idx" ON "Candidate"("email");

-- CreateIndex
CREATE INDEX "Candidate_phone_idx" ON "Candidate"("phone");

-- CreateIndex
CREATE INDEX "CandidateSkill_candidateId_idx" ON "CandidateSkill"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateSkill_skillId_idx" ON "CandidateSkill"("skillId");

-- CreateIndex
CREATE INDEX "CandidateEducation_candidateId_idx" ON "CandidateEducation"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateExperience_candidateId_idx" ON "CandidateExperience"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateDocument_candidateId_idx" ON "CandidateDocument"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateNote_candidateId_idx" ON "CandidateNote"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateNote_authorId_idx" ON "CandidateNote"("authorId");

-- CreateIndex
CREATE INDEX "Tag_companyId_idx" ON "Tag"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_companyId_name_key" ON "Tag"("companyId", "name");

-- CreateIndex
CREATE INDEX "CandidateTag_candidateId_idx" ON "CandidateTag"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateTag_tagId_idx" ON "CandidateTag"("tagId");

-- CreateIndex
CREATE INDEX "Application_companyId_idx" ON "Application"("companyId");

-- CreateIndex
CREATE INDEX "Application_candidateId_idx" ON "Application"("candidateId");

-- CreateIndex
CREATE INDEX "Application_jobId_idx" ON "Application"("jobId");

-- CreateIndex
CREATE INDEX "Application_assignedRecruiterId_idx" ON "Application"("assignedRecruiterId");

-- CreateIndex
CREATE INDEX "Application_stage_idx" ON "Application"("stage");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_deletedAt_idx" ON "Application"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Application_companyId_applicationCode_key" ON "Application"("companyId", "applicationCode");

-- CreateIndex
CREATE INDEX "Interview_companyId_idx" ON "Interview"("companyId");

-- CreateIndex
CREATE INDEX "Interview_applicationId_idx" ON "Interview"("applicationId");

-- CreateIndex
CREATE INDEX "Interview_status_idx" ON "Interview"("status");

-- CreateIndex
CREATE INDEX "Interview_round_idx" ON "Interview"("round");

-- CreateIndex
CREATE INDEX "Interview_interviewType_idx" ON "Interview"("interviewType");

-- CreateIndex
CREATE INDEX "Interview_scheduledDate_idx" ON "Interview"("scheduledDate");

-- CreateIndex
CREATE INDEX "Interview_createdAt_idx" ON "Interview"("createdAt");

-- CreateIndex
CREATE INDEX "Interview_deletedAt_idx" ON "Interview"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Interview_companyId_interviewCode_key" ON "Interview"("companyId", "interviewCode");

-- CreateIndex
CREATE INDEX "InterviewInterviewer_interviewId_idx" ON "InterviewInterviewer"("interviewId");

-- CreateIndex
CREATE INDEX "InterviewInterviewer_interviewerId_idx" ON "InterviewInterviewer"("interviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewInterviewer_interviewId_interviewerId_key" ON "InterviewInterviewer"("interviewId", "interviewerId");

-- CreateIndex
CREATE INDEX "Offer_companyId_idx" ON "Offer"("companyId");

-- CreateIndex
CREATE INDEX "Offer_applicationId_idx" ON "Offer"("applicationId");

-- CreateIndex
CREATE INDEX "Offer_candidateId_idx" ON "Offer"("candidateId");

-- CreateIndex
CREATE INDEX "Offer_recruiterId_idx" ON "Offer"("recruiterId");

-- CreateIndex
CREATE INDEX "Offer_status_idx" ON "Offer"("status");

-- CreateIndex
CREATE INDEX "Offer_deletedAt_idx" ON "Offer"("deletedAt");

-- CreateIndex
CREATE INDEX "Offer_offerCode_idx" ON "Offer"("offerCode");

-- CreateIndex
CREATE INDEX "Offer_createdAt_idx" ON "Offer"("createdAt");

-- CreateIndex
CREATE INDEX "Offer_updatedAt_idx" ON "Offer"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_companyId_offerCode_version_key" ON "Offer"("companyId", "offerCode", "version");

-- CreateIndex
CREATE UNIQUE INDEX "HiringPipeline_applicationId_key" ON "HiringPipeline"("applicationId");

-- CreateIndex
CREATE INDEX "HiringPipeline_companyId_idx" ON "HiringPipeline"("companyId");

-- CreateIndex
CREATE INDEX "HiringPipeline_applicationId_idx" ON "HiringPipeline"("applicationId");

-- CreateIndex
CREATE INDEX "HiringPipeline_candidateId_idx" ON "HiringPipeline"("candidateId");

-- CreateIndex
CREATE INDEX "HiringPipeline_recruiterId_idx" ON "HiringPipeline"("recruiterId");

-- CreateIndex
CREATE INDEX "HiringPipeline_jobId_idx" ON "HiringPipeline"("jobId");

-- CreateIndex
CREATE INDEX "HiringPipeline_currentStage_idx" ON "HiringPipeline"("currentStage");

-- CreateIndex
CREATE INDEX "HiringPipeline_deletedAt_idx" ON "HiringPipeline"("deletedAt");

-- CreateIndex
CREATE INDEX "HiringPipeline_createdAt_idx" ON "HiringPipeline"("createdAt");

-- CreateIndex
CREATE INDEX "HiringPipeline_updatedAt_idx" ON "HiringPipeline"("updatedAt");

-- CreateIndex
CREATE INDEX "PipelineHistory_pipelineId_idx" ON "PipelineHistory"("pipelineId");

-- CreateIndex
CREATE INDEX "PipelineHistory_movedById_idx" ON "PipelineHistory"("movedById");

-- CreateIndex
CREATE INDEX "PipelineTimeline_pipelineId_idx" ON "PipelineTimeline"("pipelineId");

-- CreateIndex
CREATE INDEX "PipelineTimeline_createdById_idx" ON "PipelineTimeline"("createdById");

-- CreateIndex
CREATE INDEX "ATSScore_candidateId_idx" ON "ATSScore"("candidateId");

-- CreateIndex
CREATE INDEX "ATSScore_jobId_idx" ON "ATSScore"("jobId");

-- CreateIndex
CREATE INDEX "JobMatch_candidateId_idx" ON "JobMatch"("candidateId");

-- CreateIndex
CREATE INDEX "JobMatch_jobId_idx" ON "JobMatch"("jobId");

-- CreateIndex
CREATE INDEX "ResumeRecommendation_candidateId_idx" ON "ResumeRecommendation"("candidateId");

-- CreateIndex
CREATE INDEX "ResumeRecommendation_jobId_idx" ON "ResumeRecommendation"("jobId");

-- CreateIndex
CREATE INDEX "Job_companyId_idx" ON "Job"("companyId");

-- CreateIndex
CREATE INDEX "Job_departmentId_idx" ON "Job"("departmentId");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_jobCode_idx" ON "Job"("jobCode");

-- CreateIndex
CREATE INDEX "Job_createdBy_idx" ON "Job"("createdBy");

-- CreateIndex
CREATE INDEX "Job_deletedAt_idx" ON "Job"("deletedAt");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRecruiter" ADD CONSTRAINT "JobRecruiter_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRecruiter" ADD CONSTRAINT "JobRecruiter_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRecruiter" ADD CONSTRAINT "JobRecruiter_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSkill" ADD CONSTRAINT "JobSkill_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSkill" ADD CONSTRAINT "JobSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_primaryRecruiterId_fkey" FOREIGN KEY ("primaryRecruiterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateSkill" ADD CONSTRAINT "CandidateSkill_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateSkill" ADD CONSTRAINT "CandidateSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateEducation" ADD CONSTRAINT "CandidateEducation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateExperience" ADD CONSTRAINT "CandidateExperience_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateDocument" ADD CONSTRAINT "CandidateDocument_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateDocument" ADD CONSTRAINT "CandidateDocument_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateNote" ADD CONSTRAINT "CandidateNote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateNote" ADD CONSTRAINT "CandidateNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateTag" ADD CONSTRAINT "CandidateTag_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateTag" ADD CONSTRAINT "CandidateTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyCandidateCounter" ADD CONSTRAINT "CompanyCandidateCounter_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_assignedRecruiterId_fkey" FOREIGN KEY ("assignedRecruiterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyApplicationCounter" ADD CONSTRAINT "CompanyApplicationCounter_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewInterviewer" ADD CONSTRAINT "InterviewInterviewer_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewInterviewer" ADD CONSTRAINT "InterviewInterviewer_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyInterviewCounter" ADD CONSTRAINT "CompanyInterviewCounter_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyOfferCounter" ADD CONSTRAINT "CompanyOfferCounter_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiringPipeline" ADD CONSTRAINT "HiringPipeline_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiringPipeline" ADD CONSTRAINT "HiringPipeline_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiringPipeline" ADD CONSTRAINT "HiringPipeline_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiringPipeline" ADD CONSTRAINT "HiringPipeline_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiringPipeline" ADD CONSTRAINT "HiringPipeline_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineHistory" ADD CONSTRAINT "PipelineHistory_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "HiringPipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineHistory" ADD CONSTRAINT "PipelineHistory_movedById_fkey" FOREIGN KEY ("movedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineTimeline" ADD CONSTRAINT "PipelineTimeline_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "HiringPipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineTimeline" ADD CONSTRAINT "PipelineTimeline_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ATSScore" ADD CONSTRAINT "ATSScore_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ATSScore" ADD CONSTRAINT "ATSScore_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobMatch" ADD CONSTRAINT "JobMatch_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobMatch" ADD CONSTRAINT "JobMatch_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeRecommendation" ADD CONSTRAINT "ResumeRecommendation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeRecommendation" ADD CONSTRAINT "ResumeRecommendation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobCode_key" ON "Job"("jobCode");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_companyId_candidateCode_key" ON "Candidate"("companyId", "candidateCode");

