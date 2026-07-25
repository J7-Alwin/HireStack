import "dotenv/config";
import { prisma } from "../src/config/prisma";
import { candidateService } from "../src/modules/candidates/candidate.service";
import {
  Role,
  CandidateStatus,
  SkillProficiency,
  DocumentType,
} from "@prisma/client";
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
  console.log("🚀 Starting Candidate Module Integration Tests...\n");

  // 1. Setup Test Data
  console.log("📦 Seeding test database entities...");

  const companyA = await prisma.company.create({
    data: { name: `Test Candidate Company A ${Date.now()}` },
  });
  const companyB = await prisma.company.create({
    data: { name: `Test Candidate Company B ${Date.now()}` },
  });

  // Seed master skill in catalogue
  const skillObj = await prisma.skill.create({
    data: { name: `Candidate Test Skill ${Date.now()}` },
  });

  // Create Users
  const adminAUser = await prisma.user.create({
    data: {
      email: `cand-adminA-${Date.now()}@test.com`,
      password: "password123",
      role: "COMPANY_ADMIN",
      companyId: companyA.id,
      isActive: true,
    },
  });

  const adminBUser = await prisma.user.create({
    data: {
      email: `cand-adminB-${Date.now()}@test.com`,
      password: "password123",
      role: "COMPANY_ADMIN",
      companyId: companyB.id,
      isActive: true,
    },
  });

  const recruiterA1User = await prisma.user.create({
    data: {
      email: `cand-recA1-${Date.now()}@test.com`,
      password: "password123",
      role: "RECRUITER",
      companyId: companyA.id,
      isActive: true,
    },
  });

  const recruiterA2User = await prisma.user.create({
    data: {
      email: `cand-recA2-${Date.now()}@test.com`,
      password: "password123",
      role: "RECRUITER",
      companyId: companyA.id,
      isActive: true,
    },
  });

  const recruiterB1User = await prisma.user.create({
    data: {
      email: `cand-recB1-${Date.now()}@test.com`,
      password: "password123",
      role: "RECRUITER",
      companyId: companyB.id,
      isActive: true,
    },
  });

  const superAdminUser = await prisma.user.create({
    data: {
      email: `cand-super-${Date.now()}@test.com`,
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

  const _contextRecruiterB1: AuthenticatedUser = {
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
    // TEST 1: Create Candidate Profile
    // ----------------------------------------------------
    console.log("🧪 Test 1: Creating a candidate profile...");
    
    // Required: firstName, lastName, primaryRecruiterId, and email or phone
    const candidate = await candidateService.createCandidate(
      {
        firstName: "John",
        lastName: "Doe",
        email: `johndoe-${Date.now()}@gmail.com`,
        phone: "+15551234",
        primaryRecruiterId: recruiterA1User.id,
      },
      contextAdminA
    );

    assert(candidate.firstName === "John", "Candidate first name should match input");
    assert(candidate.candidateCode.startsWith("CAN-"), "Candidate code should be auto-generated with prefix CAN-");
    assert(candidate.status === CandidateStatus.ACTIVE, "Candidate should default to ACTIVE");
    console.log("   -> Success!");

    // ----------------------------------------------------
    // TEST 2: Duplicate Prevention (Email Check)
    // ----------------------------------------------------
    console.log("🧪 Test 2: Verifying duplicate candidate prevention on email...");
    await assertThrows(
      async () =>
        await candidateService.createCandidate(
          {
            firstName: "Jane",
            lastName: "Doe",
            email: candidate.email!,
            primaryRecruiterId: recruiterA1User.id,
          },
          contextAdminA
        ),
      Error,
      "email address already exists"
    );
    console.log("   -> Success!");

    // ----------------------------------------------------
    // TEST 3: Duplicate Prevention (Phone Check)
    // ----------------------------------------------------
    console.log("🧪 Test 3: Verifying duplicate candidate prevention on phone...");
    await assertThrows(
      async () =>
        await candidateService.createCandidate(
          {
            firstName: "Jane",
            lastName: "Doe",
            phone: candidate.phone!,
            primaryRecruiterId: recruiterA1User.id,
          },
          contextAdminA
        ),
      Error,
      "phone number already exists"
    );
    console.log("   -> Success!");

    // ----------------------------------------------------
    // TEST 4: Recruiter Assignment Rules on Create
    // ----------------------------------------------------
    console.log("🧪 Test 4: Verifying recruiter can only assign to themselves on create...");
    await assertThrows(
      async () =>
        await candidateService.createCandidate(
          {
            firstName: "Jane",
            lastName: "Smith",
            email: `janesmith-${Date.now()}@gmail.com`,
            primaryRecruiterId: recruiterA2User.id, // Trying to assign to another recruiter
          },
          contextRecruiterA1
        ),
      Error,
      "You do not have permission"
    );
    console.log("   -> Success!");

    // ----------------------------------------------------
    // TEST 5: Company Isolation (Read Boundary)
    // ----------------------------------------------------
    console.log("🧪 Test 5: Verifying cross-company candidate read is rejected...");
    await assertThrows(
      async () => await candidateService.getCandidateById(candidate.id, contextAdminB),
      Error,
      "Cross-company access"
    );
    console.log("   -> Success!");

    // ----------------------------------------------------
    // TEST 6: Tag Assignment & Reusability
    // ----------------------------------------------------
    console.log("🧪 Test 6: Verifying Tag assignment...");
    const candWithTag = await candidateService.assignTag(candidate.id, "Immediate-Joiner", contextRecruiterA1);
    assert(candWithTag.tags.length === 1, "Candidate should have 1 tag assigned");
    assert(candWithTag.tags[0].tag.name === "immediate-joiner", "Tag name should be lowercased");
    
    console.log("🧪 Test 6b: Verifying Tag removal...");
    const candRemovedTag = await candidateService.removeTag(candidate.id, candWithTag.tags[0].tag.id, contextRecruiterA1);
    assert(candRemovedTag.tags.length === 0, "Candidate tag should be removed");
    console.log("   -> Success!");

    // ----------------------------------------------------
    // TEST 7: Skill Management
    // ----------------------------------------------------
    console.log("🧪 Test 7: Assigning and updating skills...");
    const candWithSkill = await candidateService.addSkill(
      candidate.id,
      {
        skillId: skillObj.id,
        proficiency: SkillProficiency.ADVANCED,
        experienceYears: 4,
        isPrimary: true,
      },
      contextRecruiterA1
    );
    assert(candWithSkill.skills.length === 1, "Should have 1 assigned skill");
    assert(candWithSkill.skills[0].proficiency === SkillProficiency.ADVANCED, "Skill proficiency should match input");

    // Update skill details
    const updatedSkillCand = await candidateService.updateSkill(
      candidate.id,
      skillObj.id,
      {
        proficiency: SkillProficiency.EXPERT,
        experienceYears: 5,
        isPrimary: true,
      },
      contextRecruiterA1
    );
    assert(updatedSkillCand.skills[0].proficiency === SkillProficiency.EXPERT, "Skill proficiency should be updated");
    console.log("   -> Success!");

    // ----------------------------------------------------
    // TEST 8: Education CRUD
    // ----------------------------------------------------
    console.log("🧪 Test 8: Adding education record...");
    const candWithEdu = await candidateService.addEducation(
      candidate.id,
      {
        degree: "Bachelor of Science",
        institution: "State University",
        graduationYear: 2022,
        isHighest: true,
      },
      contextRecruiterA1
    );
    assert(candWithEdu.education.length === 1, "Should have 1 education record");

    // Update education
    const eduId = candWithEdu.education[0].id;
    const candWithUpdatedEdu = await candidateService.updateEducation(
      candidate.id,
      eduId,
      {
        university: "Main Campus University System",
      },
      contextRecruiterA1
    );
    assert(candWithUpdatedEdu.education[0].university === "Main Campus University System", "Education university should be updated");
    console.log("   -> Success!");

    // ----------------------------------------------------
    // TEST 9: Experience CRUD
    // ----------------------------------------------------
    console.log("🧪 Test 9: Adding experience record...");
    const candWithExp = await candidateService.addExperience(
      candidate.id,
      {
        company: "ACME Corp",
        designation: "Software Developer",
        startDate: new Date("2022-06-01").toISOString(),
        isCurrent: true,
      },
      contextRecruiterA1
    );
    assert(candWithExp.experience.length === 1, "Should have 1 experience record");
    console.log("   -> Success!");

    // ----------------------------------------------------
    // TEST 10: Document Management (Resume Replacement)
    // ----------------------------------------------------
    console.log("🧪 Test 10: Adding multiple resumes and checking replacement...");
    const resume1 = await candidateService.addDocument(
      candidate.id,
      {
        fileName: "resume_v1.pdf",
        fileUrl: "https://storage.hirestack.com/resumes/resume_v1.pdf",
        fileKey: "resume_v1_key",
        documentType: DocumentType.RESUME,
      },
      contextRecruiterA1
    );
    assert(resume1.documents[0].isActive === true, "First resume must start active");

    const _resume2 = await candidateService.addDocument(
      candidate.id,
      {
        fileName: "resume_v2.pdf",
        fileUrl: "https://storage.hirestack.com/resumes/resume_v2.pdf",
        fileKey: "resume_v2_key",
        documentType: DocumentType.RESUME,
      },
      contextRecruiterA1
    );

    // Fetch refreshed list
    const candidateRefreshed = await candidateService.getCandidateById(candidate.id, contextRecruiterA1);
    const doc1 = candidateRefreshed.documents.find((d) => d.fileName === "resume_v1.pdf");
    const doc2 = candidateRefreshed.documents.find((d) => d.fileName === "resume_v2.pdf");
    
    assert(doc1?.isActive === false, "First resume should have been marked inactive");
    assert(doc2?.isActive === true, "Second resume should be active");
    console.log("   -> Success!");

    // ----------------------------------------------------
    // TEST 11: Note Management (Author Bounds)
    // ----------------------------------------------------
    console.log("🧪 Test 11: Adding recruiter note...");
    const note = await candidateService.addNote(
      candidate.id,
      { content: "Excellent interview performance!" },
      contextRecruiterA1
    );
    assert(note.content === "Excellent interview performance!", "Note content matches");
    assert(note.author.id === recruiterA1User.id, "Note author should be Recruiter A1");

    console.log("🧪 Test 11b: Verifying only author (or admin) can modify notes...");
    await assertThrows(
      async () =>
        await candidateService.updateNote(
          candidate.id,
          note.id,
          { content: "Malicious note edit attempt" },
          contextRecruiterA2 // Recruiter A2 is not the author
        ),
      Error,
      "modify notes authored by yourself"
    );
    console.log("   -> Success!");

    // ----------------------------------------------------
    // TEST 12: SUPER_ADMIN fully blocked
    // ----------------------------------------------------
    console.log("🧪 Test 12: Verifying SUPER_ADMIN is fully blocked...");
    await assertThrows(
      async () => await candidateService.getCandidateById(candidate.id, contextSuperAdmin),
      Error,
      "You do not have permission to perform this action"
    );
    await assertThrows(
      async () => await candidateService.listCandidates({}, contextSuperAdmin),
      Error,
      "You do not have permission to perform this action"
    );
    console.log("   -> Success!");

    // ----------------------------------------------------
    // TEST 13: Blacklisted Candidates and Archival Guards
    // ----------------------------------------------------
    console.log("🧪 Test 13: Verifying transition rules for BLACKLISTED status...");
    
    // Admin A blacklists the candidate
    const blacklisted = await candidateService.updateCandidate(
      candidate.id,
      { status: CandidateStatus.BLACKLISTED },
      contextAdminA
    );
    assert(blacklisted.status === CandidateStatus.BLACKLISTED, "Status is now BLACKLISTED");

    // Recruiter tries to active candidate, rejected
    await assertThrows(
      async () =>
        await candidateService.updateCandidate(
          candidate.id,
          { status: CandidateStatus.ACTIVE },
          contextRecruiterA1
        ),
      Error,
      "explicit administrator action"
    );

    // Admin A can restore from blacklist
    const reactivated = await candidateService.updateCandidate(
      candidate.id,
      { status: CandidateStatus.ACTIVE },
      contextAdminA
    );
    assert(reactivated.status === CandidateStatus.ACTIVE, "Reactivated back to ACTIVE by admin");
    console.log("   -> Success!");

    // ----------------------------------------------------
    // TEST 14: Soft Delete and Restore
    // ----------------------------------------------------
    console.log("🧪 Test 14: Verifying soft delete and restore...");
    const deleted = await candidateService.softDeleteCandidate(candidate.id, contextAdminA);
    assert(deleted.isActive === false, "Candidate isActive flag set to false on delete");
    assert(deleted.status === CandidateStatus.ARCHIVED, "Soft deleted candidates status set to ARCHIVED");

    // Cannot read candidate under standard findById
    await assertThrows(
      async () => await candidateService.getCandidateById(candidate.id, contextAdminA),
      Error,
      "Candidate not found"
    );

    // Restore candidate
    const restored = await candidateService.restoreCandidate(candidate.id, contextAdminA);
    assert(restored.isActive === true, "Candidate isActive flag restored to true");
    assert(restored.status === CandidateStatus.ACTIVE, "Re-activated status set to ACTIVE on restore");
    console.log("   -> Success!");

    console.log("\n🎉 All Candidate Module integration tests passed successfully!\n");
  } finally {
    console.log("🧹 Cleaning up seeded test database records...");

    // Find all test candidate IDs in company A/B
    const candidates = await prisma.candidate.findMany({
      where: {
        companyId: { in: [companyA.id, companyB.id] },
      },
    });
    const candIds = candidates.map((c) => c.id);

    // Delete nested relations
    await prisma.candidateSkill.deleteMany({
      where: { candidateId: { in: candIds } },
    });
    await prisma.candidateEducation.deleteMany({
      where: { candidateId: { in: candIds } },
    });
    await prisma.candidateExperience.deleteMany({
      where: { candidateId: { in: candIds } },
    });
    await prisma.candidateDocument.deleteMany({
      where: { candidateId: { in: candIds } },
    });
    await prisma.candidateNote.deleteMany({
      where: { candidateId: { in: candIds } },
    });
    await prisma.candidateTag.deleteMany({
      where: { candidateId: { in: candIds } },
    });

    // Delete Candidates
    await prisma.candidate.deleteMany({
      where: { id: { in: candIds } },
    });

    // Delete Tags
    await prisma.tag.deleteMany({
      where: { companyId: { in: [companyA.id, companyB.id] } },
    });

    // Delete users
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

    // Delete Skill
    await prisma.skill.delete({
      where: { id: skillObj.id },
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
