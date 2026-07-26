import { OfferStatus, Currency, EmploymentType } from "@prisma/client";

export interface RecruiterDto {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

export interface CandidateDto {
  id: string;
  candidateCode: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
}

export interface JobDto {
  id: string;
  jobCode: string;
  title: string;
}

export interface ApplicationDto {
  id: string;
  applicationCode: string;
  stage: string;
  status: string;
  assignedRecruiterId: string;
  assignedRecruiter: RecruiterDto | null;
  candidate: CandidateDto;
  job: JobDto;
}

export interface OfferDto {
  id: string;
  offerCode: string;
  companyId: string;
  applicationId: string;
  candidateId: string;
  recruiterId: string;
  version: number;
  status: OfferStatus;
  salary: number;
  currency: Currency;
  employmentType: EmploymentType;
  joiningDate: string;
  expiryDate: string;
  benefits: string | null;
  notes: string | null;
  offerLetterUrl: string | null;
  offerLetterFileName: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  sentAt: string | null;
  viewedAt: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  application?: ApplicationDto;
  recruiter?: RecruiterDto;
  approver?: RecruiterDto | null;
}

export interface RawOffer {
  id: string;
  offerCode: string;
  companyId: string;
  applicationId: string;
  candidateId: string;
  recruiterId: string;
  version: number;
  status: OfferStatus;
  salary: { toString(): string } | number;
  currency: Currency;
  employmentType: EmploymentType;
  joiningDate: Date | string;
  expiryDate: Date | string;
  benefits?: string | null;
  notes?: string | null;
  offerLetterUrl?: string | null;
  offerLetterFileName?: string | null;
  approvedBy?: string | null;
  approvedAt?: Date | string | null;
  sentAt?: Date | string | null;
  viewedAt?: Date | string | null;
  respondedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
  application?: {
    id: string;
    applicationCode: string;
    stage: string;
    status: string;
    assignedRecruiterId: string;
    assignedRecruiter?: {
      id: string;
      name: string | null;
      firstName: string | null;
      lastName: string | null;
      email: string;
    } | null;
    candidate: {
      id: string;
      candidateCode: string;
      firstName: string;
      lastName: string;
      email: string | null;
      phone: string | null;
    };
    job: {
      id: string;
      jobCode: string;
      title: string;
    };
  };
  recruiter?: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  approver?: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
}

export function toOfferDto(raw: RawOffer | null | undefined): OfferDto {
  if (!raw) return raw as unknown as OfferDto;

  return {
    id: raw.id,
    offerCode: raw.offerCode,
    companyId: raw.companyId,
    applicationId: raw.applicationId,
    candidateId: raw.candidateId,
    recruiterId: raw.recruiterId,
    version: raw.version,
    status: raw.status,
    salary: typeof raw.salary === "number" ? raw.salary : Number(raw.salary.toString()),
    currency: raw.currency,
    employmentType: raw.employmentType,
    joiningDate: raw.joiningDate instanceof Date ? raw.joiningDate.toISOString() : raw.joiningDate,
    expiryDate: raw.expiryDate instanceof Date ? raw.expiryDate.toISOString() : raw.expiryDate,
    benefits: raw.benefits || null,
    notes: raw.notes || null,
    offerLetterUrl: raw.offerLetterUrl || null,
    offerLetterFileName: raw.offerLetterFileName || null,
    approvedBy: raw.approvedBy || null,
    approvedAt:
      raw.approvedAt instanceof Date ? raw.approvedAt.toISOString() : raw.approvedAt || null,
    sentAt: raw.sentAt instanceof Date ? raw.sentAt.toISOString() : raw.sentAt || null,
    viewedAt: raw.viewedAt instanceof Date ? raw.viewedAt.toISOString() : raw.viewedAt || null,
    respondedAt:
      raw.respondedAt instanceof Date ? raw.respondedAt.toISOString() : raw.respondedAt || null,
    createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : raw.createdAt,
    updatedAt: raw.updatedAt instanceof Date ? raw.updatedAt.toISOString() : raw.updatedAt,
    deletedAt: raw.deletedAt instanceof Date ? raw.deletedAt.toISOString() : raw.deletedAt || null,
    application: raw.application
      ? {
          id: raw.application.id,
          applicationCode: raw.application.applicationCode,
          stage: raw.application.stage,
          status: raw.application.status,
          assignedRecruiterId: raw.application.assignedRecruiterId,
          assignedRecruiter: raw.application.assignedRecruiter
            ? {
                id: raw.application.assignedRecruiter.id,
                name: raw.application.assignedRecruiter.name,
                firstName: raw.application.assignedRecruiter.firstName,
                lastName: raw.application.assignedRecruiter.lastName,
                email: raw.application.assignedRecruiter.email,
              }
            : null,
          candidate: {
            id: raw.application.candidate.id,
            candidateCode: raw.application.candidate.candidateCode,
            firstName: raw.application.candidate.firstName,
            lastName: raw.application.candidate.lastName,
            email: raw.application.candidate.email,
            phone: raw.application.candidate.phone,
          },
          job: {
            id: raw.application.job.id,
            jobCode: raw.application.job.jobCode,
            title: raw.application.job.title,
          },
        }
      : undefined,
    recruiter: raw.recruiter
      ? {
          id: raw.recruiter.id,
          name: raw.recruiter.name,
          firstName: raw.recruiter.firstName,
          lastName: raw.recruiter.lastName,
          email: raw.recruiter.email,
        }
      : undefined,
    approver: raw.approver
      ? {
          id: raw.approver.id,
          name: raw.approver.name,
          firstName: raw.approver.firstName,
          lastName: raw.approver.lastName,
          email: raw.approver.email,
        }
      : null,
  };
}
