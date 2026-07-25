import { z } from "zod";
import {
  CandidateStatus,
  Gender,
  EmploymentStatus,
  CandidateSource,
  SkillProficiency,
  DocumentType,
} from "@prisma/client";

// Zod enums
const genderSchema = z.nativeEnum(Gender, {
  message: "Invalid gender value",
});

const employmentStatusSchema = z.nativeEnum(EmploymentStatus, {
  message: "Invalid employment status value",
});

const candidateSourceSchema = z.nativeEnum(CandidateSource, {
  message: "Invalid candidate source value",
});

const candidateStatusSchema = z.nativeEnum(CandidateStatus, {
  message: "Invalid candidate status value",
});

const skillProficiencySchema = z.nativeEnum(SkillProficiency, {
  message: "Invalid skill proficiency value",
});

const documentTypeSchema = z.nativeEnum(DocumentType, {
  message: "Invalid document type value",
});

// Common fields
const nameSchema = z.string().trim().min(1, "Name cannot be empty").max(100);
const emailSchema = z.string().trim().email("Invalid email address").toLowerCase().max(255);
const phoneSchema = z.string().trim().min(3, "Phone number too short").max(20);

// Candidate Creation
export const createCandidateSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema.optional().nullable(),
    phone: phoneSchema.optional().nullable(),
    alternatePhone: phoneSchema.optional().nullable(),
    gender: genderSchema.optional().nullable(),
    address: z.string().trim().max(500).optional().nullable(),
    city: z.string().trim().max(100).optional().nullable(),
    state: z.string().trim().max(100).optional().nullable(),
    country: z.string().trim().max(100).optional().nullable(),
    zipCode: z.string().trim().max(20).optional().nullable(),
    currentCompany: z.string().trim().max(200).optional().nullable(),
    currentDesignation: z.string().trim().max(200).optional().nullable(),
    experienceYears: z.number().int().nonnegative().optional().nullable(),
    experienceMonths: z.number().int().min(0).max(11).optional().nullable(),
    expectedSalary: z.number().nonnegative().optional().nullable(),
    currentSalary: z.number().nonnegative().optional().nullable(),
    currency: z.string().trim().max(10).optional().nullable(),
    noticePeriod: z.number().int().nonnegative().optional().nullable(),
    employmentStatus: employmentStatusSchema.optional().nullable(),
    source: candidateSourceSchema.optional().nullable(),
    primaryRecruiterId: z.string().cuid("Invalid recruiter ID format"),
  })
  .refine((data) => data.email || data.phone, {
    message: "At least email or phone number is required to register a candidate",
    path: ["email"],
  });

// Candidate Update
export const updateCandidateSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema.optional().nullable(),
  phone: phoneSchema.optional().nullable(),
  alternatePhone: phoneSchema.optional().nullable(),
  gender: genderSchema.optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().max(100).optional().nullable(),
  country: z.string().trim().max(100).optional().nullable(),
  zipCode: z.string().trim().max(20).optional().nullable(),
  currentCompany: z.string().trim().max(200).optional().nullable(),
  currentDesignation: z.string().trim().max(200).optional().nullable(),
  experienceYears: z.number().int().nonnegative().optional().nullable(),
  experienceMonths: z.number().int().min(0).max(11).optional().nullable(),
  expectedSalary: z.number().nonnegative().optional().nullable(),
  currentSalary: z.number().nonnegative().optional().nullable(),
  currency: z.string().trim().max(10).optional().nullable(),
  noticePeriod: z.number().int().nonnegative().optional().nullable(),
  employmentStatus: employmentStatusSchema.optional().nullable(),
  source: candidateSourceSchema.optional().nullable(),
  primaryRecruiterId: z.string().cuid("Invalid recruiter ID format").optional(),
  status: candidateStatusSchema.optional(),
});

// Candidate Skill
export const candidateSkillSchema = z.object({
  skillId: z.string().cuid("Invalid skill ID"),
  proficiency: skillProficiencySchema.optional(),
  experienceYears: z.number().int().nonnegative().optional().nullable(),
  experienceMonths: z.number().int().min(0).max(11).optional().nullable(),
  isPrimary: z.boolean().optional(),
});

