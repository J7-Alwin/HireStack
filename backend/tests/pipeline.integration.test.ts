import "dotenv/config";
import { prisma } from "../src/config/prisma";
import { ZodError } from "zod";
import { pipelineService } from "../src/modules/pipeline/services/pipeline.service";
import { applicationService } from "../src/modules/applications/application.service";
import { Role, PipelineStage, PipelineTimelineEventType } from "@prisma/client";
import { AuthenticatedUser } from "../src/shared/types";
import { ForbiddenError, UnprocessableEntityError, NotFoundError } from "../src/shared/errors";

// Helper assertions
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function assertThrows(
  fn: () => Promise<unknown>,
  errorClass: new (...args: never[]) => Error,
  expectedMessage?: string
) {
  let threw = false;
  let caughtError: unknown;
  try {
    await fn();
  } catch (err: unknown) {
    threw = true;
    caughtError = err;
  }

  if (!threw) {
    throw new Error(`Expected function to throw ${errorClass.name} but it succeeded`);
  }

  const err = caughtError as Error & { constructor: { name: string } };

  if (err.constructor.name !== errorClass.name && !(err instanceof errorClass)) {
    throw new Error(
      `Expected error of type ${errorClass.name}, but got ${err.constructor.name}: ${err.message}`
    );
  }
  if (expectedMessage && !err.message.includes(expectedMessage)) {
    throw new Error(
      `Expected error message to contain "${expectedMessage}", but got "${err.message}"`
    );
  }
}

