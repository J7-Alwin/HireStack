import { PipelineStage } from "@prisma/client";

export interface CreatePipelineInput {
  applicationId: string;
  notes?: string | null;
}

export interface MoveStageInput {
  toStage: PipelineStage;
  reason?: string;
  comments?: string;
  isOverride?: boolean;
}

export interface AddNotesInput {
  notes: string;
}

export interface PipelineQueryFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  currentStage?: PipelineStage;
  recruiterId?: string;
  departmentId?: string;
  jobId?: string;
  candidateId?: string;
  completed?: boolean;
  active?: boolean;
  hired?: boolean;
  rejected?: boolean;
  withdrawn?: boolean;
  startDate?: string;
  endDate?: string;
}
