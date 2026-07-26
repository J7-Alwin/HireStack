import { PipelineTimelineEventType } from "@prisma/client";

export interface TimelineEventData {
  eventType: PipelineTimelineEventType;
  title: string;
  description: string;
}

export const TimelineFactory = {
  createEvent(
    eventType: PipelineTimelineEventType,
    meta?: {
      notes?: string;
      reason?: string;
      comments?: string;
      round?: string;
      offerCode?: string;
      stage?: string;
    }
  ): TimelineEventData {
    let title: string;
    let description: string;

    switch (eventType) {
      case PipelineTimelineEventType.APPLICATION_SUBMITTED:
        title = "Application Submitted";
        description =
          "The application has been successfully submitted and entered the hiring pipeline.";
        break;
      case PipelineTimelineEventType.CANDIDATE_SHORTLISTED:
        title = meta?.stage === "SCREENING" ? "Screening Commenced" : "Candidate Shortlisted";
        description =
          meta?.stage === "SCREENING"
            ? "Candidate entered the screening stage."
            : "Candidate has been shortlisted for interviews.";
        break;
      case PipelineTimelineEventType.INTERVIEW_SCHEDULED:
        title = `Interview Scheduled (${meta?.round || "Next Round"})`;
        description = `A ${meta?.round || "next round"} interview has been scheduled.`;
        break;
      case PipelineTimelineEventType.INTERVIEW_COMPLETED:
        title = `Interview Completed (${meta?.round || "Next Round"})`;
        description = `The scheduled ${meta?.round || "next round"} interview round has been marked completed.`;
        break;
      case PipelineTimelineEventType.OFFER_PENDING:
        title = "Offer Pending Approval";
        description = "Offer generation initiated and pending approval.";
        break;
      case PipelineTimelineEventType.OFFER_SENT:
        title = "Offer Sent to Candidate";
        description = `The offer letter (${meta?.offerCode || "released"}) has been officially sent out to the candidate.`;
        break;
      case PipelineTimelineEventType.OFFER_ACCEPTED:
        title = "Offer Accepted by Candidate";
        description = `Candidate accepted offer letter (${meta?.offerCode || "released"}).`;
        break;
      case PipelineTimelineEventType.CANDIDATE_HIRED:
        title = "Candidate Hired";
        description = "Hiring process completed successfully. Candidate is hired.";
        break;
      case PipelineTimelineEventType.CANDIDATE_REJECTED:
        title = "Candidate Rejected";
        description = meta?.comments || "Candidate rejected during recruitment process.";
        break;
      case PipelineTimelineEventType.CANDIDATE_WITHDRAWN:
        title = "Application Withdrawn";
        description = meta?.comments || "Candidate has withdrawn their application.";
        break;
      case PipelineTimelineEventType.RECRUITER_ADDED_NOTE:
        title = "Recruiter Note Added";
        description = meta?.notes || "A note was added to the candidate's pipeline.";
        break;
      case PipelineTimelineEventType.STAGE_OVERRIDE:
        title = `Stage Override to ${meta?.stage || "Next Stage"}`;
        description = `Admin stage override: ${meta?.reason || "Reason not provided"}`;
        break;
      default:
        title = "Stage Transitioned";
        description = `Candidate moved to stage: ${meta?.stage || "Next Stage"}`;
        break;
    }

    return { eventType, title, description };
  },
};