async function runTests() {
  console.log("🚀 Starting Hiring Pipeline Module Integration Tests...\n");

  // 1. Setup Test Data
  console.log("📦 Seeding test database entities...");

  const companyA = await prisma.company.create({
    data: { name: `Test Pipe Company A ${Date.now()}` },
  });
  const companyB = await prisma.company.create({
    data: { name: `Test Pipe Company B ${Date.now()}` },
  });

  const deptA = await prisma.department.create({
    data: { name: "Engineering A", companyId: companyA.id },
  });

  const adminAUser = await prisma.user.create({
    data: {
      email: `admin.pipe.a.${Date.now()}@test.com`,
      password: "HashPassword123!",
      role: Role.COMPANY_ADMIN,
      companyId: companyA.id,
      departmentId: deptA.id,
      isActive: true,
    },
  });

  const recruiterAUser = await prisma.user.create({
    data: {
      email: `rec1.pipe.a.${Date.now()}@test.com`,
      password: "HashPassword123!",
      role: Role.RECRUITER,
      companyId: companyA.id,
      departmentId: deptA.id,
      isActive: true,
    },
  });

  const recruiterBUser = await prisma.user.create({
    data: {
      email: `rec.pipe.b.${Date.now()}@test.com`,
      password: "HashPassword123!",
      role: Role.RECRUITER,
      companyId: companyB.id,
      isActive: true,
    },
  });

  const candidateA = await prisma.candidate.create({
    data: {
      candidateCode: `CAND-${Date.now()}`,
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@test.com",
      companyId: companyA.id,
      primaryRecruiterId: recruiterAUser.id,
      createdBy: adminAUser.id,
    },
  });

  const jobA = await prisma.job.create({
    data: {
      jobCode: `JOB-${Date.now()}`,
      title: "Senior Backend Developer",
      description: "We are looking for a Senior Backend Developer...",
      employmentType: "FULL_TIME",
      workplaceType: "HYBRID",
      companyId: companyA.id,
      departmentId: deptA.id,
      createdBy: adminAUser.id,
      status: "OPEN",
      openings: 2,
    },
  });

  const adminAContext: AuthenticatedUser = {
    id: adminAUser.id,
    email: adminAUser.email,
    role: Role.COMPANY_ADMIN,
    companyId: companyA.id,
  };

  const recruiterAContext: AuthenticatedUser = {
    id: recruiterAUser.id,
    email: recruiterAUser.email,
    role: Role.RECRUITER,
    companyId: companyA.id,
  };

  const recruiterBContext: AuthenticatedUser = {
    id: recruiterBUser.id,
    email: recruiterBUser.email,
    role: Role.RECRUITER,
    companyId: companyB.id,
  };

  console.log("   -> Seed successful.");

  // Test Case 1: Automatic Pipeline Creation on Application Submission
  console.log("\n🧪 Test Case 1: Automatic Pipeline Creation on Application Submission");
  const application = await applicationService.createApplication(
    {
      candidateId: candidateA.id,
      jobId: jobA.id,
      assignedRecruiterId: recruiterAUser.id,
      remarks: "Highly recommended candidate.",
    },
    recruiterAContext
  );

  assert(application.id !== undefined, "Application creation should return valid ID");

  // Verify pipeline, history and timeline entries were created
  const pipeline = await pipelineService.listPipelines({}, recruiterAContext);
  assert(pipeline.data.length === 1, "Pipeline should be automatically created");

  const pipelineItem = pipeline.data[0];
  assert(
    pipelineItem.applicationId === application.id,
    "Pipeline should match created application"
  );
  assert(
    pipelineItem.currentStage === PipelineStage.APPLIED,
    "Pipeline initial stage should be APPLIED"
  );

  const history = await pipelineService.getHistory(pipelineItem.id, recruiterAContext);
  assert(history.length === 1, "History record should exist");
  assert(history[0].toStage === PipelineStage.APPLIED, "History target should be APPLIED");

  const timeline = await pipelineService.getTimeline(pipelineItem.id, recruiterAContext);
  assert(timeline.length === 1, "Timeline event should exist");
  assert(
    timeline[0].eventType === PipelineTimelineEventType.APPLICATION_SUBMITTED,
    "Timeline event should be APPLICATION_SUBMITTED"
  );
  console.log("   -> Success!");

  // Test Case 2: Recruiter Sequential Stage Movement
  console.log("\n🧪 Test Case 2: Recruiter Sequential Stage Movement");
  const movedPipeline = await pipelineService.moveStage(
    pipelineItem.id,
    {
      toStage: PipelineStage.SCREENING,
      comments: "Screening candidate resume.",
    },
    recruiterAContext
  );
  assert(
    movedPipeline.currentStage === PipelineStage.SCREENING,
    "Stage should transition to SCREENING"
  );
  assert(movedPipeline.previousStage === PipelineStage.APPLIED, "Previous stage should be APPLIED");

  const historyAfterMove = await pipelineService.getHistory(pipelineItem.id, recruiterAContext);
  assert(historyAfterMove.length === 2, "Should have 2 history records");
  assert(historyAfterMove[0].fromStage === PipelineStage.APPLIED, "Transition from APPLIED");
  assert(historyAfterMove[0].toStage === PipelineStage.SCREENING, "Transition to SCREENING");

  const timelineAfterMove = await pipelineService.getTimeline(pipelineItem.id, recruiterAContext);
  assert(timelineAfterMove.length === 2, "Should have 2 timeline events");
  console.log("   -> Success!");

  // Test Case 3: Invalid Recruiter Jump (Non-sequential)
  console.log("\n🧪 Test Case 3: Invalid Recruiter Jump (Non-sequential)");
  await assertThrows(
    () =>
      pipelineService.moveStage(
        pipelineItem.id,
        { toStage: PipelineStage.OFFER_SENT },
        recruiterAContext
      ),
    UnprocessableEntityError,
    "Invalid pipeline stage transition"
  );
  console.log("   -> Success!");

  // Test Case 4: Admin Override Stage Movement (Bypass sequence)
  console.log("\n🧪 Test Case 4: Admin Override Stage Movement (Bypass sequence)");
  // Must fail if reason is missing or too short
  await assertThrows(
    () =>
      pipelineService.moveStage(
        pipelineItem.id,
        {
          toStage: PipelineStage.OFFER_SENT,
          isOverride: true,
          reason: "short", // too short (required 10 chars)
        },
        adminAContext
      ),
    ZodError
  );

  // Succeeds with valid override reason
  const overriddenPipeline = await pipelineService.moveStage(
    pipelineItem.id,
    {
      toStage: PipelineStage.OFFER_SENT,
      isOverride: true,
      reason: "Bypassing intermediate interviews due to strong client recommendation.",
    },
    adminAContext
  );
  assert(
    overriddenPipeline.currentStage === PipelineStage.OFFER_SENT,
    "Stage overridden to OFFER_SENT"
  );

  const timelineAfterOverride = await pipelineService.getTimeline(
    pipelineItem.id,
    recruiterAContext
  );
  assert(timelineAfterOverride.length === 3, "Timeline updated");
  assert(
    timelineAfterOverride[0].eventType === PipelineTimelineEventType.STAGE_OVERRIDE,
    "Timeline log matches override"
  );
  console.log("   -> Success!");

  // Test Case 5: Cross-Company Access Validation
  console.log("\n🧪 Test Case 5: Cross-Company Access Validation");
  await assertThrows(
    () => pipelineService.getPipelineById(pipelineItem.id, recruiterBContext),
    ForbiddenError,
    "Cross-company access is forbidden"
  );
  console.log("   -> Success!");

  // Test Case 6: Recruiter Ownership Constraints
  console.log("\n🧪 Test Case 6: Recruiter Ownership Constraints");
  // Recruiter from same company but NOT assigned cannot move candidate
  const recruiterA2User = await prisma.user.create({
    data: {
      email: `rec2.pipe.a.${Date.now()}@test.com`,
      password: "HashPassword123!",
      role: Role.RECRUITER,
      companyId: companyA.id,
      departmentId: deptA.id,
      isActive: true,
    },
  });
  const recruiterA2Context: AuthenticatedUser = {
    id: recruiterA2User.id,
    email: recruiterA2User.email,
    role: Role.RECRUITER,
    companyId: companyA.id,
  };

  await assertThrows(
    () =>
      pipelineService.moveStage(
        pipelineItem.id,
        { toStage: PipelineStage.OFFER_ACCEPTED },
        recruiterA2Context
      ),
    ForbiddenError,
    "Recruiters can only access and move their assigned candidates"
  );
  console.log("   -> Success!");

  // Test Case 7: Dashboard Metrics Aggregation
  console.log("\n🧪 Test Case 7: Dashboard Metrics Aggregation");
  const dashboard = await pipelineService.getDashboardSummary(recruiterAContext);
  assert(dashboard.activeCandidates === 1, "Should count 1 active candidate");
  assert(
    dashboard.stageBreakdown[PipelineStage.OFFER_SENT] === 1,
    "Should count 1 in OFFER_SENT stage"
  );
  console.log("   -> Success!");

  // Test Case 8: Adding Notes
  console.log("\n🧪 Test Case 8: Adding Notes");
  const notedPipeline = await pipelineService.addNotes(
    pipelineItem.id,
    { notes: "Candidate prefers hybrid work model." },
    recruiterAContext
  );
  assert(notedPipeline.notes === "Candidate prefers hybrid work model.", "Notes should be updated");

  const timelineAfterNotes = await pipelineService.getTimeline(pipelineItem.id, recruiterAContext);
  assert(
    timelineAfterNotes[0].eventType === PipelineTimelineEventType.RECRUITER_ADDED_NOTE,
    "Timeline updated with notes log"
  );
  console.log("   -> Success!");

  // Test Case 9: Soft Delete & Query Exclusion
  console.log("\n🧪 Test Case 9: Soft Delete & Query Exclusion");
  await pipelineService.softDeletePipeline(pipelineItem.id, adminAContext);

  // Verify list excludes deleted
  const listAfterDelete = await pipelineService.listPipelines({}, recruiterAContext);
  assert(
    listAfterDelete.data.length === 0,
    "Soft-deleted pipeline must be excluded from default query"
  );

  // Verify directly fetching throws NotFound
  await assertThrows(
    () => pipelineService.getPipelineById(pipelineItem.id, recruiterAContext),
    NotFoundError,
    "Hiring pipeline not found"
  );
  console.log("   -> Success!");

  // Cleanup Test Data
  console.log("\n🧹 Cleaning up seeded test database records...");
  await prisma.pipelineTimeline.deleteMany({
    where: { pipelineId: pipelineItem.id },
  });
  await prisma.pipelineHistory.deleteMany({
    where: { pipelineId: pipelineItem.id },
  });
  await prisma.hiringPipeline.deleteMany({
    where: { companyId: { in: [companyA.id, companyB.id] } },
  });
  await prisma.application.deleteMany({
    where: { companyId: { in: [companyA.id, companyB.id] } },
  });
  await prisma.candidate.deleteMany({
    where: { companyId: { in: [companyA.id, companyB.id] } },
  });
  await prisma.job.deleteMany({
    where: { companyId: { in: [companyA.id, companyB.id] } },
  });
  await prisma.user.deleteMany({
    where: { companyId: { in: [companyA.id, companyB.id] } },
  });
  await prisma.department.deleteMany({
    where: { companyId: { in: [companyA.id, companyB.id] } },
  });
  await prisma.company.deleteMany({
    where: { id: { in: [companyA.id, companyB.id] } },
  });
  console.log("🧹 Cleanup Complete.");

  console.log("\n🎉 All Hiring Pipeline module integration tests passed successfully!\n");
}

runTests().catch((err) => {
  console.error("❌ Test execution failed:", err);
  process.exit(1);
});