// Candidate Education
export const candidateEducationSchema = z
  .object({
    degree: z.string().trim().min(1, "Degree cannot be empty").max(200),
    specialization: z.string().trim().max(200).optional().nullable(),
    institution: z.string().trim().min(1, "Institution cannot be empty").max(200),
    university: z.string().trim().max(200).optional().nullable(),
    startDate: z.string().datetime({ message: "Invalid ISO datetime string" }).optional().nullable(),
    endDate: z.string().datetime({ message: "Invalid ISO datetime string" }).optional().nullable(),
    graduationYear: z.number().int().min(1900).max(2100).optional().nullable(),
    grade: z.string().trim().max(50).optional().nullable(),
    isHighest: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: "Start date must be before or equal to end date",
      path: ["endDate"],
    }
  );

// Candidate Experience
export const candidateExperienceSchema = z
  .object({
    company: z.string().trim().min(1, "Company name cannot be empty").max(200),
    designation: z.string().trim().min(1, "Designation cannot be empty").max(200),
    employmentType: z.string().trim().max(100).optional().nullable(),
    startDate: z.string().datetime({ message: "Invalid ISO datetime string" }),
    endDate: z.string().datetime({ message: "Invalid ISO datetime string" }).optional().nullable(),
    isCurrent: z.boolean().optional(),
    description: z.string().trim().max(2000).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: "Start date must be before or equal to end date",
      path: ["endDate"],
    }
  );

// Candidate Document
export const candidateDocumentSchema = z.object({
  fileName: z.string().trim().min(1, "File name cannot be empty").max(255),
  fileUrl: z.string().trim().url("Invalid file URL"),
  fileKey: z.string().trim().min(1, "File key cannot be empty"),
  fileSize: z.number().int().nonnegative().optional().nullable(),
  mimeType: z.string().trim().max(100).optional().nullable(),
  documentType: documentTypeSchema.optional(),
  isActive: z.boolean().optional(),
});

// Candidate Note
export const candidateNoteSchema = z.object({
  content: z.string().trim().min(1, "Note content cannot be empty").max(5000),
});

// Tag Assignment
export const candidateTagSchema = z.object({
  name: z.string().trim().min(1, "Tag name cannot be empty").max(50).toLowerCase(),
});

// Query Parameter validation (Filters/Search/Sorting)
export const queryCandidatesSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  recruiter: z.string().optional(),
  status: z.nativeEnum(CandidateStatus).optional(),
  employmentStatus: z.nativeEnum(EmploymentStatus).optional(),
  source: z.nativeEnum(CandidateSource).optional(),
  skills: z.preprocess(
    (val) => (typeof val === "string" ? val.split(",") : val),
    z.array(z.string()).optional()
  ),
  experienceMin: z.coerce.number().optional(),
  experienceMax: z.coerce.number().optional(),
  tags: z.preprocess(
    (val) => (typeof val === "string" ? val.split(",") : val),
    z.array(z.string()).optional()
  ),
  createdDate: z.string().optional(),
  sortBy: z
    .enum([
      "createdAt",
      "updatedAt",
      "firstName",
      "lastName",
      "experienceYears",
      "candidateCode",
      "currentCompany",
    ])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// ID Parameters
export const candidateIdParamSchema = z.object({
  id: z.string().cuid("Invalid candidate ID format"),
});

export const candidateSkillParamSchema = z.object({
  id: z.string().cuid("Invalid candidate ID format"),
  skillId: z.string().cuid("Invalid skill ID format"),
});

export const candidateEducationParamSchema = z.object({
  id: z.string().cuid("Invalid candidate ID format"),
  educationId: z.string().cuid("Invalid education ID format"),
});

export const candidateExperienceParamSchema = z.object({
  id: z.string().cuid("Invalid candidate ID format"),
  experienceId: z.string().cuid("Invalid experience ID format"),
});

export const candidateDocumentParamSchema = z.object({
  id: z.string().cuid("Invalid candidate ID format"),
  documentId: z.string().cuid("Invalid document ID format"),
});

export const candidateNoteParamSchema = z.object({
  id: z.string().cuid("Invalid candidate ID format"),
  noteId: z.string().cuid("Invalid note ID format"),
});

export const candidateTagParamSchema = z.object({
  id: z.string().cuid("Invalid candidate ID format"),
  tagId: z.string().cuid("Invalid tag ID format"),
});
