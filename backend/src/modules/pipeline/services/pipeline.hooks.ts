import { PipelineStage } from "@prisma/client";
import { logger } from "../../../shared/logger/logger";
import { PipelineDto } from "../dto/pipeline.dto";

export const pipelineHooks = {
  onPipelineCreated: async (pipeline: PipelineDto, userId: string): Promise<void> => {
    logger.info("Pipeline Created Hook", {
      event: "PipelineCreated",
      pipelineId: pipeline.id,
      applicationId: pipeline.applicationId,
      companyId: pipeline.companyId,
      recruiterId: pipeline.recruiterId,
      userId,
      status: pipeline.currentStage,
      timestamp: new Date().toISOString(),
    });
  },

  onStageMoved: async (
    pipeline: PipelineDto,
    fromStage: PipelineStage | null,
    toStage: PipelineStage,
    userId: string
  ): Promise<void> => {
    logger.info("Pipeline Stage Moved Hook", {
      event: "PipelineStageMoved",
      pipelineId: pipeline.id,
      applicationId: pipeline.applicationId,
      companyId: pipeline.companyId,
      recruiterId: pipeline.recruiterId,
      userId,
      previousStage: fromStage,
      currentStage: toStage,
      timestamp: new Date().toISOString(),
    });
  },

  onPipelineCompleted: async (
    pipeline: PipelineDto,
    completedReason: string,
    userId: string
  ): Promise<void> => {
    logger.info("Pipeline Completed Hook", {
      event: "PipelineCompleted",
      pipelineId: pipeline.id,
      applicationId: pipeline.applicationId,
      companyId: pipeline.companyId,
      recruiterId: pipeline.recruiterId,
      userId,
      completedReason,
      status: pipeline.currentStage,
      timestamp: new Date().toISOString(),
    });
  },
};
