-- CreateEnum (Safely check if enums exist before creating them)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EmploymentType') THEN
        CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY', 'FREELANCE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WorkplaceType') THEN
        CREATE TYPE "WorkplaceType" AS ENUM ('ONSITE', 'REMOTE', 'HYBRID');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'JobStatus') THEN
        CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'OPEN', 'PAUSED', 'CLOSED', 'ARCHIVED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Visibility') THEN
        CREATE TYPE "Visibility" AS ENUM ('INTERNAL', 'PUBLIC', 'PRIVATE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CandidateStatus') THEN
        CREATE TYPE "CandidateStatus" AS ENUM ('ACTIVE', 'PASSIVE', 'ON_HOLD', 'BLACKLISTED', 'ARCHIVED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Gender') THEN
        CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EmploymentStatus') THEN
        CREATE TYPE "EmploymentStatus" AS ENUM ('EMPLOYED', 'UNEMPLOYED', 'STUDENT', 'FREELANCER', 'SELF_EMPLOYED', 'CONTRACT');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CandidateSource') THEN
        CREATE TYPE "CandidateSource" AS ENUM ('REFERRAL', 'LINKEDIN', 'NAUKRI', 'INDEED', 'CAREER_PAGE', 'CONSULTANCY', 'CAMPUS', 'WALK_IN', 'IMPORT', 'OTHER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SkillProficiency') THEN
        CREATE TYPE "SkillProficiency" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DocumentType') THEN
        CREATE TYPE "DocumentType" AS ENUM ('RESUME', 'COVER_LETTER', 'CERTIFICATE', 'PORTFOLIO', 'OTHER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ApplicationStage') THEN
        CREATE TYPE "ApplicationStage" AS ENUM ('APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW', 'OFFER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ApplicationStatus') THEN
        CREATE TYPE "ApplicationStatus" AS ENUM ('ACTIVE', 'HIRED', 'REJECTED', 'WITHDRAWN', 'ARCHIVED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InterviewType') THEN
        CREATE TYPE "InterviewType" AS ENUM ('INTERNAL', 'CLIENT', 'CAMPUS', 'WALK_IN', 'OTHER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InterviewRound') THEN
        CREATE TYPE "InterviewRound" AS ENUM ('SCREENING', 'TECHNICAL', 'MANAGERIAL', 'HR', 'FINAL');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InterviewStatus') THEN
        CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InterviewOutcome') THEN
        CREATE TYPE "InterviewOutcome" AS ENUM ('PASS', 'FAIL', 'ON_HOLD', 'RECOMMENDED', 'STRONG_RECOMMEND', 'NOT_RECOMMENDED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InterviewMode') THEN
        CREATE TYPE "InterviewMode" AS ENUM ('ONLINE', 'ONSITE', 'PHONE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OfferStatus') THEN
        CREATE TYPE "OfferStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'VIEWED', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'WITHDRAWN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Currency') THEN
        CREATE TYPE "Currency" AS ENUM ('INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PipelineStage') THEN
        CREATE TYPE "PipelineStage" AS ENUM ('APPLIED', 'SCREENING', 'SHORTLISTED', 'HR_INTERVIEW', 'TECHNICAL_INTERVIEW', 'FINAL_INTERVIEW', 'OFFER_PENDING', 'OFFER_SENT', 'OFFER_ACCEPTED', 'HIRED', 'REJECTED', 'WITHDRAWN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PipelineTimelineEventType') THEN
        CREATE TYPE "PipelineTimelineEventType" AS ENUM ('APPLICATION_SUBMITTED', 'CANDIDATE_SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'OFFER_PENDING', 'OFFER_SENT', 'OFFER_ACCEPTED', 'CANDIDATE_HIRED', 'CANDIDATE_REJECTED', 'CANDIDATE_WITHDRAWN', 'RECRUITER_ADDED_NOTE', 'STAGE_OVERRIDE');
    END IF;
END $$;

-- DropForeignKey (Safely check constraint existence before dropping)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Job_departmentId_fkey') THEN
        ALTER TABLE "Job" DROP CONSTRAINT "Job_departmentId_fkey";
    END IF;
END $$;

-- AlterTable (Safely add columns as nullable to handle populated tables)
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3);
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "benefits" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "closingDate" TIMESTAMP(3);
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "createdBy" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "currency" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "employmentType" "EmploymentType";
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "experienceMax" INTEGER;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "experienceMin" INTEGER;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "jobCode" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "openings" INTEGER;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "requirements" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "responsibilities" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "salaryMax" DOUBLE PRECISION;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "salaryMin" DOUBLE PRECISION;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "status" "JobStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC';
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "workplaceType" "WorkplaceType";

