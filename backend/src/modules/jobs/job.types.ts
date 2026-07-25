import { EmploymentType, WorkplaceType, JobStatus, Visibility } from "@prisma/client";

export interface JobQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: JobStatus;
  employmentType?: EmploymentType;
  workplaceType?: WorkplaceType;
  recruiter?: string; // recruiter userId
  createdDate?: string; // ISO date string
  closingDate?: string; // ISO date string
  sortBy?: "createdAt" | "updatedAt" | "closingDate";
  sortOrder?: "asc" | "desc";
}

export interface JobCreateInput {
  title: string;
  departmentId: string;
  description: string;
  responsibilities?: string;
  requirements?: string;
  benefits?: string;
  employmentType: EmploymentType;
  workplaceType: WorkplaceType;
  experienceMin?: number;
  experienceMax?: number;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  location?: string;
  openings: number;
  visibility?: Visibility;
  closingDate?: Date;
  recruiterIds?: string[];
  skillIds?: string[];
}

export interface JobUpdateInput {
  title?: string;
  description?: string;
  responsibilities?: string;
  requirements?: string;
  benefits?: string;
  employmentType?: EmploymentType;
  workplaceType?: WorkplaceType;
  experienceMin?: number;
  experienceMax?: number;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  location?: string;
  openings?: number;
  visibility?: Visibility;
  closingDate?: Date;
  departmentId?: string;
  recruiterIds?: string[];
  skillIds?: string[];
}

export interface SafeJob {
  id: string;
  companyId: string;
  departmentId: string;
  department: {
    id: string;
    name: string;
  };
  jobCode: string;
  title: string;
  description: string;
  responsibilities: string | null;
  requirements: string | null;
  benefits: string | null;
  employmentType: EmploymentType;
  workplaceType: WorkplaceType;
  experienceMin: number | null;
  experienceMax: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  location: string | null;
  openings: number;
  visibility: Visibility;
  status: JobStatus;
  closingDate: Date | null;
  publishedAt: Date | null;
  archivedAt: Date | null;
  deletedAt: Date | null;
  isActive: boolean;
  createdBy: string;
  creator: {
    id: string;
    name: string | null;
    email: string;
  };
  recruiters: Array<{
    assignedAt: Date;
    recruiter: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      designation: string | null;
      avatar: string | null;
    };
  }>;
  skills: Array<{
    skill: {
      id: string;
      name: string;
    };
  }>;
  createdAt: Date;
  updatedAt: Date;
}

