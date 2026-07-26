import { PipelineStage } from "@prisma/client";
import { ALLOWED_SEQUENTIAL_TRANSITIONS, TERMINAL_STAGES } from "../constants/pipeline.constants";
import { UnprocessableEntityError } from "../../../shared/errors";

export const PipelineStateMachine = {
  canTransition(currentStage: PipelineStage, toStage: PipelineStage, isOverride = false): boolean {
    if (currentStage === toStage) return true;
    if (isOverride) return true;

    const allowed = ALLOWED_SEQUENTIAL_TRANSITIONS[currentStage] || [];
    return allowed.includes(toStage);
  },

  throwIfInvalidTransition(
    currentStage: PipelineStage,
    toStage: PipelineStage,
    isOverride = false
  ): void {
    if (!this.canTransition(currentStage, toStage, isOverride)) {
      throw new UnprocessableEntityError(
        `Invalid pipeline stage transition: from ${currentStage} to ${toStage}`
      );
    }
  },

  isTerminalStage(stage: PipelineStage): boolean {
    return TERMINAL_STAGES.includes(stage);
  },

  isCompletedStage(stage: PipelineStage): boolean {
    return TERMINAL_STAGES.includes(stage);
  },

  allowedTransitions(stage: PipelineStage): PipelineStage[] {
    return ALLOWED_SEQUENTIAL_TRANSITIONS[stage] || [];
  },
};
