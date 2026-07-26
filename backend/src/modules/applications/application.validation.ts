import { z } from "zod";
import { ApplicationStage, ApplicationStatus, CandidateSource } from "@prisma/client";

// Core parameter validation
export const applicationIdParamSchema = z.object({
  id: z.string().cuid("Invalid application ID format"),
});

// Create Application Validation Schema
export const createApplicationSchema = z.object({
  candidateId: z.string().cuid("Invalid candidate ID format"),
  jobId: z.string().cuid("Invalid job ID format"),
  assignedRecruiterId: z.string().cuid("Invalid recruiter ID format"),
  source: z.nativeEnum(CandidateSource).optional().nullable(),
  remarks: z
    .string()
    .trim()
    .max(3000, "Remarks cannot exceed 3000 characters")
    .optional()
    .nullable(),
});

// Update Application Validation Schema
export const updateApplicationSchema = z.object({
  remarks: z
    .string()
    .trim()
    .max(3000, "Remarks cannot exceed 3000 characters")
    .optional()
    .nullable(),
});

// Assign Recruiter Validation Schema
export const assignRecruiterSchema = z.object({
  assignedRecruiterId: z.string().cuid("Invalid recruiter ID format"),
});

// Update Stage Validation Schema
export const updateStageSchema = z.object({
  stage: z.nativeEnum(ApplicationStage, {
    message: "Invalid application stage",
  }),
});

// Update Status Validation Schema
export const updateStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus, {
    message: "Invalid application status",
  }),
});

// Reject Application Validation Schema
export const rejectApplicationSchema = z.object({
  rejectionReasonCode: z.string().trim().min(1, "Rejection reason code is required"),
  rejectionReasonNote: z
    .string()
    .trim()
    .max(1000, "Rejection reason note cannot exceed 1000 characters")
    .optional()
    .nullable(),
});

// Withdraw Application Validation Schema
export const withdrawApplicationSchema = z.object({
  withdrawalReasonCode: z.string().trim().min(1, "Withdrawal reason code is required"),
  withdrawalReasonNote: z
    .string()
    .trim()
    .max(1000, "Withdrawal reason note cannot exceed 1000 characters")
    .optional()
    .nullable(),
});

// Query Parameter validation (Filters/Search/Sorting)
export const queryApplicationsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().trim().max(100, "Search query cannot exceed 100 characters").optional(),
  stage: z.nativeEnum(ApplicationStage).optional(),
  status: z.nativeEnum(ApplicationStatus).optional(),
  recruiter: z.string().optional(),
  candidate: z.string().optional(),
  job: z.string().optional(),
  source: z.nativeEnum(CandidateSource).optional(),
  appliedDate: z.string().optional(),
  createdDate: z.string().optional(),
  sortBy: z
    .enum(["appliedAt", "createdAt", "updatedAt", "candidateName", "jobTitle", "stage", "status"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
