import "dotenv/config";
import { prisma } from "../src/config/prisma";
import { jobService } from "../src/modules/jobs/job.service";
import { Role, JobStatus, EmploymentType, WorkplaceType } from "@prisma/client";
import { AuthenticatedUser } from "../src/shared/types";
import { AccountStatus } from "../src/shared/enums/status.enum";

// Standard assertion helpers
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function assertThrows(
  fn: () => Promise<unknown>,
  errorClass: new (...args: never[]) => Error,
  expectedMessage?: string,
  expectedDetails?: Record<string, unknown>
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

  const err = caughtError as Error & { details?: Record<string, unknown> };

  if (err.constructor.name !== errorClass.name && !(err instanceof errorClass)) {
    throw new Error(`Expected error of type ${errorClass.name}, but got ${err.constructor.name}: ${err.message}`, { cause: err });
  }
  if (expectedMessage && !err.message.includes(expectedMessage)) {
    throw new Error(`Expected error message to contain "${expectedMessage}", but got "${err.message}"`, { cause: err });
  }
  if (expectedDetails) {
    const details = err.details;
    if (!details) {
      throw new Error(`Expected error to have details, but it had none`, { cause: err });
    }
    for (const key of Object.keys(expectedDetails)) {
      if (details[key] !== expectedDetails[key]) {
        throw new Error(`Expected detail key "${key}" to be "${expectedDetails[key]}", but got "${details[key]}"`, { cause: err });
      }
    }
  }
}

