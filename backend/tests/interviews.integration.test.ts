import "dotenv/config";
import { z } from "zod";
import { prisma } from "../src/config/prisma";
import { interviewService } from "../src/modules/interviews/service/interview.service";
import {
  Role,
  InterviewType,
  InterviewRound,
  InterviewStatus,
  InterviewOutcome,
  InterviewMode,
  JobStatus,
  ApplicationStage,
  ApplicationStatus,
} from "@prisma/client";
import { AuthenticatedUser } from "../src/shared/types";
import { ConflictError, ForbiddenError, UnprocessableEntityError } from "../src/shared/errors";

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
  console.log("🚀 Starting Interview Management Module Integration Tests...\n");

  // 1. Setup Test Data
  console.log("📦 Seeding test database entities...");

  const companyA = await prisma.company.create({
    data: { name: `Test Int Company A ${Date.now()}` },
  });
  const companyB = await prisma.company.create({
    data: { name: `Test Int Company B ${Date.now()}` },
  });

  const deptA = await prisma.department.create({
    data: { name: "Engineering A", companyId: companyA.id },
  });
  const deptB = await prisma.department.create({
    data: { name: "Engineering B", companyId: companyB.id },
  });

  const adminAUser = await prisma.user.create({
    data: {
      email: `admin.a.${Date.now()}@test.com`,
      password: "HashPassword123!",
      role: Role.COMPANY_ADMIN,
      companyId: companyA.id,
      departmentId: deptA.id,
    },
  });

  const recruiterA1User = await prisma.user.create({
    data: {
      email: `recruiter.a1.${Date.now()}@test.com`,
      password: "HashPassword123!",
      role: Role.RECRUITER,
      companyId: companyA.id,
      departmentId: deptA.id,
    },
  });

  const recruiterA2User = await prisma.user.create({
    data: {
      email: `recruiter.a2.${Date.now()}@test.com`,
      password: "HashPassword123!",
      role: Role.RECRUITER,
      companyId: companyA.id,
      departmentId: deptA.id,
    },
  });

  const adminBUser = await prisma.user.create({
    data: {
      email: `admin.b.${Date.now()}@test.com`,
      password: "HashPassword123!",
      role: Role.COMPANY_ADMIN,
      companyId: companyB.id,
      departmentId: deptB.id,
    },
  });

  const superAdminUser = await prisma.user.create({
    data: {
      email: `super.${Date.now()}@test.com`,
      password: "HashPassword123!",
      role: Role.SUPER_ADMIN,
    },
  });

  const candidateA = await prisma.candidate.create({
    data: {
      companyId: companyA.id,
      primaryRecruiterId: recruiterA1User.id,
      candidateCode: `CAND-${Date.now()}-A`,
      firstName: "John",
      lastName: "Doe",
      email: `john.doe.${Date.now()}@gmail.com`,
      createdBy: adminAUser.id,
    },
  });

  const jobOpenA = await prisma.job.create({
    data: {
      companyId: companyA.id,
      departmentId: deptA.id,
      jobCode: `JOB-${Date.now()}-A`,
      title: "Backend Developer",
      description: "Express TS role",
      employmentType: "FULL_TIME",
      workplaceType: "REMOTE",
      openings: 2,
      createdBy: adminAUser.id,
      status: JobStatus.OPEN,
    },
  });

  // Unique counters per company
  await prisma.companyApplicationCounter.create({
    data: { companyId: companyA.id, count: 0 },
  });

  // Parent application (ACTIVE)
  const application1 = await prisma.application.create({
    data: {
      applicationCode: "APP-000001",
      companyId: companyA.id,
      candidateId: candidateA.id,
      jobId: jobOpenA.id,
      assignedRecruiterId: recruiterA1User.id,
      stage: ApplicationStage.APPLIED,
      status: ApplicationStatus.ACTIVE,
      createdBy: adminAUser.id,
    },
  });

  // Parent application (REJECTED)
  const applicationRejected = await prisma.application.create({
    data: {
      applicationCode: "APP-000002",
      companyId: companyA.id,
      candidateId: candidateA.id,
      jobId: jobOpenA.id,
      assignedRecruiterId: recruiterA1User.id,
      stage: ApplicationStage.APPLIED,
      status: ApplicationStatus.REJECTED,
      createdBy: adminAUser.id,
    },
  });

  // Create mock auth contexts
  const authAdminA = {
    id: adminAUser.id,
    email: adminAUser.email,
    role: Role.COMPANY_ADMIN,
    companyId: companyA.id,
  } as unknown as AuthenticatedUser;

  const authRecruiterA1 = {
    id: recruiterA1User.id,
    email: recruiterA1User.email,
    role: Role.RECRUITER,
    companyId: companyA.id,
  } as unknown as AuthenticatedUser;

  const authRecruiterA2 = {
    id: recruiterA2User.id,
    email: recruiterA2User.email,
    role: Role.RECRUITER,
    companyId: companyA.id,
  } as unknown as AuthenticatedUser;

  const authAdminB = {
    id: adminBUser.id,
    email: adminBUser.email,
    role: Role.COMPANY_ADMIN,
    companyId: companyB.id,
  } as unknown as AuthenticatedUser;

  const authSuperAdmin = {
    id: superAdminUser.id,
    email: superAdminUser.email,
    role: Role.SUPER_ADMIN,
    companyId: undefined,
  } as unknown as AuthenticatedUser;

  let interview1Id = "";

  // ----------------------------------------------------
  // TEST CASE 1: Create Interview (Online, Onsite, Phone)
  // ----------------------------------------------------
  console.log("🧪 Test Case 1: Create Interview...");

  const baseScheduledDate = new Date();
  baseScheduledDate.setDate(baseScheduledDate.getDate() + 2); // 2 days in the future
  const baseScheduledDateStr = baseScheduledDate.toISOString().split("T")[0];

  const startTime = new Date(baseScheduledDate);
  startTime.setHours(10, 0, 0, 0);
  const endTime = new Date(baseScheduledDate);
  endTime.setHours(11, 0, 0, 0);

  // Online creation - missing meetingLink -> Throws ZodError
  await assertThrows(
    async () => {
      await interviewService.scheduleInterview(
        {
          applicationId: application1.id,
          interviewType: InterviewType.INTERNAL,
          round: InterviewRound.TECHNICAL,
          mode: InterviewMode.ONLINE,
          scheduledDate: baseScheduledDateStr,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          timeZone: "Asia/Kolkata",
          interviewers: [recruiterA1User.id],
        },
        authAdminA
      );
    },
    z.ZodError,
    "ONLINE interview requires meetingLink"
  );

  // Onsite creation - missing location -> Throws ValidationError
  await assertThrows(
    async () => {
      await interviewService.scheduleInterview(
        {
          applicationId: application1.id,
          interviewType: InterviewType.INTERNAL,
          round: InterviewRound.TECHNICAL,
          mode: InterviewMode.ONSITE,
          scheduledDate: baseScheduledDateStr,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          timeZone: "Asia/Kolkata",
          interviewers: [recruiterA1User.id],
        },
        authAdminA
      );
    },
    z.ZodError,
    "ONSITE interview requires location"
  );

  // Time range validation check: startTime >= endTime -> Throws ZodError
  const invalidTimeStart = new Date(baseScheduledDate);
  invalidTimeStart.setHours(12, 0, 0, 0);
  const invalidTimeEnd = new Date(baseScheduledDate);
  invalidTimeEnd.setHours(11, 0, 0, 0);

  await assertThrows(
    async () => {
      await interviewService.scheduleInterview(
        {
          applicationId: application1.id,
          interviewType: InterviewType.INTERNAL,
          round: InterviewRound.TECHNICAL,
          mode: InterviewMode.ONLINE,
          scheduledDate: baseScheduledDateStr,
          startTime: invalidTimeStart.toISOString(),
          endTime: invalidTimeEnd.toISOString(),
          timeZone: "Asia/Kolkata",
          meetingLink: "https://zoom.us/j/123",
          interviewers: [recruiterA1User.id],
        },
        authAdminA
      );
    },
    z.ZodError,
    "End time must be later than start time"
  );

  // Create Online Interview successfully
  const onlineInt = await interviewService.scheduleInterview(
    {
      applicationId: application1.id,
      interviewType: InterviewType.INTERNAL,
      round: InterviewRound.TECHNICAL,
      mode: InterviewMode.ONLINE,
      scheduledDate: baseScheduledDateStr,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      timeZone: "Asia/Kolkata",
      meetingLink: "https://zoom.us/j/123456",
      interviewers: [recruiterA1User.id],
    },
    authRecruiterA1
  );

  assert(
    onlineInt.interviewCode === "INT-000001",
    `Expected INT-000001, got ${onlineInt.interviewCode}`
  );
  assert(onlineInt.status === InterviewStatus.SCHEDULED, "Should default to SCHEDULED");
  assert(onlineInt.mode === InterviewMode.ONLINE, "Mode should be ONLINE");
  assert(onlineInt.interviewers.length === 1, "Should have 1 interviewer assigned");
  interview1Id = onlineInt.id;

  console.log("   -> Success!");

  // ----------------------------------------------------
  // TEST CASE 2: Duplicate Round Rules
  // ----------------------------------------------------
  console.log("🧪 Test Case 2: Duplicate Round Prevention...");

  // Attempt to schedule another TECHNICAL round for the same application -> Throws ConflictError
  const dupStartTime = new Date(baseScheduledDate);
  dupStartTime.setHours(12, 0, 0, 0);
  const dupEndTime = new Date(baseScheduledDate);
  dupEndTime.setHours(13, 0, 0, 0);

  await assertThrows(
    async () => {
      await interviewService.scheduleInterview(
        {
          applicationId: application1.id,
          interviewType: InterviewType.INTERNAL,
          round: InterviewRound.TECHNICAL,
          mode: InterviewMode.ONLINE,
          scheduledDate: baseScheduledDateStr,
          startTime: dupStartTime.toISOString(),
          endTime: dupEndTime.toISOString(),
          timeZone: "Asia/Kolkata",
          meetingLink: "https://zoom.us/j/1234567",
          interviewers: [recruiterA1User.id],
        },
        authAdminA
      );
    },
    ConflictError,
    "same round is already scheduled"
  );

  console.log("   -> Success!");

  // ----------------------------------------------------
  // TEST CASE 3: Application Eligibility Rules
  // ----------------------------------------------------
  console.log("🧪 Test Case 3: Application Eligibility...");

  // Try to schedule for applicationRejected -> Throws ConflictError
  await assertThrows(
    async () => {
      await interviewService.scheduleInterview(
        {
          applicationId: applicationRejected.id,
          interviewType: InterviewType.INTERNAL,
          round: InterviewRound.HR,
          mode: InterviewMode.PHONE,
          scheduledDate: baseScheduledDateStr,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          timeZone: "Asia/Kolkata",
          interviewers: [recruiterA1User.id],
        },
        authAdminA
      );
    },
    ConflictError,
    "Application is not eligible"
  );

  console.log("   -> Success!");

  // ----------------------------------------------------
  // TEST CASE 4: Interviewer Conflict Rules
  // ----------------------------------------------------
  console.log("🧪 Test Case 4: Interviewer Conflicts...");

  // Try to schedule a different round (HR) for Application 1 at overlapping times with Recruiter A1 -> Throws ConflictError
  await assertThrows(
    async () => {
      await interviewService.scheduleInterview(
        {
          applicationId: application1.id,
          interviewType: InterviewType.INTERNAL,
          round: InterviewRound.HR,
          mode: InterviewMode.PHONE,
          scheduledDate: baseScheduledDateStr,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          timeZone: "Asia/Kolkata",
          interviewers: [recruiterA1User.id],
        },
        authAdminA
      );
    },
    ConflictError,
    "Interviewer scheduling conflict detected"
  );

  console.log("   -> Success!");

  // ----------------------------------------------------
  // TEST CASE 5: Security and Company Isolation
  // ----------------------------------------------------
  console.log("🧪 Test Case 5: Security & Company Isolation...");

  // Recruiter A2 (not assigned recruiter of application) attempts writes -> Throws ForbiddenError
  await assertThrows(
    async () => {
      await interviewService.updateInterview(
        interview1Id,
        { notes: "Hacked notes" },
        authRecruiterA2
      );
    },
    ForbiddenError,
    "You do not have permission to modify"
  );

  // Admin B from another company attempts access -> Throws ForbiddenError
  await assertThrows(
    async () => {
      await interviewService.getInterviewById(interview1Id, authAdminB);
    },
    ForbiddenError,
    "Cross-company access is not permitted"
  );

  // Super Admin attempts access -> Throws ForbiddenError
  await assertThrows(
    async () => {
      await interviewService.getInterviewById(interview1Id, authSuperAdmin);
    },
    ForbiddenError,
    "permission to perform this action"
  );

  console.log("   -> Success!");

  // ----------------------------------------------------
  // TEST CASE 6: Rescheduling
  // ----------------------------------------------------
  console.log("🧪 Test Case 6: Rescheduling...");

  const newStartTime = new Date(baseScheduledDate);
  newStartTime.setHours(14, 0, 0, 0);
  const newEndTime = new Date(baseScheduledDate);
  newEndTime.setHours(15, 0, 0, 0);

  const rescheduled = await interviewService.rescheduleInterview(
    interview1Id,
    {
      scheduledDate: baseScheduledDateStr,
      startTime: newStartTime.toISOString(),
      endTime: newEndTime.toISOString(),
      timeZone: "Asia/Kolkata",
      meetingLink: "https://zoom.us/j/rescheduled-link",
    },
    authRecruiterA1
  );

  assert(
    rescheduled.meetingLink === "https://zoom.us/j/rescheduled-link",
    "Meeting link should be updated"
  );
  assert(new Date(rescheduled.startTime).getHours() === 14, "Start hour should be updated to 14");

  console.log("   -> Success!");

  // ----------------------------------------------------
  // TEST CASE 7: Status Lifecycle Transitions
  // ----------------------------------------------------
  console.log("🧪 Test Case 7: Status Transitions...");

  // Transition: SCHEDULED -> CONFIRMED (Success)
  let updated = await interviewService.updateStatus(
    interview1Id,
    { status: InterviewStatus.CONFIRMED },
    authRecruiterA1
  );
  assert(updated.status === InterviewStatus.CONFIRMED, "Status should be CONFIRMED");

  // Transition: CONFIRMED -> COMPLETED (Throws UnprocessableEntity: must go through IN_PROGRESS)
  await assertThrows(
    async () => {
      await interviewService.updateStatus(
        interview1Id,
        { status: InterviewStatus.COMPLETED },
        authRecruiterA1
      );
    },
    UnprocessableEntityError,
    "Invalid interview status transition"
  );

  // Transition: CONFIRMED -> IN_PROGRESS (Success)
  updated = await interviewService.updateStatus(
    interview1Id,
    { status: InterviewStatus.IN_PROGRESS },
    authRecruiterA1
  );
  assert(updated.status === InterviewStatus.IN_PROGRESS, "Status should be IN_PROGRESS");

  // Transition: IN_PROGRESS -> COMPLETED (Success)
  updated = await interviewService.updateStatus(
    interview1Id,
    { status: InterviewStatus.COMPLETED },
    authRecruiterA1
  );
  assert(updated.status === InterviewStatus.COMPLETED, "Status should be COMPLETED");
  assert(updated.completedAt !== null, "completedAt should be recorded");

  // COMPLETED (Terminal) -> SCHEDULED (Throws UnprocessableEntity)
  await assertThrows(
    async () => {
      await interviewService.updateStatus(
        interview1Id,
        { status: InterviewStatus.SCHEDULED },
        authRecruiterA1
      );
    },
    UnprocessableEntityError,
    "Invalid interview status transition"
  );

  console.log("   -> Success!");

  // ----------------------------------------------------
  // TEST CASE 8: Outcome and Result Notes
  // ----------------------------------------------------
  console.log("🧪 Test Case 8: Recording Outcome...");

  // Record outcome on COMPLETED interview -> Success
  const finalOutcome = await interviewService.recordOutcome(
    interview1Id,
    {
      outcome: InterviewOutcome.PASS,
      resultNotes: "Excellent TS design skills shown.",
    },
    authRecruiterA1
  );

  assert(finalOutcome.outcome === InterviewOutcome.PASS, "Outcome should be PASS");
  assert(
    finalOutcome.resultNotes === "Excellent TS design skills shown.",
    "Result notes should be set"
  );

  console.log("   -> Success!");

  // ----------------------------------------------------
  // TEST CASE 9: Soft Delete and List Queries
  // ----------------------------------------------------
  console.log("🧪 Test Case 9: Soft Delete & List Queries...");

  // Add a second interview for listing check
  const onsetScheduledDate = new Date();
  onsetScheduledDate.setDate(onsetScheduledDate.getDate() + 3);
  const onsiteInt = await interviewService.scheduleInterview(
    {
      applicationId: application1.id,
      interviewType: InterviewType.INTERNAL,
      round: InterviewRound.HR,
      mode: InterviewMode.ONSITE,
      scheduledDate: onsetScheduledDate.toISOString().split("T")[0],
      startTime: new Date(onsetScheduledDate.setHours(11, 0)).toISOString(),
      endTime: new Date(onsetScheduledDate.setHours(12, 0)).toISOString(),
      timeZone: "Asia/Kolkata",
      location: "Room 102, Tech Hub Building",
      interviewers: [recruiterA2User.id],
    },
    authAdminA
  );

  // List all company interviews -> count = 2
  let list = await interviewService.listInterviews({}, authAdminA);
  assert(list.data.length === 2, `Should return 2 interviews, got ${list.data.length}`);

  // Recruiter A2 soft deletes interview 2 (Throws Forbidden: Admin only)
  await assertThrows(
    async () => {
      await interviewService.softDeleteInterview(onsiteInt.id, authRecruiterA2);
    },
    ForbiddenError,
    "permission to perform this action"
  );

  // Admin A soft deletes interview 2 -> Success
  await interviewService.softDeleteInterview(onsiteInt.id, authAdminA);

  // List all company interviews -> count = 1 (soft deleted excluded)
  list = await interviewService.listInterviews({}, authAdminA);
  assert(
    list.data.length === 1,
    `Should return 1 interview after soft delete, got ${list.data.length}`
  );

  console.log("   -> Success!");

  // ----------------------------------------------------
  // CLEANUP
  // ----------------------------------------------------
  console.log("\n🧹 Cleaning up seeded test database records...");

  const testIntIds = [interview1Id, onsiteInt.id];
  await prisma.interviewInterviewer.deleteMany({
    where: { interviewId: { in: testIntIds } },
  });
  await prisma.interview.deleteMany({
    where: { id: { in: testIntIds } },
  });

  await prisma.companyInterviewCounter.deleteMany({
    where: { companyId: { in: [companyA.id, companyB.id] } },
  });

  await prisma.application.deleteMany({
    where: { id: { in: [application1.id, applicationRejected.id] } },
  });

  await prisma.companyApplicationCounter.deleteMany({
    where: { companyId: companyA.id },
  });

  await prisma.candidate.deleteMany({
    where: { id: candidateA.id },
  });

  await prisma.job.deleteMany({
    where: { id: jobOpenA.id },
  });

  await prisma.user.deleteMany({
    where: {
      id: {
        in: [
          adminAUser.id,
          recruiterA1User.id,
          recruiterA2User.id,
          adminBUser.id,
          superAdminUser.id,
        ],
      },
    },
  });

  await prisma.department.deleteMany({
    where: { id: { in: [deptA.id, deptB.id] } },
  });

  await prisma.company.deleteMany({
    where: { id: { in: [companyA.id, companyB.id] } },
  });

  console.log("🧹 Cleanup Complete.");
  console.log("🎉 All Interview Management module integration tests passed successfully!");
}

runTests()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test run failed with error:", error);
    process.exit(1);
  });