-- Backfill defaults to handle NOT NULL constraints if table is populated
UPDATE "Job" SET "companyId" = 'smoke-test-company-id' WHERE "companyId" IS NULL;
UPDATE "Job" SET "createdBy" = 'smoke-test-creator-id' WHERE "createdBy" IS NULL;
UPDATE "Job" SET "description" = 'Job description details' WHERE "description" IS NULL;
UPDATE "Job" SET "employmentType" = 'FULL_TIME' WHERE "employmentType" IS NULL;
UPDATE "Job" SET "jobCode" = 'JOB-TEMP-' || id WHERE "jobCode" IS NULL;
UPDATE "Job" SET "openings" = 1 WHERE "openings" IS NULL;
UPDATE "Job" SET "title" = 'Job Title' WHERE "title" IS NULL;
UPDATE "Job" SET "workplaceType" = 'REMOTE' WHERE "workplaceType" IS NULL;

-- Backfill departmentId safely if nullable in existing populated database
DO $$ DECLARE
    first_dept_id TEXT;
BEGIN
    SELECT id INTO first_dept_id FROM "Department" LIMIT 1;
    IF first_dept_id IS NOT NULL THEN
        UPDATE "Job" SET "departmentId" = first_dept_id WHERE "departmentId" IS NULL;
    END IF;
END $$;

-- Convert columns to NOT NULL now that values exist
ALTER TABLE "Job" ALTER COLUMN "companyId" SET NOT NULL;
ALTER TABLE "Job" ALTER COLUMN "createdBy" SET NOT NULL;
ALTER TABLE "Job" ALTER COLUMN "description" SET NOT NULL;
ALTER TABLE "Job" ALTER COLUMN "employmentType" SET NOT NULL;
ALTER TABLE "Job" ALTER COLUMN "jobCode" SET NOT NULL;
ALTER TABLE "Job" ALTER COLUMN "openings" SET NOT NULL;
ALTER TABLE "Job" ALTER COLUMN "title" SET NOT NULL;
ALTER TABLE "Job" ALTER COLUMN "workplaceType" SET NOT NULL;
ALTER TABLE "Job" ALTER COLUMN "departmentId" SET NOT NULL;

