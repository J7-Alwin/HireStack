import { Role, PipelineStage } from "@prisma/client";
import { ForbiddenError, NotFoundError, ConflictError } from "../../../../shared/errors";
import { AuthenticatedUser } from "../../../../shared/types";
import { PIPELINE_MESSAGES } from "../../constants/pipeline.constants";
import { pipelineRepository } from "../../repositories/pipeline.repository";
import { PipelineDto } from "../../dto/pipeline.dto";
import { PipelineStateMachine } from "../pipeline.state-machine";

export function ensurePipelineBelongsToCompany(
  pipelineCompanyId: string,
  currentUser: AuthenticatedUser
): void {
  if (currentUser.role === Role.SUPER_ADMIN) {
    throw new ForbiddenError(PIPELINE_MESSAGES.FORBIDDEN_ACCESS);
  }
  if (pipelineCompanyId !== currentUser.companyId) {
    throw new ForbiddenError(PIPELINE_MESSAGES.CROSS_COMPANY_ACCESS);
  }
}

export const validateCompanyAccess = ensurePipelineBelongsToCompany;

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

export function ensureRecruiterOwnership(
  pipeline: PipelineDto,
  currentUser: AuthenticatedUser
): void {
  if (currentUser.role === Role.RECRUITER && pipeline.recruiterId !== currentUser.id) {
    throw new ForbiddenError(PIPELINE_MESSAGES.RECRUITER_OWNERSHIP);
  }
}

export function validatePipelineAccess(
  pipeline: PipelineDto,
  currentUser: AuthenticatedUser
): void {
  ensurePipelineBelongsToCompany(pipeline.companyId, currentUser);
  ensureRecruiterOwnership(pipeline, currentUser);
}

export function ensurePipelineNotCompleted(pipeline: PipelineDto): void {
  if (pipeline.isCompleted) {
    throw new ConflictError(PIPELINE_MESSAGES.COMPLETED);
  }
}

export function ensurePipelineActive(pipeline: PipelineDto): void {
  ensurePipelineNotCompleted(pipeline);
  if (pipeline.deletedAt) {
    throw new NotFoundError(PIPELINE_MESSAGES.NOT_FOUND);
  }
}

export function ensurePipelineEditable(
  pipeline: PipelineDto,
  currentUser: AuthenticatedUser
): void {
  validatePipelineAccess(pipeline, currentUser);
  ensurePipelineActive(pipeline);
}

export function ensureStageMovable(
  currentStage: PipelineStage,
  toStage: PipelineStage,
  isOverride = false
): void {
  PipelineStateMachine.throwIfInvalidTransition(currentStage, toStage, isOverride);
}
