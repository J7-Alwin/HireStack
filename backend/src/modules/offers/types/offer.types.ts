import { OfferStatus, Currency, EmploymentType } from "@prisma/client";

export interface CreateOfferInput {
  applicationId: string;
  salary: number;
  currency: Currency;
  employmentType: EmploymentType;
  joiningDate: string;
  expiryDate: string;
  benefits?: string | null;
  notes?: string | null;
  offerLetterUrl?: string | null;
  offerLetterFileName?: string | null;
}

export interface UpdateOfferInput {
  salary?: number;
  currency?: Currency;
  employmentType?: EmploymentType;
  joiningDate?: string;
  expiryDate?: string;
  benefits?: string | null;
  notes?: string | null;
  offerLetterUrl?: string | null;
  offerLetterFileName?: string | null;
}

export interface OfferQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: OfferStatus;
  currency?: Currency;
  employmentType?: EmploymentType;
  recruiterId?: string;
  joiningDate?: string;
  expiryDate?: string;
  createdAt?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
