import type { AtsBaseQueryParams } from '@/utils/ats'

export type CandidateStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'HIRED'
  | 'REJECTED'
  | 'BLACKLISTED'

export type CandidateSource =
  | 'DIRECT_APPLICATION'
  | 'LINKEDIN'
  | 'REFERRAL'
  | 'AGENCY'
  | 'CAREER_FAIR'
  | 'OTHER'

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'

export type EmploymentStatus =
  | 'EMPLOYED'
  | 'UNEMPLOYED'
  | 'FREELANCER'
  | 'STUDENT'
  | 'NOTICE_PERIOD'

export type SkillProficiency = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'

export type DocumentType = 'RESUME' | 'COVER_LETTER' | 'PORTFOLIO' | 'CERTIFICATE' | 'OTHER'

export interface CandidateSkill {
  readonly candidateId: string
  readonly skillId: string
  readonly proficiency?: SkillProficiency | null
  readonly experienceYears?: number | null
  readonly experienceMonths?: number | null
  readonly isPrimary?: boolean
  readonly createdAt?: string
  readonly skill?: {
    readonly id: string
    readonly name: string
  }
}

export interface CandidateEducation {
  readonly id: string
  readonly candidateId: string
  readonly degree: string
  readonly specialization?: string | null
  readonly institution: string
  readonly university?: string | null
  readonly startDate?: string | null
  readonly endDate?: string | null
  readonly graduationYear?: number | null
  readonly grade?: string | null
  readonly isHighest?: boolean
  readonly createdAt?: string
}

export interface CandidateExperience {
  readonly id: string
  readonly candidateId: string
  readonly company: string
  readonly designation: string
  readonly employmentType?: string | null
  readonly startDate: string
  readonly endDate?: string | null
  readonly isCurrent?: boolean
  readonly description?: string | null
  readonly createdAt?: string
}

export interface CandidateDocument {
  readonly id: string
  readonly candidateId: string
  readonly fileName: string
  readonly fileUrl: string
  readonly fileKey: string
  readonly fileSize?: number | null
  readonly mimeType?: string | null
  readonly documentType?: DocumentType
  readonly isActive?: boolean
  readonly uploadedBy?: string
  readonly createdAt: string
}

export interface CandidateNote {
  readonly id: string
  readonly candidateId: string
  readonly authorId: string
  readonly author?: {
    readonly id: string
    readonly name: string | null
  }
  readonly content: string
  readonly createdAt: string
  readonly updatedAt?: string
}

export interface CandidateTag {
  readonly candidateId: string
  readonly tagId: string
  readonly createdAt?: string
  readonly tag?: {
    readonly id: string
    readonly name: string
  }
}

export interface Candidate {
  readonly id: string
  readonly companyId: string
  readonly candidateCode: string
  readonly firstName: string
  readonly lastName: string
  readonly email: string | null
  readonly phone: string | null
  readonly alternatePhone?: string | null
  readonly gender?: Gender | null
  readonly address?: string | null
  readonly city?: string | null
  readonly state?: string | null
  readonly country?: string | null
  readonly zipCode?: string | null
  readonly currentCompany?: string | null
  readonly currentDesignation?: string | null
  readonly experienceYears?: number | null
  readonly experienceMonths?: number | null
  readonly expectedSalary?: number | null
  readonly currentSalary?: number | null
  readonly currency?: string | null
  readonly noticePeriod?: number | null
  readonly employmentStatus?: EmploymentStatus | null
  readonly source?: CandidateSource | null
  readonly linkedInUrl?: string | null
  readonly githubUrl?: string | null
  readonly portfolioUrl?: string | null
  readonly status: CandidateStatus
  readonly isActive: boolean
  readonly deletedAt?: string | null
  readonly primaryRecruiterId: string
  readonly primaryRecruiter?: {
    readonly id: string
    readonly name: string | null
    readonly email: string
    readonly designation?: string | null
  }
  readonly creator?: {
    readonly id: string
    readonly name: string | null
    readonly email: string
  }
  readonly skills?: readonly CandidateSkill[]
  readonly education?: readonly CandidateEducation[]
  readonly experience?: readonly CandidateExperience[]
  readonly documents?: readonly CandidateDocument[]
  readonly notes?: readonly CandidateNote[]
  readonly tags?: readonly CandidateTag[]
  readonly createdAt: string
  readonly updatedAt: string
}

export interface CandidateFilterParams extends AtsBaseQueryParams {
  readonly status?: CandidateStatus
  readonly source?: CandidateSource
  readonly employmentStatus?: EmploymentStatus
  readonly recruiter?: string
  readonly recruiterId?: string
  readonly showDeleted?: boolean
}

export interface CreateCandidateInput {
  readonly firstName: string
  readonly lastName: string
  readonly email?: string | null
  readonly phone?: string | null
  readonly alternatePhone?: string | null
  readonly gender?: Gender | null
  readonly address?: string | null
  readonly city?: string | null
  readonly state?: string | null
  readonly country?: string | null
  readonly zipCode?: string | null
  readonly currentCompany?: string | null
  readonly currentDesignation?: string | null
  readonly experienceYears?: number | null
  readonly experienceMonths?: number | null
  readonly expectedSalary?: number | null
  readonly currentSalary?: number | null
  readonly currency?: string | null
  readonly noticePeriod?: number | null
  readonly employmentStatus?: EmploymentStatus | null
  readonly source?: CandidateSource | null
  readonly linkedInUrl?: string | null
  readonly githubUrl?: string | null
  readonly portfolioUrl?: string | null
  readonly primaryRecruiterId: string
}

export type UpdateCandidateInput = Partial<CreateCandidateInput> & {
  readonly status?: CandidateStatus
}