async function runTests() {
  console.log("🚀 Starting Jobs Module Integration Tests...\n");

  // 1. Setup Test Data
  console.log("📦 Seeding test database entities...");

  const companyA = await prisma.company.create({
    data: { name: `Test Company A ${Date.now()}` },
  });
  const companyB = await prisma.company.create({
    data: { name: `Test Company B ${Date.now()}` },
  });

  const deptA = await prisma.department.create({
    data: { name: "Engineering A", companyId: companyA.id, isActive: true },
  });
  const deptB = await prisma.department.create({
    data: { name: "Engineering B", companyId: companyB.id, isActive: true },
  });

  // Create Users
  const adminAUser = await prisma.user.create({
    data: {
      email: `adminA-${Date.now()}@test.com`,
      password: "password123",
      role: "COMPANY_ADMIN",
      companyId: companyA.id,
      isActive: true,
    },
  });

  const adminBUser = await prisma.user.create({
    data: {
      email: `adminB-${Date.now()}@test.com`,
      password: "password123",
      role: "COMPANY_ADMIN",
      companyId: companyB.id,
      isActive: true,
    },
  });

  const recruiterA1User = await prisma.user.create({
    data: {
      email: `recA1-${Date.now()}@test.com`,
      password: "password123",
      role: "RECRUITER",
      companyId: companyA.id,
      isActive: true,
    },
  });

  const recruiterA2User = await prisma.user.create({
    data: {
      email: `recA2-${Date.now()}@test.com`,
      password: "password123",
      role: "RECRUITER",
      companyId: companyA.id,
      isActive: true,
    },
  });

  const recruiterB1User = await prisma.user.create({
    data: {
      email: `recB1-${Date.now()}@test.com`,
      password: "password123",
      role: "RECRUITER",
      companyId: companyB.id,
      isActive: true,
    },
  });

  const superAdminUser = await prisma.user.create({
    data: {
      email: `super-${Date.now()}@test.com`,
      password: "password123",
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  // Map to AuthenticatedUser contexts
  const contextAdminA: AuthenticatedUser = {
    id: adminAUser.id,
    email: adminAUser.email,
    role: Role.COMPANY_ADMIN,
    status: adminAUser.status as AccountStatus,
    companyId: companyA.id,
  };

  const contextAdminB: AuthenticatedUser = {
    id: adminBUser.id,
    email: adminBUser.email,
    role: Role.COMPANY_ADMIN,
    status: adminBUser.status as AccountStatus,
    companyId: companyB.id,
  };

  const contextRecruiterA1: AuthenticatedUser = {
    id: recruiterA1User.id,
    email: recruiterA1User.email,
    role: Role.RECRUITER,
    status: recruiterA1User.status as AccountStatus,
    companyId: companyA.id,
  };

  const contextRecruiterA2: AuthenticatedUser = {
    id: recruiterA2User.id,
    email: recruiterA2User.email,
    role: Role.RECRUITER,
    status: recruiterA2User.status as AccountStatus,
    companyId: companyA.id,
  };

  const contextRecruiterB1: AuthenticatedUser = {
    id: recruiterB1User.id,
    email: recruiterB1User.email,
    role: Role.RECRUITER,
    status: recruiterB1User.status as AccountStatus,
    companyId: companyB.id,
  };

  const contextSuperAdmin: AuthenticatedUser = {
    id: superAdminUser.id,
    email: superAdminUser.email,
    role: Role.SUPER_ADMIN,
    status: superAdminUser.status as AccountStatus,
    companyId: null,
  };

  console.log("✅ Setup Complete.\n");

  try {
    // ----------------------------------------------------
    // TEST 1: Create Draft Job
    // ----------------------------------------------------
    console.log("🧪 Test 1: Creating a draft job...");
    const draftJob = await jobService.createJob(
      {
        title: "Software Engineer",
        description: "Develop cool features",
        departmentId: deptA.id,
        employmentType: EmploymentType.FULL_TIME,
        workplaceType: WorkplaceType.REMOTE,
        openings: 2,
        recruiterIds: [recruiterA1User.id],
      },
      contextAdminA
    );
    assert(draftJob.status === JobStatus.DRAFT, "Job should start in DRAFT status");
    assert(draftJob.companyId === companyA.id, "Job companyId must match Admin's companyId");
    console.log("   -> Success!");

    // ----------------------------------------------------
    // TEST 2: Company Isolation (Read Boundary)
    // ----------------------------------------------------
    console.log("🧪 Test 2: Verifying company isolation on read...");
    await assertThrows(
      async () => await jobService.getJobById(draftJob.id, contextAdminB),
      Error, // ForbiddenError
      "Cross-company access"
    );
    console.log("   -> Success!");

    // ----------------------------------------------------
    // TEST 3: Company Isolation (Update Boundary)
    // ----------------------------------------------------
    console.log("🧪 Test 3: Verifying company isolation on write/update...");
    await assertThrows(
      async () =>
        await jobService.updateJob(
          draftJob.id,
          { title: "Malicious Title Change" },
          contextAdminB
        ),
      Error,
      "Cross-company access"
    );
    console.log("   -> Success!");

    // ----------------------------------------------------
    // TEST 4: Recruiter Access Boundary (Assigned vs Unassigned)
    // ----------------------------------------------------
    console.log("🧪 Test 4: Verifying assigned recruiter can update job...");
    const updatedJob = await jobService.updateJob(
      draftJob.id,
      { description: "Develop and scale cool products" },
      contextRecruiterA1
    );
    assert(updatedJob.description === "Develop and scale cool products", "Description should be updated");

    console.log("🧪 Test 4b: Verifying unassigned recruiter is rejected...");
    await assertThrows(
      async () =>
        await jobService.updateJob(
          draftJob.id,
          { title: "Unauthorized title change" },
          contextRecruiterA2
        ),
      Error,
      "You do not have permission to manage this job"
    );
    console.log("   -> Success!");

    // ----------------------------------------------------
    // TEST 5: Recruiter from Another Company Reject
    // ----------------------------------------------------
    console.log("🧪 Test 5: Verifying recruiter from another company is rejected...");
    await assertThrows(
      async () =>
        await jobService.updateJob(
          draftJob.id,
          { title: "Cross-company recruiter edit" },
          contextRecruiterB1
        ),
      Error,
      "Cross-company access"
    );
    console.log("   -> Success!");

    // ----------------------------------------------------
    // TEST 6: Super Admin Blocking
    // ----------------------------------------------------
    console.log("🧪 Test 6: Verifying SUPER_ADMIN is fully blocked from job management...");
    await assertThrows(
      async () => await jobService.getJobById(draftJob.id, contextSuperAdmin),
      Error,
      "You do not have permission to perform this action"
    );
    await assertThrows(
      async () => await jobService.listJobs({}, contextSuperAdmin),
      Error,
      "You do not have permission to perform this action"
    );
    console.log("   -> Success!");

    // ----------------------------------------------------
    // TEST 7: Invalid Transition Details
    // ----------------------------------------------------
    console.log("🧪 Test 7: Verifying invalid lifecycle transition throws structured error payload...");
    await assertThrows(
      async () => await jobService.openJob(draftJob.id, contextAdminA),
      Error,
      "Invalid job status transition",
      {
        currentStatus: JobStatus.DRAFT,
        targetStatus: JobStatus.OPEN,
      }
    );
    console.log("   -> Success!");

    // ----------------------------------------------------
    // TEST 8: Valid Lifecycle Flow
    // ----------------------------------------------------
    console.log("🧪 Test 8: Verifying complete valid lifecycle path...");

    // 1. Publish (DRAFT -> PUBLISHED)
    const published = await jobService.publishJob(draftJob.id, contextRecruiterA1);
    assert(published.status === JobStatus.PUBLISHED, "Should transition to PUBLISHED");

    // 2. Open (PUBLISHED -> OPEN)
    const opened = await jobService.openJob(draftJob.id, contextRecruiterA1);
    assert(opened.status === JobStatus.OPEN, "Should transition to OPEN");

    // 3. Pause (OPEN -> PAUSED)
    const paused = await jobService.pauseJob(draftJob.id, contextRecruiterA1);
    assert(paused.status === JobStatus.PAUSED, "Should transition to PAUSED");

    // 4. Reopen (PAUSED -> OPEN)
    const reopened = await jobService.reopenJob(draftJob.id, contextRecruiterA1);
    assert(reopened.status === JobStatus.OPEN, "Should transition to OPEN");

    // 5. Close (OPEN -> CLOSED)
    const closed = await jobService.closeJob(draftJob.id, contextRecruiterA1);
    assert(closed.status === JobStatus.CLOSED, "Should transition to CLOSED");

    // 6. Archive (CLOSED -> ARCHIVED)
    const archived = await jobService.archiveJob(draftJob.id, contextRecruiterA1);
    assert(archived.status === JobStatus.ARCHIVED, "Should transition to ARCHIVED");

    // Verify Read-Only archived job
    await assertThrows(
      async () => await jobService.updateJob(draftJob.id, { title: "Archived Edit" }, contextAdminA),
      Error,
      "Archived jobs are read-only"
    );

    console.log("   -> Success!");

    console.log("\n🎉 All Jobs module integration tests passed successfully!\n");
  } finally {
    // 4. Clean up test database records
    console.log("🧹 Cleaning up seeded test database records...");

    // Find and delete the created job relations
    const jobs = await prisma.job.findMany({
      where: {
        companyId: { in: [companyA.id, companyB.id] },
      },
    });

    const jobIds = jobs.map((j) => j.id);

    await prisma.jobRecruiter.deleteMany({
      where: { jobId: { in: jobIds } },
    });
    await prisma.jobSkill.deleteMany({
      where: { jobId: { in: jobIds } },
    });
    await prisma.job.deleteMany({
      where: { id: { in: jobIds } },
    });

    // Delete Users
    await prisma.user.deleteMany({
      where: {
        id: {
          in: [
            adminAUser.id,
            adminBUser.id,
            recruiterA1User.id,
            recruiterA2User.id,
            recruiterB1User.id,
            superAdminUser.id,
          ],
        },
      },
    });

    // Delete Departments
    await prisma.department.deleteMany({
      where: { id: { in: [deptA.id, deptB.id] } },
    });

    // Delete Companies
    await prisma.company.deleteMany({
      where: { id: { in: [companyA.id, companyB.id] } },
    });

    console.log("🧹 Cleanup Complete.");
  }
}

runTests().catch((error) => {
  console.error("❌ Test run failed with error:", error);
  process.exit(1);
});
