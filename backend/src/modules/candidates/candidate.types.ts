import {
  CandidateStatus,
  Gender,
  EmploymentStatus,
  CandidateSource,
  SkillProficiency,
  DocumentType,
} from "@prisma/client";

export interface CandidateQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  recruiter?: string;
  status?: CandidateStatus;
  employmentStatus?: EmploymentStatus;
  source?: CandidateSource;
  skills?: string[]; // skill IDs
  experienceMin?: number;
  experienceMax?: number;
  tags?: string[]; // tag names or IDs
  createdDate?: string;
  sortBy?: "createdAt" | "updatedAt" | "firstName" | "lastName" | "experienceYears" | "candidateCode" | "currentCompany";
  sortOrder?: "asc" | "desc";
}

export interface CandidateCreateInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  gender?: Gender;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  currentCompany?: string;
  currentDesignation?: string;
  experienceYears?: number;
  experienceMonths?: number;
  expectedSalary?: number;
  currentSalary?: number;
  currency?: string;
  noticePeriod?: number;
  employmentStatus?: EmploymentStatus;
  source?: CandidateSource;
  primaryRecruiterId: string;
}

export interface CandidateUpdateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  gender?: Gender;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  currentCompany?: string;
  currentDesignation?: string;
  experienceYears?: number;
  experienceMonths?: number;
  expectedSalary?: number;
  currentSalary?: number;
  currency?: string;
  noticePeriod?: number;
  employmentStatus?: EmploymentStatus;
  source?: CandidateSource;
  primaryRecruiterId?: string;
  status?: CandidateStatus;
}

export interface CandidateSkillInput {
  skillId: string;
  proficiency?: SkillProficiency;
  experienceYears?: number;
  experienceMonths?: number;
  isPrimary?: boolean;
}

export interface CandidateEducationInput {
  degree: string;
  specialization?: string;
  institution: string;
  university?: string;
  startDate?: string;
  endDate?: string;
  graduationYear?: number;
  grade?: string;
  isHighest?: boolean;
}

export interface CandidateExperienceInput {
  company: string;
  designation: string;
  employmentType?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export interface CandidateDocumentInput {
  fileName: string;
  fileUrl: string;
  fileKey: string;
  fileSize?: number;
  mimeType?: string;
  documentType?: DocumentType;
  isActive?: boolean;
}

export interface CandidateNoteInput {
  content: string;
}

export interface SafeCandidate {
  id: string;
  companyId: string;
  candidateCode: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  alternatePhone: string | null;
  gender: Gender | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  currentCompany: string | null;
  currentDesignation: string | null;
  experienceYears: number | null;
  experienceMonths: number | null;
  expectedSalary: number | null;
  currentSalary: number | null;
  currency: string | null;
  noticePeriod: number | null;
  employmentStatus: EmploymentStatus | null;
  source: CandidateSource | null;
  status: CandidateStatus;
  isActive: boolean;
  deletedAt: Date | null;
  createdBy: string;
  creator: {
    id: string;
    name: string | null;
    email: string;
  };
  primaryRecruiterId: string;
  primaryRecruiter: {
    id: string;
    name: string | null;
    email: string;
    designation: string | null;
  };
  updatedBy: string | null;
  updater: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  skills: Array<{
    proficiency: SkillProficiency;
    experienceYears: number | null;
    experienceMonths: number | null;
    isPrimary: boolean;
    createdAt: Date;
    skill: {
      id: string;
      name: string;
    };
  }>;
  education: Array<{
    id: string;
    degree: string;
    specialization: string | null;
    institution: string;
    university: string | null;
    startDate: Date | null;
    endDate: Date | null;
    graduationYear: number | null;
    grade: string | null;
    isHighest: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
  experience: Array<{
    id: string;
    company: string;
    designation: string;
    employmentType: string | null;
    startDate: Date;
    endDate: Date | null;
    isCurrent: boolean;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
  documents: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileKey: string;
    fileSize: number | null;
    mimeType: string | null;
    documentType: DocumentType;
    isActive: boolean;
    uploadedBy: string;
    createdAt: Date;
  }>;
  notes: Array<{
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    author: {
      id: string;
      name: string | null;
    };
  }>;
  tags: Array<{
    createdAt: Date;
    tag: {
      id: string;
      name: string;
    };
  }>;
  createdAt: Date;
  updatedAt: Date;
}
