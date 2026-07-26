import "dotenv/config";
import { prisma } from "../src/config/prisma";
import { ZodError } from "zod";
import { offerService } from "../src/modules/offers/services/offer.service";
import {
  Role,
  OfferStatus,
  Currency,
  EmploymentType,
  JobStatus,
  ApplicationStage,
  ApplicationStatus,
} from "@prisma/client";
import { AuthenticatedUser } from "../src/shared/types";
import {
  ConflictError,
  ForbiddenError,
  ValidationError,
  UnprocessableEntityError,
  NotFoundError,
} from "../src/shared/errors";

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
  console.log("🚀 Starting Offers Module Integration Tests...\n");

  // 1. Setup Test Data
  console.log("📦 Seeding test database entities...");

  const companyA = await prisma.company.create({
    data: { name: `Test Off Company A ${Date.now()}` },
  });
  const companyB = await prisma.company.create({
    data: { name: `Test Off Company B ${Date.now()}` },
  });

  const deptA = await prisma.department.create({
    data: { name: "Engineering A", companyId: companyA.id },
  });

  const adminAUser = await prisma.user.create({
    data: {
      email: `admin.off.a.${Date.now()}@test.com`,
      password: "HashPassword123!",
      role: Role.COMPANY_ADMIN,
      companyId: companyA.id,
      departmentId: deptA.id,
      isActive: true,
    },
  });

  const recruiterA1User = await prisma.user.create({
    data: {
      email: `recruiter1.off.a.${Date.now()}@test.com`,
      password: "HashPassword123!",
      role: Role.RECRUITER,
      companyId: companyA.id,
      departmentId: deptA.id,
      isActive: true,
    },
  });

  const recruiterA2User = await prisma.user.create({
    data: {
      email: `recruiter2.off.a.${Date.now()}@test.com`,
      password: "HashPassword123!",
      role: Role.RECRUITER,
      companyId: companyA.id,
      departmentId: deptA.id,
      isActive: true,
    },
  });

  const recruiterBUser = await prisma.user.create({
    data: {
      email: `recruiter.off.b.${Date.now()}@test.com`,
      password: "HashPassword123!",
      role: Role.RECRUITER,
      companyId: companyB.id,
      isActive: true,
    },
  });

  const authAdminA: AuthenticatedUser = {
    id: adminAUser.id,
    email: adminAUser.email,
    role: Role.COMPANY_ADMIN,
    companyId: companyA.id,
  };

  const authRecruiterA1: AuthenticatedUser = {
    id: recruiterA1User.id,
    email: recruiterA1User.email,
    role: Role.RECRUITER,
    companyId: companyA.id,
  };

  const authRecruiterA2: AuthenticatedUser = {
    id: recruiterA2User.id,
    email: recruiterA2User.email,
    role: Role.RECRUITER,
    companyId: companyA.id,
  };

  const authRecruiterB: AuthenticatedUser = {
    id: recruiterBUser.id,
    email: recruiterBUser.email,
    role: Role.RECRUITER,
    companyId: companyB.id,
  };

  const candidateA = await prisma.candidate.create({
    data: {
      companyId: companyA.id,
      primaryRecruiterId: recruiterA1User.id,
      candidateCode: `CAND-${Date.now()}`,
      firstName: "John",
      lastName: "Doe",
      email: `john.doe.${Date.now()}@example.com`,
      createdBy: recruiterA1User.id,
    },
  });

  const jobA = await prisma.job.create({
    data: {
      companyId: companyA.id,
      departmentId: deptA.id,
      jobCode: `JOB-OFF-${Date.now()}`,
      title: "Backend Engineer",
      description: "Prisma ATS job description",
      employmentType: EmploymentType.FULL_TIME,
      workplaceType: "REMOTE",
      openings: 2,
      visibility: "PUBLIC",
      status: JobStatus.OPEN,
      isActive: true,
      createdBy: adminAUser.id,
    },
  });

  const application1 = await prisma.application.create({
    data: {
      applicationCode: `APP1-${Date.now()}`,
      companyId: companyA.id,
      candidateId: candidateA.id,
      jobId: jobA.id,
      assignedRecruiterId: recruiterA1User.id,
      stage: ApplicationStage.OFFER,
      status: ApplicationStatus.ACTIVE,
      createdBy: recruiterA1User.id,
    },
  });

  const applicationInactive = await prisma.application.create({
    data: {
      applicationCode: `APP2-${Date.now()}`,
      companyId: companyA.id,
      candidateId: candidateA.id,
      jobId: jobA.id,
      assignedRecruiterId: recruiterA1User.id,
      stage: ApplicationStage.REJECTED,
      status: ApplicationStatus.REJECTED,
      createdBy: recruiterA1User.id,
    },
  });

  console.log("Seeding complete. Beginning tests...\n");

  const futureJoinDate = new Date();
  futureJoinDate.setDate(futureJoinDate.getDate() + 30);
  const futureExpiryDate = new Date();
  futureExpiryDate.setDate(futureExpiryDate.getDate() + 15);

  const joinDateStr = futureJoinDate.toISOString();
  const expiryDateStr = futureExpiryDate.toISOString();

  // Test Case 1: Create Offer Draft (Recruiter A1 - assigned)
  console.log("🧪 Test Case 1: Create Offer Draft...");
  const offerDraft = await offerService.createOffer(
    {
      applicationId: application1.id,
      salary: 100000,
      currency: Currency.USD,
      employmentType: EmploymentType.FULL_TIME,
      joiningDate: joinDateStr,
      expiryDate: expiryDateStr,
      notes: "Test Notes text",
      benefits: "Test benefits",
    },
    authRecruiterA1
  );

  assert(offerDraft.status === OfferStatus.DRAFT, "Expected status to be DRAFT");
  assert(offerDraft.version === 1, "Expected version to be 1");
  assert(offerDraft.offerCode.startsWith("OFF-"), "Expected code format to be OFF-xxxxxx");
  console.log(`   -> Success! Code: ${offerDraft.offerCode}`);

  // Test Case 2: Attempt Duplicate Active Offer
  console.log("🧪 Test Case 2: Attempt Duplicate Active Offer...");
  await assertThrows(
    async () => {
      await offerService.createOffer(
        {
          applicationId: application1.id,
          salary: 120000,
          currency: Currency.USD,
          employmentType: EmploymentType.FULL_TIME,
          joiningDate: joinDateStr,
          expiryDate: expiryDateStr,
        },
        authRecruiterA1
      );
    },
    ConflictError,
    "An active offer already exists for this application"
  );
  console.log("   -> Success!");

  // Test Case 3: Attempt Offer on Inactive Application
  console.log("🧪 Test Case 3: Attempt Offer on Inactive Application...");
  await assertThrows(
    async () => {
      await offerService.createOffer(
        {
          applicationId: applicationInactive.id,
          salary: 90000,
          currency: Currency.USD,
          employmentType: EmploymentType.FULL_TIME,
          joiningDate: joinDateStr,
          expiryDate: expiryDateStr,
        },
        authRecruiterA1
      );
    },
    ConflictError,
    "Application is not eligible for offer scheduling"
  );
  console.log("   -> Success!");

  // Test Case 4: Enforce Date Validation Rules
  console.log("🧪 Test Case 4: Enforce Date Validation Rules...");
  const pastDateStr = new Date(Date.now() - 86400000).toISOString();
  // Case A: Joining Date in the past
  await assertThrows(
    async () => {
      await offerService.createOffer(
        {
          applicationId: application1.id,
          salary: 90000,
          currency: Currency.USD,
          employmentType: EmploymentType.FULL_TIME,
          joiningDate: pastDateStr,
          expiryDate: expiryDateStr,
        },
        authRecruiterA1
      );
    },
    ZodError,
    "Joining date cannot be in the past"
  );

  // Case B: Expiry Date after Joining Date
  const badExpiryDate = new Date(futureJoinDate);
  badExpiryDate.setDate(badExpiryDate.getDate() + 5);
  await assertThrows(
    async () => {
      await offerService.createOffer(
        {
          applicationId: application1.id,
          salary: 90000,
          currency: Currency.USD,
          employmentType: EmploymentType.FULL_TIME,
          joiningDate: joinDateStr,
          expiryDate: badExpiryDate.toISOString(),
        },
        authRecruiterA1
      );
    },
    ZodError,
    "Expiry date must be before joining date"
  );
  console.log("   -> Success!");

  // Test Case 5: Role Permissions & Isolation Checks
  console.log("🧪 Test Case 5: Role Permissions & Isolation Checks...");
  // Case A: Cross-company attempt by Recruiter B
  await assertThrows(
    async () => {
      await offerService.getOfferById(offerDraft.id, authRecruiterB);
    },
    ForbiddenError,
    "Cross-company access is not permitted"
  );

  // Case B: Recruiter A2 (not assigned) trying to edit draft
  await assertThrows(
    async () => {
      await offerService.updateDraft(offerDraft.id, { salary: 110000 }, authRecruiterA2);
    },
    ForbiddenError,
    "You do not have permission to modify this offer"
  );
  console.log("   -> Success!");

  // Test Case 6: Edit Draft Offer
  console.log("🧪 Test Case 6: Edit Draft Offer...");
  const updatedOffer = await offerService.updateDraft(
    offerDraft.id,
    { salary: 105000, notes: "Updated Internal Notes" },
    authRecruiterA1
  );
  assert(Number(updatedOffer.salary) === 105000, "Salary update mismatch");
  assert(updatedOffer.notes === "Updated Internal Notes", "Notes update mismatch");

  // Attempting to update immutable fields
  await assertThrows(
    async () => {
      await offerService.updateDraft(
        offerDraft.id,
        { offerCode: "NEWCODE" } as unknown as UpdateOfferInput,
        authRecruiterA1
      );
    },
    ValidationError,
    "Immutable fields cannot be updated"
  );
  console.log("   -> Success!");

  // Test Case 7: Submit for Approval
  console.log("🧪 Test Case 7: Submit for Approval...");
  const submittedOffer = await offerService.submitForApproval(offerDraft.id, authRecruiterA1);
  assert(
    submittedOffer.status === OfferStatus.PENDING_APPROVAL,
    "Expected status PENDING_APPROVAL"
  );

  // Edit draft after submission should fail
  await assertThrows(
    async () => {
      await offerService.updateDraft(offerDraft.id, { salary: 110000 }, authRecruiterA1);
    },
    ConflictError,
    "Only draft offers are editable"
  );
  console.log("   -> Success!");

  // Test Case 8: Approve Offer
  console.log("🧪 Test Case 8: Approve Offer...");
  // Recruiter tries to approve -> forbidden
  await assertThrows(
    async () => {
      await offerService.approveOffer(offerDraft.id, authRecruiterA1);
    },
    ForbiddenError,
    "You do not have permission to perform this action"
  );

  // Admin approves
  const approvedOffer = await offerService.approveOffer(offerDraft.id, authAdminA);
  assert(approvedOffer.status === OfferStatus.APPROVED, "Expected status APPROVED");
  assert(approvedOffer.approvedBy === adminAUser.id, "Expected approvedBy to match admin user ID");
  console.log("   -> Success!");

  // Test Case 9: Send Offer
  console.log("🧪 Test Case 9: Send Offer...");
  // Recruiter tries to send -> forbidden
  await assertThrows(
    async () => {
      await offerService.sendOffer(offerDraft.id, authRecruiterA1);
    },
    ForbiddenError,
    "You do not have permission to perform this action"
  );

  // Admin sends
  const sentOffer = await offerService.sendOffer(offerDraft.id, authAdminA);
  assert(sentOffer.status === OfferStatus.SENT, "Expected status SENT");
  assert(sentOffer.sentAt !== null, "Expected sentAt to be recorded");
  console.log("   -> Success!");

  // Test Case 10: Mark Viewed
  console.log("🧪 Test Case 10: Mark Viewed...");
  const viewedOffer = await offerService.markViewed(offerDraft.id, authRecruiterA1);
  assert(viewedOffer.status === OfferStatus.VIEWED, "Expected status VIEWED");
  assert(viewedOffer.viewedAt !== null, "Expected viewedAt to be recorded");
  console.log("   -> Success!");

  // Test Case 11: Offer Revision on Active (VIEWED) Offer
  console.log("🧪 Test Case 11: Offer Revision on Active (VIEWED) Offer...");
  const revisedOffer = await offerService.createOfferRevision(
    viewedOffer.id,
    {
      applicationId: application1.id,
      salary: 115000,
      currency: Currency.USD,
      employmentType: EmploymentType.FULL_TIME,
      joiningDate: joinDateStr,
      expiryDate: expiryDateStr,
    },
    authRecruiterA1
  );

  assert(revisedOffer.version === 2, "Expected revised version to be 2");
  assert(revisedOffer.offerCode === viewedOffer.offerCode, "Expected same offerCode");
  assert(revisedOffer.status === OfferStatus.DRAFT, "Expected revised status to start as DRAFT");

  // Verify previous offer status became WITHDRAWN (superceded)
  const oldSuperceded = await offerService.getOfferById(viewedOffer.id, authRecruiterA1);
  assert(oldSuperceded.status === OfferStatus.WITHDRAWN, "Expected previous offer to be WITHDRAWN");
  console.log("   -> Success!");

  // Test Case 12: Candidate Response - Accept Offer
  console.log("🧪 Test Case 12: Candidate Response - Accept Offer...");
  // Progress revisedOffer to VIEWED so it can be accepted
  await offerService.submitForApproval(revisedOffer.id, authRecruiterA1);
  await offerService.approveOffer(revisedOffer.id, authAdminA);
  await offerService.sendOffer(revisedOffer.id, authAdminA);
  const revisedViewed = await offerService.markViewed(revisedOffer.id, authRecruiterA1);

  const acceptedOffer = await offerService.acceptOffer(revisedViewed.id, authRecruiterA1);
  assert(acceptedOffer.status === OfferStatus.ACCEPTED, "Expected status ACCEPTED");
  assert(acceptedOffer.respondedAt !== null, "Expected respondedAt to be recorded");

  // Verify accepted offers are immutable (no transitions allowed)
  await assertThrows(
    async () => {
      await offerService.submitForApproval(revisedViewed.id, authRecruiterA1);
    },
    UnprocessableEntityError,
    "Invalid offer status transition"
  );

  // Verify revisions are blocked on accepted offers
  await assertThrows(
    async () => {
      await offerService.createOfferRevision(
        acceptedOffer.id,
        {
          applicationId: application1.id,
          salary: 120000,
          currency: Currency.USD,
          employmentType: EmploymentType.FULL_TIME,
          joiningDate: joinDateStr,
          expiryDate: expiryDateStr,
        },
        authRecruiterA1
      );
    },
    ConflictError,
    "Accepted offers are immutable and cannot be revised"
  );
  console.log("   -> Success!");

  // Test Case 13: List Paginated, Filter, Search, and Sort
  console.log("🧪 Test Case 13: List Paginated, Filter, Search, and Sort...");
  const searchResult = await offerService.listOffers(
    {
      search: "John",
      status: OfferStatus.ACCEPTED,
      sortBy: "salary",
      sortOrder: "desc",
      page: 1,
      limit: 10,
    },
    authRecruiterA1
  );

  assert(searchResult.data.length >= 1, "Expected search results to match John");
  assert(searchResult.meta.total >= 1, "Expected search meta to count matching items");
  console.log("   -> Success!");

  // Test Case 14: Soft Delete Offer
  console.log("🧪 Test Case 14: Soft Delete Offer...");
  // Create a new draft offer to test deletion
  const offerToDelete = await offerService.createOffer(
    {
      applicationId: application1.id,
      salary: 130000,
      currency: Currency.USD,
      employmentType: EmploymentType.FULL_TIME,
      joiningDate: joinDateStr,
      expiryDate: expiryDateStr,
    },
    authRecruiterA1
  );

  // Attempting to delete an ACCEPTED offer should throw ConflictError
  await assertThrows(
    async () => {
      await offerService.softDeleteOffer(acceptedOffer.id, authAdminA);
    },
    ConflictError,
    "Accepted offers are immutable and cannot be deleted"
  );

  // Recruiter tries to delete -> forbidden
  await assertThrows(
    async () => {
      await offerService.softDeleteOffer(offerToDelete.id, authRecruiterA1);
    },
    ForbiddenError,
    "You do not have permission to perform this action"
  );

  // Admin deletes
  await offerService.softDeleteOffer(offerToDelete.id, authAdminA);

  // Fetching deleted offer should fail
  await assertThrows(
    async () => {
      await offerService.getOfferById(offerToDelete.id, authRecruiterA1);
    },
    NotFoundError,
    "Offer not found"
  );
  console.log("   -> Success!");

  console.log("\n🧹 Cleaning up seeded test database records...");
  await prisma.offer.deleteMany({
    where: { companyId: { in: [companyA.id, companyB.id] } },
  });
  await prisma.companyOfferCounter.deleteMany({
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

  console.log("\n🎉 All Offers module integration tests passed successfully!");
}

runTests().catch((error) => {
  console.error("\n❌ Test run failed with error:", error);
  process.exit(1);
});
