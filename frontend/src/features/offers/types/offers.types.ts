import type { AtsBaseQueryParams } from '@/utils/ats'

export type OfferStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SENT'
  | 'VIEWED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'WITHDRAWN'

export type OfferCurrency =
  | 'INR'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'AED'
  | 'SGD'

export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERN'
  | 'TEMPORARY'
  | 'FREELANCE'

export interface OfferCandidateInfo {
  readonly id: string
  readonly candidateCode?: string
  readonly firstName: string
  readonly lastName: string
  readonly email?: string | null
  readonly phone?: string | null
}
export type OfferCandidate = OfferCandidateInfo

export interface OfferJobInfo {
  readonly id: string
  readonly jobCode?: string
  readonly title: string
}
export type OfferJob = OfferJobInfo

export interface OfferRecruiterInfo {
  readonly id: string
  readonly name?: string | null
  readonly firstName?: string | null
  readonly lastName?: string | null
  readonly email: string
}

export interface OfferApplicationInfo {
  readonly id: string
  readonly applicationCode: string
  readonly stage: string
  readonly status: string
  readonly assignedRecruiterId?: string | null
  readonly assignedRecruiter?: OfferRecruiterInfo | null
  readonly candidate: OfferCandidateInfo
  readonly job: OfferJobInfo
}
export type OfferApplication = OfferApplicationInfo

export interface Offer {
  readonly id: string
  readonly offerCode: string
  readonly companyId: string
  readonly applicationId: string
  readonly candidateId: string
  readonly recruiterId: string
  readonly version: number
  readonly status: OfferStatus
  readonly salary: number
  readonly currency: OfferCurrency
  readonly employmentType: EmploymentType
  readonly joiningDate: string
  readonly expiryDate: string
  readonly benefits?: string | null
  readonly notes?: string | null
  readonly offerLetterUrl?: string | null
  readonly offerLetterFileName?: string | null
  readonly approvedBy?: string | null
  readonly approvedAt?: string | null
  readonly sentAt?: string | null
  readonly viewedAt?: string | null
  readonly respondedAt?: string | null
  readonly createdAt: string
  readonly updatedAt: string
  readonly deletedAt?: string | null
  readonly application?: OfferApplicationInfo
  readonly recruiter?: OfferRecruiterInfo
  readonly approver?: OfferRecruiterInfo | null
}

export interface OfferFilterParams extends AtsBaseQueryParams {
  readonly status?: OfferStatus
  readonly currency?: OfferCurrency
  readonly employmentType?: EmploymentType
  readonly recruiterId?: string
  readonly joiningDate?: string
  readonly expiryDate?: string
  readonly createdAt?: string
  readonly sortBy?: string
  readonly sortOrder?: 'asc' | 'desc'
}

export interface CreateOfferInput {
  readonly applicationId: string
  readonly salary: number
  readonly currency: OfferCurrency
  readonly employmentType: EmploymentType
  readonly joiningDate: string
  readonly expiryDate: string
  readonly benefits?: string | null
  readonly notes?: string | null
  readonly offerLetterUrl?: string | null
  readonly offerLetterFileName?: string | null
}

export interface UpdateOfferInput {
  readonly salary?: number
  readonly currency?: OfferCurrency
  readonly employmentType?: EmploymentType
  readonly joiningDate?: string
  readonly expiryDate?: string
  readonly benefits?: string | null
  readonly notes?: string | null
  readonly offerLetterUrl?: string | null
  readonly offerLetterFileName?: string | null
}

export interface OfferListResponse {
  readonly data: readonly Offer[]
  readonly meta?: {
    readonly total: number
    readonly totalPages: number
    readonly page: number
    readonly limit: number
  }
}
