import type { AtsBaseQueryParams } from '@/utils/ats'

export type JobStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'OPEN'
  | 'PAUSED'
  | 'CLOSED'
  | 'ARCHIVED'

export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'TEMPORARY'
  | 'INTERNSHIP'

export type WorkplaceType = 'ON_SITE' | 'REMOTE' | 'HYBRID'

export type Visibility = 'INTERNAL' | 'PUBLIC' | 'PRIVATE'

export interface JobDepartment {
  readonly id: string
  readonly name: string
}

export interface JobRecruiterAssignment {
  readonly assignedAt: string
  readonly recruiter: {
    readonly id: string
    readonly email: string
    readonly firstName?: string | null
    readonly lastName?: string | null
    readonly designation?: string | null
    readonly avatar?: string | null
  }
}

export interface JobSkillAssignment {
  readonly skill: {
    readonly id: string
    readonly name: string
  }
}

export interface Job {
  readonly id: string
  readonly companyId: string
  readonly departmentId: string
  readonly department?: JobDepartment
  readonly jobCode: string
  readonly title: string
  readonly description: string
  readonly responsibilities?: string | null
  readonly requirements?: string | null
  readonly benefits?: string | null
  readonly employmentType: EmploymentType
  readonly workplaceType: WorkplaceType
  readonly experienceMin?: number | null
  readonly experienceMax?: number | null
  readonly salaryMin?: number | null
  readonly salaryMax?: number | null
  readonly currency?: string | null
  readonly location?: string | null
  readonly openings: number
  readonly visibility?: Visibility
  readonly status: JobStatus
  readonly closingDate?: string | null
  readonly publishedAt?: string | null
  readonly archivedAt?: string | null
  readonly deletedAt?: string | null
  readonly isActive: boolean
  readonly createdBy: string
  readonly creator?: {
    readonly id: string
    readonly name?: string | null
    readonly email: string
  }
  readonly recruiters?: readonly JobRecruiterAssignment[]
  readonly skills?: readonly JobSkillAssignment[]
  readonly createdAt: string
  readonly updatedAt: string
}

export interface JobFilterParams extends AtsBaseQueryParams {
  readonly department?: string
  readonly departmentId?: string
  readonly status?: JobStatus
  readonly employmentType?: EmploymentType
  readonly workplaceType?: WorkplaceType
  readonly recruiter?: string
  readonly createdDate?: string
  readonly closingDate?: string
}

export interface CreateJobInput {
  readonly title: string
  readonly departmentId: string
  readonly description: string
  readonly responsibilities?: string
  readonly requirements?: string
  readonly benefits?: string
  readonly employmentType: EmploymentType
  readonly workplaceType: WorkplaceType
  readonly experienceMin?: number
  readonly experienceMax?: number
  readonly salaryMin?: number
  readonly salaryMax?: number
  readonly currency?: string
  readonly location?: string
  readonly openings: number
  readonly visibility?: Visibility
  readonly closingDate?: string
  readonly recruiterIds?: readonly string[]
  readonly skillIds?: readonly string[]
}

export type UpdateJobInput = Partial<CreateJobInput>
