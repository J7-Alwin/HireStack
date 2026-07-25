import "dotenv/config";
import { prisma } from "../src/config/prisma";
import { applicationService } from "../src/modules/applications/application.service";
import { ApplicationUpdateInput } from "../src/modules/applications/application.types";
import { Role, ApplicationStage, ApplicationStatus, CandidateSource, JobStatus, CandidateStatus } from "@prisma/client";
import { AuthenticatedUser } from "../src/shared/types";
import { ConflictError, ForbiddenError, UnprocessableEntityError, ValidationError } from "../src/shared/errors";

// Standard assertion helpers
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
    throw new Error(`Expected error of type ${errorClass.name}, but got ${err.constructor.name}: ${err.message}`);
  }
  if (expectedMessage && !err.message.includes(expectedMessage)) {
    throw new Error(`Expected error message to contain "${expectedMessage}", but got "${err.message}"`);
  }
}

async function runTests() {
  console.log("🚀 Starting Applications Module Integration Tests...\n");

  // 1. Setup Test Data
  console.log("📦 Seeding test database entities...");

  const companyA = await prisma.company.create({
    data: { name: `Test App Company A ${Date.now()}` },
  });
  const companyB = await prisma.company.create({
    data: { name: `Test App Company B ${Date.now()}` },
  });

  const deptA = await prisma.department.create({
    data: { name: `Eng A ${Date.now()}`, companyId: companyA.id, isActive: true },
  });
  const deptB = await prisma.department.create({
    data: { name: `Eng B ${Date.now()}`, companyId: companyB.id, isActive: true },
  });

  // Create Users
  const adminAUser = await prisma.user.create({
    data: {
      email: `app-adminA-${Date.now()}@test.com`,
      password: "password123",
      role: Role.COMPANY_ADMIN,
      companyId: companyA.id,
      isActive: true,
    },
  });

  const adminBUser = await prisma.user.create({
    data: {
      email: `app-adminB-${Date.now()}@test.com`,
      password: "password123",
      role: Role.COMPANY_ADMIN,
      companyId: companyB.id,
      isActive: true,
    },
  });

  const recruiterA1User = await prisma.user.create({
    data: {
      email: `app-recA1-${Date.now()}@test.com`,
      password: "password123",
      role: Role.RECRUITER,
      companyId: companyA.id,
      isActive: true,
    },
  });

  const recruiterA2User = await prisma.user.create({
    data: {
      email: `app-recA2-${Date.now()}@test.com`,
      password: "password123",
      role: Role.RECRUITER,
      companyId: companyA.id,
      isActive: true,
    },
  });

  const recruiterB1User = await prisma.user.create({
    data: {
      email: `app-recB1-${Date.now()}@test.com`,
      password: "password123",
      role: Role.RECRUITER,
      companyId: companyB.id,
      isActive: true,
    },
  });

  const superAdminUser = await prisma.user.create({
    data: {
      email: `app-super-${Date.now()}@test.com`,
      password: "password123",
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });

  // Create Candidates
  const candidateA = await prisma.candidate.create({
    data: {
      firstName: "John",
      lastName: "Doe",
      email: `john-${Date.now()}@test.com`,
      candidateCode: `CAN-A-${Date.now()}`,
      companyId: companyA.id,
      primaryRecruiterId: recruiterA1User.id,
      createdBy: adminAUser.id,
      status: CandidateStatus.ACTIVE,
    },
  });

  const candidateB = await prisma.candidate.create({
    data: {
      firstName: "Jane",
      lastName: "Smith",
      email: `jane-${Date.now()}@test.com`,
      candidateCode: `CAN-B-${Date.now()}`,
      companyId: companyB.id,
      primaryRecruiterId: recruiterB1User.id,
      createdBy: adminBUser.id,
      status: CandidateStatus.ACTIVE,
    },
  });

  const candidateArchived = await prisma.candidate.create({
    data: {
      firstName: "Archived",
      lastName: "User",
      email: `archived-${Date.now()}@test.com`,
      candidateCode: `CAN-C-${Date.now()}`,
      companyId: companyA.id,
      primaryRecruiterId: recruiterA1User.id,
      createdBy: adminAUser.id,
      status: CandidateStatus.ARCHIVED,
    },
  });

  const candidateBlacklisted = await prisma.candidate.create({
    data: {
      firstName: "Blacklisted",
      lastName: "User",
      email: `blacklisted-${Date.now()}@test.com`,
      candidateCode: `CAN-D-${Date.now()}`,
      companyId: companyA.id,
      primaryRecruiterId: recruiterA1User.id,
      createdBy: adminAUser.id,
      status: CandidateStatus.BLACKLISTED,
    },
  });

  // Create Jobs
  const jobOpenA = await prisma.job.create({
    data: {
      title: "Software Engineer",
      description: "Prisma ATS backend expert",
      jobCode: `JOB-OPEN-A-${Date.now()}`,
      companyId: companyA.id,
      departmentId: deptA.id,
      status: JobStatus.OPEN,
      employmentType: "FULL_TIME",
      workplaceType: "REMOTE",
      openings: 5,
      createdBy: adminAUser.id,
    },
  });

  const jobDraftA = await prisma.job.create({
    data: {
      title: "QA Engineer",
      description: "Prisma ATS tester",
      jobCode: `JOB-DRAFT-A-${Date.now()}`,
      companyId: companyA.id,
      departmentId: deptA.id,
      status: JobStatus.DRAFT,
      employmentType: "FULL_TIME",
      workplaceType: "HYBRID",
      openings: 2,
      createdBy: adminAUser.id,
    },
  });

  const jobOpenB = await prisma.job.create({
    data: {
      title: "Product Manager",
      description: "Company B PM",
      jobCode: `JOB-OPEN-B-${Date.now()}`,
      companyId: companyB.id,
      departmentId: deptB.id,
      status: JobStatus.OPEN,
      employmentType: "FULL_TIME",
      workplaceType: "ONSITE",
      openings: 1,
      createdBy: adminBUser.id,
    },
  });

  console.log("✔ Seed completed successfully.\n");

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

  const _authAdminB = {
    id: adminBUser.id,
    email: adminBUser.email,
    role: Role.COMPANY_ADMIN,
    companyId: companyB.id,
  } as unknown as AuthenticatedUser;

  const _authSuperAdmin = {
    id: superAdminUser.id,
    email: superAdminUser.email,
    role: Role.SUPER_ADMIN,
    companyId: undefined,
  } as unknown as AuthenticatedUser;

  let application1Id = "";

  // ----------------------------------------------------
  // TEST CASE 1: Create Application (Success & Validation)
  // ----------------------------------------------------
  console.log("🧪 Test Case 1: Application Creation...");

  // Recruiter A1 creates application for Candidate A & Job A (assigned to self) -> SUCCESS
  const app1 = await applicationService.createApplication(
    {
      candidateId: candidateA.id,
      jobId: jobOpenA.id,
      assignedRecruiterId: recruiterA1User.id,
      source: CandidateSource.LINKEDIN,
      remarks: "Great candidate from LinkedIn",
    },
    authRecruiterA1
  );

  assert(app1 !== null, "Application should be created");
  assert(app1.applicationCode.startsWith("APP-"), `Code should start with APP-, got ${app1.applicationCode}`);
  assert(app1.applicationCode === "APP-000001", `First code should be APP-000001, got ${app1.applicationCode}`);
  assert(app1.stage === ApplicationStage.APPLIED, "Initial stage should be APPLIED");
  assert(app1.status === ApplicationStatus.ACTIVE, "Initial status should be ACTIVE");
  assert(app1.source === CandidateSource.LINKEDIN, "Source should match input");
  assert(app1.remarks === "Great candidate from LinkedIn", "Remarks should match input");

  application1Id = app1.id;

  // Duplicate active application prevention -> Throws ConflictError
  await assertThrows(
    async () => {
      await applicationService.createApplication(
        {
          candidateId: candidateA.id,
          jobId: jobOpenA.id,
          assignedRecruiterId: recruiterA1User.id,
        },
        authAdminA
      );
    },
    ConflictError,
    "active Application for this Job"
  );

  // Candidate validation: Archived Candidate -> Throws UnprocessableEntityError
  await assertThrows(
    async () => {
      await applicationService.createApplication(
        {
          candidateId: candidateArchived.id,
          jobId: jobOpenA.id,
          assignedRecruiterId: recruiterA1User.id,
        },
        authAdminA
      );
    },
    UnprocessableEntityError,
    "archived candidate"
  );

  // Candidate validation: Blacklisted Candidate -> Throws UnprocessableEntityError
  await assertThrows(
    async () => {
      await applicationService.createApplication(
        {
          candidateId: candidateBlacklisted.id,
          jobId: jobOpenA.id,
          assignedRecruiterId: recruiterA1User.id,
        },
        authAdminA
      );
    },
    UnprocessableEntityError,
    "blacklisted candidate"
  );

  // Job validation: Draft status -> Throws UnprocessableEntityError
  await assertThrows(
    async () => {
      await applicationService.createApplication(
        {
          candidateId: candidateA.id,
          jobId: jobDraftA.id,
          assignedRecruiterId: recruiterA1User.id,
        },
        authAdminA
      );
    },
    UnprocessableEntityError,
    "open jobs"
  );

  // Company Isolation: Company A tries to create application using Candidate B (Company B) -> Throws ForbiddenError
  await assertThrows(
    async () => {
      await applicationService.createApplication(
        {
          candidateId: candidateB.id,
          jobId: jobOpenA.id,
          assignedRecruiterId: recruiterA1User.id,
        },
        authAdminA
      );
    },
    ForbiddenError,
    "Cross-company access"
  );

  // Recruiter validation: Assign to recruiter of another company -> Throws UnprocessableEntityError
  await assertThrows(
    async () => {
      await applicationService.createApplication(
        {
          candidateId: candidateA.id,
          jobId: jobOpenA.id,
          assignedRecruiterId: recruiterB1User.id,
        },
        authAdminA
      );
    },
    UnprocessableEntityError,
    "same company"
  );

  // Recruiter validation: Recruiter A1 attempts to create application assigning to Recruiter A2 -> Throws ForbiddenError (must assign to self)
  await assertThrows(
    async () => {
      await applicationService.createApplication(
        {
          candidateId: candidateA.id,
          jobId: jobOpenA.id,
          assignedRecruiterId: recruiterA2User.id,
        },
        authRecruiterA1
      );
    },
    ForbiddenError,
    "permission"
  );

  console.log("   -> Success!");

  // ----------------------------------------------------
  // TEST CASE 2: Search, Filters, Sorting, and Pagination
  // ----------------------------------------------------
  console.log("🧪 Test Case 2: Listing, Filters, Sorting, and Search...");

  // Seed another candidate for Company A to create a second application
  const candidateE = await prisma.candidate.create({
    data: {
      firstName: "Bob",
      lastName: "Johnson",
      email: `bob-${Date.now()}@test.com`,
      candidateCode: `CAN-E-${Date.now()}`,
      companyId: companyA.id,
      primaryRecruiterId: recruiterA2User.id,
      createdBy: adminAUser.id,
      status: CandidateStatus.ACTIVE,
    },
  });

  const app2 = await applicationService.createApplication(
    {
      candidateId: candidateE.id,
      jobId: jobOpenA.id,
      assignedRecruiterId: recruiterA2User.id,
      source: CandidateSource.REFERRAL,
      remarks: "Referred by CTO",
    },
    authAdminA // Admin creates it and assigns to Recruiter A2 -> SUCCESS
  );

  // List all company applications
  const listAll = await applicationService.listApplications({}, authAdminA);
  assert(listAll.data.length === 2, `Should return 2 applications, got ${listAll.data.length}`);
  assert(listAll.meta.total === 2, "Meta count should be 2");

  // Filter by candidate
  const filterCand = await applicationService.listApplications({ candidate: candidateE.id }, authAdminA);
  assert(filterCand.data.length === 1, "Should filter down to 1 application");
  assert(filterCand.data[0].id === app2.id, "Filtered application ID mismatch");

  // Filter by recruiter
  const filterRec = await applicationService.listApplications({ recruiter: recruiterA2User.id }, authAdminA);
  assert(filterRec.data.length === 1, "Should filter by recruiter to 1 application");
  assert(filterRec.data[0].assignedRecruiterId === recruiterA2User.id, "Assigned recruiter ID mismatch");

  // Search by application code
  const searchCode = await applicationService.listApplications({ search: app1.applicationCode }, authAdminA);
  assert(searchCode.data.length === 1, "Should find 1 application by code");
  assert(searchCode.data[0].id === app1.id, "Code search ID mismatch");

  // Search by candidate name
  const searchName = await applicationService.listApplications({ search: "johnson" }, authAdminA);
  assert(searchName.data.length === 1, "Should search by candidate name case-insensitively");
  assert(searchName.data[0].candidate.firstName === "Bob", `Expected Bob, got ${searchName.data[0].candidate.firstName}`); // candidateE's name is Bob Johnson

  // Sorting: sort by Candidate Name ASC
  const sortedName = await applicationService.listApplications({ sortBy: "candidateName", sortOrder: "asc" }, authAdminA);
  // Bob Johnson (Bob) should come before John Doe (John)
  assert(sortedName.data[0].candidate.firstName === "Bob", "Sorting candidate name asc failed");

  console.log("   -> Success!");

  // ----------------------------------------------------
  // TEST CASE 3: Recruiter Assignment Updates
  // ----------------------------------------------------
  console.log("🧪 Test Case 3: Recruiter Assignment...");

  // Admin A reassigns application 1 from Recruiter A1 to Recruiter A2 -> SUCCESS
  const appReassigned = await applicationService.assignRecruiter(
    application1Id,
    { assignedRecruiterId: recruiterA2User.id },
    authAdminA
  );
  assert(appReassigned.assignedRecruiterId === recruiterA2User.id, "Assigned recruiter should be updated");

  // Recruiter A1 attempts to reassign recruiter -> Throws ForbiddenError
  await assertThrows(
    async () => {
      await applicationService.assignRecruiter(
        application1Id,
        { assignedRecruiterId: recruiterA1User.id },
        authRecruiterA1
      );
    },
    ForbiddenError,
    "permission"
  );

  console.log("   -> Success!");

  // ----------------------------------------------------
  // TEST CASE 4: Stage Transition Rules
  // ----------------------------------------------------
  console.log("🧪 Test Case 4: Stage Transitions...");

  // Current stage: APPLIED (assigned recruiter is now Recruiter A2)
  // Transition to SCREENING -> SUCCESS
  const stageScreening = await applicationService.updateStage(
    application1Id,
    { stage: ApplicationStage.SCREENING },
    authRecruiterA2
  );
  assert(stageScreening.stage === ApplicationStage.SCREENING, "Stage should be updated to SCREENING");

  // Transition SCREENING to INTERVIEW (not allowed by matrix) -> Throws UnprocessableEntityError
  await assertThrows(
    async () => {
      await applicationService.updateStage(
        application1Id,
        { stage: ApplicationStage.INTERVIEW },
        authRecruiterA2
      );
    },
    UnprocessableEntityError,
    "Invalid stage transition"
  );

  // Transition SCREENING to SHORTLISTED -> SUCCESS
  const stageShortlisted = await applicationService.updateStage(
    application1Id,
    { stage: ApplicationStage.SHORTLISTED },
    authRecruiterA2
  );
  assert(stageShortlisted.stage === ApplicationStage.SHORTLISTED, "Stage should be SHORTLISTED");

  console.log("   -> Success!");

  // ----------------------------------------------------
  // TEST CASE 5: Status Transition Rules and Terminal States
  // ----------------------------------------------------
  console.log("🧪 Test Case 5: Status Transitions and Terminal States...");

  // Reject Application 1
  const rejectedApp = await applicationService.rejectApplication(
    application1Id,
    {
      rejectionReasonCode: "SKILL_MISMATCH",
      rejectionReasonNote: "Lacked Postgres architecture experience",
    },
    authRecruiterA2
  );

  assert(rejectedApp.status === ApplicationStatus.REJECTED, "Status should be REJECTED");
  assert(rejectedApp.rejectionReasonCode === "SKILL_MISMATCH", "Reason code mismatch");
  assert(rejectedApp.rejectionReasonNote === "Lacked Postgres architecture experience", "Reason note mismatch");

  // Terminal state status updates (cannot transition back) -> Throws UnprocessableEntityError
  await assertThrows(
    async () => {
      await applicationService.updateStatus(
        application1Id,
        { status: ApplicationStatus.ACTIVE },
        authAdminA
      );
    },
    UnprocessableEntityError,
    "Terminal states cannot transition back"
  );

  // Terminal state stage updates (read-only) -> Throws UnprocessableEntityError
  await assertThrows(
    async () => {
      await applicationService.updateStage(
        application1Id,
        { stage: ApplicationStage.INTERVIEW },
        authAdminA
      );
    },
    UnprocessableEntityError,
    "Terminal states cannot transition back"
  );

  console.log("   -> Success!");

  // ----------------------------------------------------
  // TEST CASE 6: Soft Delete and Restore
  // ----------------------------------------------------
  console.log("🧪 Test Case 6: Soft Delete and Restore...");

  // Recruiter A2 attempts to soft-delete -> Throws ForbiddenError
  await assertThrows(
    async () => {
      await applicationService.softDeleteApplication(application1Id, authRecruiterA2);
    },
    ForbiddenError,
    "permission"
  );

  // Admin A soft-deletes application -> SUCCESS (deletedAt !== null)
  const deleted = await applicationService.softDeleteApplication(application1Id, authAdminA);
  assert(deleted.deletedAt !== null, "deletedAt should be set");

  // Excluded from query list
  const listFiltered = await applicationService.listApplications({}, authAdminA);
  assert(listFiltered.data.length === 1, `List should exclude soft-deleted applications, got ${listFiltered.data.length}`);

  // Restore application -> SUCCESS
  const restored = await applicationService.restoreApplication(application1Id, authAdminA);
  assert(restored.deletedAt === null, "deletedAt should be reset to null");

  // List should include it again
  const listRestored = await applicationService.listApplications({}, authAdminA);
  assert(listRestored.data.length === 2, "List should include restored application");

  console.log("   -> Success!");

  // ----------------------------------------------------
  // TEST CASE 7: Immutable Fields Validation
  // ----------------------------------------------------
  console.log("🧪 Test Case 7: Immutable Fields Validation...");
  
  // Try to update jobId -> Throws ValidationError
  await assertThrows(
    async () => {
      await applicationService.updateApplication(
        application1Id,
        { jobId: jobOpenB.id } as unknown as ApplicationUpdateInput,
        authAdminA
      );
    },
    ValidationError,
    "Immutable fields cannot be modified"
  );

  // Try to update candidateId -> Throws ValidationError
  await assertThrows(
    async () => {
      await applicationService.updateApplication(
        application1Id,
        { candidateId: candidateB.id } as unknown as ApplicationUpdateInput,
        authAdminA
      );
    },
    ValidationError,
    "Immutable fields cannot be modified"
  );

  // Try to update applicationCode -> Throws ValidationError
  await assertThrows(
    async () => {
      await applicationService.updateApplication(
        application1Id,
        { applicationCode: "APP-999999" } as unknown as ApplicationUpdateInput,
        authAdminA
      );
    },
    ValidationError,
    "Immutable fields cannot be modified"
  );

  console.log("   -> Success!");

  // ----------------------------------------------------
  // TEST CASE 8: Restore Validations
  // ----------------------------------------------------
  console.log("🧪 Test Case 8: Restore Validations...");

  // Soft delete application 2 (which is ACTIVE)
  await applicationService.softDeleteApplication(app2.id, authAdminA);

  // Create another active application for Candidate E & Job A (allowed since app2 is soft-deleted)
  const app3 = await applicationService.createApplication(
    {
      candidateId: candidateE.id,
      jobId: jobOpenA.id,
      assignedRecruiterId: recruiterA2User.id,
    },
    authAdminA
  );

  // Attempt to restore application 2 (which is ACTIVE and would violate duplicate active prevention since app3 is active) -> Throws ConflictError
  await assertThrows(
    async () => {
      await applicationService.restoreApplication(app2.id, authAdminA);
    },
    ConflictError,
    "active Application for this Job"
  );

  // Clean up app3 so we can restore app2
  await prisma.application.delete({ where: { id: app3.id } });

  // Restore application 2
  await applicationService.restoreApplication(app2.id, authAdminA);

  // Now, test candidate eligibility on restore of an ACTIVE application
  // Let's soft-delete app2 again
  await applicationService.softDeleteApplication(app2.id, authAdminA);

  // Make candidateE blacklisted
  await prisma.candidate.update({
    where: { id: candidateE.id },
    data: { status: CandidateStatus.BLACKLISTED },
  });

  // Attempt to restore app2 (blacklisted candidate) -> Throws UnprocessableEntityError
  await assertThrows(
    async () => {
      await applicationService.restoreApplication(app2.id, authAdminA);
    },
    UnprocessableEntityError,
    "blacklisted candidate"
  );

  // Reset candidateE to ACTIVE
  await prisma.candidate.update({
    where: { id: candidateE.id },
    data: { status: CandidateStatus.ACTIVE },
  });

  // Restore app2
  await applicationService.restoreApplication(app2.id, authAdminA);

  console.log("   -> Success!");

  // ----------------------------------------------------
  // CLEANUP
  // ----------------------------------------------------
  console.log("\n🧹 Cleaning up seeded test database records...");

  const testAppIds = [application1Id, app2.id, app3.id];
  await prisma.application.deleteMany({
    where: { id: { in: testAppIds } },
  });

  await prisma.companyApplicationCounter.deleteMany({
    where: { companyId: { in: [companyA.id, companyB.id] } },
  });

  const testCandIds = [candidateA.id, candidateB.id, candidateArchived.id, candidateBlacklisted.id, candidateE.id];
  await prisma.candidate.deleteMany({
    where: { id: { in: testCandIds } },
  });

  const testJobIds = [jobOpenA.id, jobDraftA.id, jobOpenB.id];
  await prisma.job.deleteMany({
    where: { id: { in: testJobIds } },
  });

  const testUserIds = [adminAUser.id, adminBUser.id, recruiterA1User.id, recruiterA2User.id, recruiterB1User.id, superAdminUser.id];
  await prisma.user.deleteMany({
    where: { id: { in: testUserIds } },
  });

  await prisma.department.deleteMany({
    where: { id: { in: [deptA.id, deptB.id] } },
  });

  await prisma.company.deleteMany({
    where: { id: { in: [companyA.id, companyB.id] } },
  });

  console.log("🧹 Cleanup Complete.");
  console.log("🎉 All Applications module integration tests passed successfully!");
}

runTests()
  .then(() => {
    // Explicitly exit clean to prevent hanging open database connections in tests
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test run failed with error:", error);
    process.exit(1);
  });
