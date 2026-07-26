import { Role, PipelineStage } from "@prisma/client";
import {
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
} from "../../../../shared/errors";
import { AuthenticatedUser } from "../../../../shared/types";
import {
  PIPELINE_MESSAGES,
  ALLOWED_SEQUENTIAL_TRANSITIONS,
} from "../../constants/pipeline.constants";
import { pipelineRepository } from "../../repositories/pipeline.repository";
import { PipelineDto } from "../../dto/pipeline.dto";

export function validateCompanyAccess(
  entityCompanyId: string,
  currentUser: AuthenticatedUser
): void {
  if (currentUser.role === Role.SUPER_ADMIN) {
    throw new ForbiddenError(PIPELINE_MESSAGES.FORBIDDEN_ACCESS);
  }
  if (entityCompanyId !== currentUser.companyId) {
    throw new ForbiddenError(PIPELINE_MESSAGES.CROSS_COMPANY_ACCESS);
  }
}

export function enforceWriterRole(currentUser: AuthenticatedUser): void {
  if (currentUser.role !== Role.COMPANY_ADMIN && currentUser.role !== Role.RECRUITER) {
    throw new ForbiddenError(PIPELINE_MESSAGES.FORBIDDEN_ACCESS);
  }
}

export function enforceCompanyAdmin(currentUser: AuthenticatedUser): void {
  if (currentUser.role !== Role.COMPANY_ADMIN) {
    throw new ForbiddenError(PIPELINE_MESSAGES.FORBIDDEN_ACCESS);
  }
}

export async function ensurePipelineExists(
  id: string,
  includeDeleted = false
): Promise<PipelineDto> {
  const pipeline = await pipelineRepository.findPipelineById(id, includeDeleted);
  if (!pipeline) {
    throw new NotFoundError(PIPELINE_MESSAGES.NOT_FOUND);
  }
  return pipeline;
}

export function validatePipelineAccess(
  pipeline: PipelineDto,
  currentUser: AuthenticatedUser
): void {
  if (currentUser.role === Role.SUPER_ADMIN) {
    throw new ForbiddenError(PIPELINE_MESSAGES.FORBIDDEN_ACCESS);
  }
  validateCompanyAccess(pipeline.companyId, currentUser);

  // Recruiter rule: Recruiters can only access and move their assigned candidates
  if (currentUser.role === Role.RECRUITER && pipeline.recruiterId !== currentUser.id) {
    throw new ForbiddenError(PIPELINE_MESSAGES.RECRUITER_OWNERSHIP);
  }
}

export function ensurePipelineNotCompleted(pipeline: PipelineDto): void {
  if (pipeline.isCompleted) {
    throw new ConflictError(PIPELINE_MESSAGES.COMPLETED);
  }
}

export function validateStageTransition(
  currentStage: PipelineStage,
  toStage: PipelineStage,
  isOverride = false
): void {
  if (currentStage === toStage) return;

  if (isOverride) {
    // Overrides can move to any stage
    return;
  }

  const allowed = ALLOWED_SEQUENTIAL_TRANSITIONS[currentStage] || [];
  if (!allowed.includes(toStage)) {
    throw new UnprocessableEntityError(
      `${PIPELINE_MESSAGES.INVALID_TRANSITION}: from ${currentStage} to ${toStage}`
    );
  }
}