-- CreateTable
CREATE TABLE IF NOT EXISTS "JobRecruiter" (
    "jobId" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobRecruiter_pkey" PRIMARY KEY ("jobId","recruiterId")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "JobSkill" (
    "jobId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSkill_pkey" PRIMARY KEY ("jobId","skillId")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Candidate" (
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
CREATE TABLE IF NOT EXISTS "CandidateSkill" (
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
CREATE TABLE IF NOT EXISTS "CandidateEducation" (
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
CREATE TABLE IF NOT EXISTS "CandidateExperience" (
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
CREATE TABLE IF NOT EXISTS "CandidateDocument" (
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
CREATE TABLE IF NOT EXISTS "CandidateNote" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Tag" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CandidateTag" (
    "candidateId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CandidateTag_pkey" PRIMARY KEY ("candidateId","tagId")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CompanyCandidateCounter" (
    "companyId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CompanyCandidateCounter_pkey" PRIMARY KEY ("companyId")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Application" (
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
CREATE TABLE IF NOT EXISTS "CompanyApplicationCounter" (
    "companyId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CompanyApplicationCounter_pkey" PRIMARY KEY ("companyId")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Interview" (
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
CREATE TABLE IF NOT EXISTS "InterviewInterviewer" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewInterviewer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CompanyInterviewCounter" (
    "companyId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CompanyInterviewCounter_pkey" PRIMARY KEY ("companyId")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Offer" (
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
CREATE TABLE IF NOT EXISTS "CompanyOfferCounter" (
    "companyId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CompanyOfferCounter_pkey" PRIMARY KEY ("companyId")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "HiringPipeline" (
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
CREATE TABLE IF NOT EXISTS "PipelineHistory" (
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
CREATE TABLE IF NOT EXISTS "PipelineTimeline" (
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
CREATE TABLE IF NOT EXISTS "ATSScore" (
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
CREATE TABLE IF NOT EXISTS "JobMatch" (
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

-- CreateIndex (Safely wrap index creation in DO blocks)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'JobRecruiter_recruiterId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "JobRecruiter_recruiterId_idx" ON "JobRecruiter"("recruiterId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'JobRecruiter_jobId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "JobRecruiter_jobId_idx" ON "JobRecruiter"("jobId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Skill_name_key' AND n.nspname = 'public') THEN
        CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'JobSkill_jobId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "JobSkill_jobId_idx" ON "JobSkill"("jobId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'JobSkill_skillId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "JobSkill_skillId_idx" ON "JobSkill"("skillId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Candidate_companyId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Candidate_companyId_idx" ON "Candidate"("companyId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Candidate_primaryRecruiterId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Candidate_primaryRecruiterId_idx" ON "Candidate"("primaryRecruiterId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Candidate_status_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Candidate_status_idx" ON "Candidate"("status");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Candidate_deletedAt_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Candidate_deletedAt_idx" ON "Candidate"("deletedAt");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Candidate_email_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Candidate_email_idx" ON "Candidate"("email");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Candidate_phone_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Candidate_phone_idx" ON "Candidate"("phone");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Candidate_companyId_candidateCode_key' AND n.nspname = 'public') THEN
        CREATE UNIQUE INDEX "Candidate_companyId_candidateCode_key" ON "Candidate"("companyId", "candidateCode");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'CandidateSkill_candidateId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "CandidateSkill_candidateId_idx" ON "CandidateSkill"("candidateId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'CandidateSkill_skillId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "CandidateSkill_skillId_idx" ON "CandidateSkill"("skillId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'CandidateEducation_candidateId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "CandidateEducation_candidateId_idx" ON "CandidateEducation"("candidateId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'CandidateExperience_candidateId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "CandidateExperience_candidateId_idx" ON "CandidateExperience"("candidateId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'CandidateDocument_candidateId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "CandidateDocument_candidateId_idx" ON "CandidateDocument"("candidateId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'CandidateNote_candidateId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "CandidateNote_candidateId_idx" ON "CandidateNote"("candidateId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'CandidateNote_authorId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "CandidateNote_authorId_idx" ON "CandidateNote"("authorId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Tag_companyId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Tag_companyId_idx" ON "Tag"("companyId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Tag_companyId_name_key' AND n.nspname = 'public') THEN
        CREATE UNIQUE INDEX "Tag_companyId_name_key" ON "Tag"("companyId", "name");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'CandidateTag_candidateId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "CandidateTag_candidateId_idx" ON "CandidateTag"("candidateId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'CandidateTag_tagId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "CandidateTag_tagId_idx" ON "CandidateTag"("tagId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Application_companyId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Application_companyId_idx" ON "Application"("companyId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Application_candidateId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Application_candidateId_idx" ON "Application"("candidateId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Application_jobId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Application_jobId_idx" ON "Application"("jobId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Application_assignedRecruiterId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Application_assignedRecruiterId_idx" ON "Application"("assignedRecruiterId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Application_stage_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Application_stage_idx" ON "Application"("stage");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Application_status_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Application_status_idx" ON "Application"("status");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Application_deletedAt_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Application_deletedAt_idx" ON "Application"("deletedAt");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Application_companyId_applicationCode_key' AND n.nspname = 'public') THEN
        CREATE UNIQUE INDEX "Application_companyId_applicationCode_key" ON "Application"("companyId", "applicationCode");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Interview_companyId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Interview_companyId_idx" ON "Interview"("companyId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Interview_applicationId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Interview_applicationId_idx" ON "Interview"("applicationId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Interview_status_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Interview_status_idx" ON "Interview"("status");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Interview_round_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Interview_round_idx" ON "Interview"("round");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Interview_interviewType_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Interview_interviewType_idx" ON "Interview"("interviewType");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Interview_scheduledDate_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Interview_scheduledDate_idx" ON "Interview"("scheduledDate");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Interview_createdAt_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Interview_createdAt_idx" ON "Interview"("createdAt");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Interview_deletedAt_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Interview_deletedAt_idx" ON "Interview"("deletedAt");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Interview_companyId_interviewCode_key' AND n.nspname = 'public') THEN
        CREATE UNIQUE INDEX "Interview_companyId_interviewCode_key" ON "Interview"("companyId", "interviewCode");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'InterviewInterviewer_interviewId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "InterviewInterviewer_interviewId_idx" ON "InterviewInterviewer"("interviewId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'InterviewInterviewer_interviewerId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "InterviewInterviewer_interviewerId_idx" ON "InterviewInterviewer"("interviewerId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'InterviewInterviewer_interviewId_interviewerId_key' AND n.nspname = 'public') THEN
        CREATE UNIQUE INDEX "InterviewInterviewer_interviewId_interviewerId_key" ON "InterviewInterviewer"("interviewId", "interviewerId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Offer_companyId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Offer_companyId_idx" ON "Offer"("companyId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Offer_applicationId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Offer_applicationId_idx" ON "Offer"("applicationId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Offer_candidateId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Offer_candidateId_idx" ON "Offer"("candidateId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Offer_recruiterId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Offer_recruiterId_idx" ON "Offer"("recruiterId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Offer_status_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Offer_status_idx" ON "Offer"("status");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Offer_deletedAt_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Offer_deletedAt_idx" ON "Offer"("deletedAt");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Offer_offerCode_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Offer_offerCode_idx" ON "Offer"("offerCode");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Offer_createdAt_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Offer_createdAt_idx" ON "Offer"("createdAt");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Offer_updatedAt_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Offer_updatedAt_idx" ON "Offer"("updatedAt");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Offer_companyId_offerCode_version_key' AND n.nspname = 'public') THEN
        CREATE UNIQUE INDEX "Offer_companyId_offerCode_version_key" ON "Offer"("companyId", "offerCode", "version");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'HiringPipeline_applicationId_key' AND n.nspname = 'public') THEN
        CREATE UNIQUE INDEX "HiringPipeline_applicationId_key" ON "HiringPipeline"("applicationId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'HiringPipeline_companyId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "HiringPipeline_companyId_idx" ON "HiringPipeline"("companyId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'HiringPipeline_applicationId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "HiringPipeline_applicationId_idx" ON "HiringPipeline"("applicationId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'HiringPipeline_candidateId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "HiringPipeline_candidateId_idx" ON "HiringPipeline"("candidateId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'HiringPipeline_recruiterId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "HiringPipeline_recruiterId_idx" ON "HiringPipeline"("recruiterId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'HiringPipeline_jobId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "HiringPipeline_jobId_idx" ON "HiringPipeline"("jobId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'HiringPipeline_currentStage_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "HiringPipeline_currentStage_idx" ON "HiringPipeline"("currentStage");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'HiringPipeline_deletedAt_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "HiringPipeline_deletedAt_idx" ON "HiringPipeline"("deletedAt");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'HiringPipeline_createdAt_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "HiringPipeline_createdAt_idx" ON "HiringPipeline"("createdAt");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'HiringPipeline_updatedAt_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "HiringPipeline_updatedAt_idx" ON "HiringPipeline"("updatedAt");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'PipelineHistory_pipelineId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "PipelineHistory_pipelineId_idx" ON "PipelineHistory"("pipelineId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'PipelineHistory_movedById_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "PipelineHistory_movedById_idx" ON "PipelineHistory"("movedById");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'PipelineTimeline_pipelineId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "PipelineTimeline_pipelineId_idx" ON "PipelineTimeline"("pipelineId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'PipelineTimeline_createdById_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "PipelineTimeline_createdById_idx" ON "PipelineTimeline"("createdById");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'ATSScore_candidateId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "ATSScore_candidateId_idx" ON "ATSScore"("candidateId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'ATSScore_jobId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "ATSScore_jobId_idx" ON "ATSScore"("jobId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'JobMatch_candidateId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "JobMatch_candidateId_idx" ON "JobMatch"("candidateId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'JobMatch_jobId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "JobMatch_jobId_idx" ON "JobMatch"("jobId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Job_companyId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Job_companyId_idx" ON "Job"("companyId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Job_departmentId_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Job_departmentId_idx" ON "Job"("departmentId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Job_status_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Job_status_idx" ON "Job"("status");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Job_jobCode_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Job_jobCode_idx" ON "Job"("jobCode");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Job_createdBy_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Job_createdBy_idx" ON "Job"("createdBy");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Job_deletedAt_idx' AND n.nspname = 'public') THEN
        CREATE INDEX "Job_deletedAt_idx" ON "Job"("deletedAt");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'Job_jobCode_key' AND n.nspname = 'public') THEN
        CREATE UNIQUE INDEX "Job_jobCode_key" ON "Job"("jobCode");
    END IF;
END $$;

-- AddForeignKey (Safely check if constraints exist before creating)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Job_companyId_fkey') THEN
        ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Job_departmentId_fkey') THEN
        ALTER TABLE "Job" ADD CONSTRAINT "Job_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Job_createdBy_fkey') THEN
        ALTER TABLE "Job" ADD CONSTRAINT "Job_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'JobRecruiter_jobId_fkey') THEN
        ALTER TABLE "JobRecruiter" ADD CONSTRAINT "JobRecruiter_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'JobRecruiter_recruiterId_fkey') THEN
        ALTER TABLE "JobRecruiter" ADD CONSTRAINT "JobRecruiter_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'JobRecruiter_assignedById_fkey') THEN
        ALTER TABLE "JobRecruiter" ADD CONSTRAINT "JobRecruiter_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'JobSkill_jobId_fkey') THEN
        ALTER TABLE "JobSkill" ADD CONSTRAINT "JobSkill_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'JobSkill_skillId_fkey') THEN
        ALTER TABLE "JobSkill" ADD CONSTRAINT "JobSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Candidate_companyId_fkey') THEN
        ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Candidate_primaryRecruiterId_fkey') THEN
        ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_primaryRecruiterId_fkey" FOREIGN KEY ("primaryRecruiterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Candidate_createdBy_fkey') THEN
        ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Candidate_updatedBy_fkey') THEN
        ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'CandidateSkill_candidateId_fkey') THEN
        ALTER TABLE "CandidateSkill" ADD CONSTRAINT "CandidateSkill_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'CandidateSkill_skillId_fkey') THEN
        ALTER TABLE "CandidateSkill" ADD CONSTRAINT "CandidateSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'CandidateEducation_candidateId_fkey') THEN
        ALTER TABLE "CandidateEducation" ADD CONSTRAINT "CandidateEducation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'CandidateExperience_candidateId_fkey') THEN
        ALTER TABLE "CandidateExperience" ADD CONSTRAINT "CandidateExperience_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'CandidateDocument_candidateId_fkey') THEN
        ALTER TABLE "CandidateDocument" ADD CONSTRAINT "CandidateDocument_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'CandidateDocument_uploadedBy_fkey') THEN
        ALTER TABLE "CandidateDocument" ADD CONSTRAINT "CandidateDocument_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'CandidateNote_candidateId_fkey') THEN
        ALTER TABLE "CandidateNote" ADD CONSTRAINT "CandidateNote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'CandidateNote_authorId_fkey') THEN
        ALTER TABLE "CandidateNote" ADD CONSTRAINT "CandidateNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Tag_companyId_fkey') THEN
        ALTER TABLE "Tag" ADD CONSTRAINT "Tag_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'CandidateTag_candidateId_fkey') THEN
        ALTER TABLE "CandidateTag" ADD CONSTRAINT "CandidateTag_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'CandidateTag_tagId_fkey') THEN
        ALTER TABLE "CandidateTag" ADD CONSTRAINT "CandidateTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'CompanyCandidateCounter_companyId_fkey') THEN
        ALTER TABLE "CompanyCandidateCounter" ADD CONSTRAINT "CompanyCandidateCounter_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Application_companyId_fkey') THEN
        ALTER TABLE "Application" ADD CONSTRAINT "Application_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Application_candidateId_fkey') THEN
        ALTER TABLE "Application" ADD CONSTRAINT "Application_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Application_jobId_fkey') THEN
        ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Application_assignedRecruiterId_fkey') THEN
        ALTER TABLE "Application" ADD CONSTRAINT "Application_assignedRecruiterId_fkey" FOREIGN KEY ("assignedRecruiterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Application_createdBy_fkey') THEN
        ALTER TABLE "Application" ADD CONSTRAINT "Application_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Application_updatedBy_fkey') THEN
        ALTER TABLE "Application" ADD CONSTRAINT "Application_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'CompanyApplicationCounter_companyId_fkey') THEN
        ALTER TABLE "CompanyApplicationCounter" ADD CONSTRAINT "CompanyApplicationCounter_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Interview_companyId_fkey') THEN
        ALTER TABLE "Interview" ADD CONSTRAINT "Interview_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Interview_applicationId_fkey') THEN
        ALTER TABLE "Interview" ADD CONSTRAINT "Interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Interview_cancelledById_fkey') THEN
        ALTER TABLE "Interview" ADD CONSTRAINT "Interview_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Interview_createdBy_fkey') THEN
        ALTER TABLE "Interview" ADD CONSTRAINT "Interview_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Interview_updatedBy_fkey') THEN
        ALTER TABLE "Interview" ADD CONSTRAINT "Interview_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'InterviewInterviewer_interviewId_fkey') THEN
        ALTER TABLE "InterviewInterviewer" ADD CONSTRAINT "InterviewInterviewer_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'InterviewInterviewer_interviewerId_fkey') THEN
        ALTER TABLE "InterviewInterviewer" ADD CONSTRAINT "InterviewInterviewer_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'CompanyInterviewCounter_companyId_fkey') THEN
        ALTER TABLE "CompanyInterviewCounter" ADD CONSTRAINT "CompanyInterviewCounter_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Offer_companyId_fkey') THEN
        ALTER TABLE "Offer" ADD CONSTRAINT "Offer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Offer_applicationId_fkey') THEN
        ALTER TABLE "Offer" ADD CONSTRAINT "Offer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Offer_candidateId_fkey') THEN
        ALTER TABLE "Offer" ADD CONSTRAINT "Offer_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Offer_recruiterId_fkey') THEN
        ALTER TABLE "Offer" ADD CONSTRAINT "Offer_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Offer_approvedBy_fkey') THEN
        ALTER TABLE "Offer" ADD CONSTRAINT "Offer_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'CompanyOfferCounter_companyId_fkey') THEN
        ALTER TABLE "CompanyOfferCounter" ADD CONSTRAINT "CompanyOfferCounter_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'HiringPipeline_companyId_fkey') THEN
        ALTER TABLE "HiringPipeline" ADD CONSTRAINT "HiringPipeline_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'HiringPipeline_applicationId_fkey') THEN
        ALTER TABLE "HiringPipeline" ADD CONSTRAINT "HiringPipeline_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'HiringPipeline_candidateId_fkey') THEN
        ALTER TABLE "HiringPipeline" ADD CONSTRAINT "HiringPipeline_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'HiringPipeline_recruiterId_fkey') THEN
        ALTER TABLE "HiringPipeline" ADD CONSTRAINT "HiringPipeline_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'HiringPipeline_jobId_fkey') THEN
        ALTER TABLE "HiringPipeline" ADD CONSTRAINT "HiringPipeline_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'PipelineHistory_pipelineId_fkey') THEN
        ALTER TABLE "PipelineHistory" ADD CONSTRAINT "PipelineHistory_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "HiringPipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'PipelineHistory_movedById_fkey') THEN
        ALTER TABLE "PipelineHistory" ADD CONSTRAINT "PipelineHistory_movedById_fkey" FOREIGN KEY ("movedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'PipelineTimeline_pipelineId_fkey') THEN
        ALTER TABLE "PipelineTimeline" ADD CONSTRAINT "PipelineTimeline_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "HiringPipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'PipelineTimeline_createdById_fkey') THEN
        ALTER TABLE "PipelineTimeline" ADD CONSTRAINT "PipelineTimeline_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ATSScore_candidateId_fkey') THEN
        ALTER TABLE "ATSScore" ADD CONSTRAINT "ATSScore_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ATSScore_jobId_fkey') THEN
        ALTER TABLE "ATSScore" ADD CONSTRAINT "ATSScore_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'JobMatch_candidateId_fkey') THEN
        ALTER TABLE "JobMatch" ADD CONSTRAINT "JobMatch_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'JobMatch_jobId_fkey') THEN
        ALTER TABLE "JobMatch" ADD CONSTRAINT "JobMatch_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
