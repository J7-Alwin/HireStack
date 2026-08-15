import "dotenv/config";
import { prisma } from "../src/config/prisma";
import { jobMatchingService } from "../src/modules/ai/services/job-matching.service";
import { jobService } from "../src/modules/jobs/job.service";
import { candidateService } from "../src/modules/candidates/candidate.service";
import { aiService } from "../src/modules/ai/services/ai.service";
import {
    Role,
    AccountStatus,
    EmploymentType,
    WorkplaceType,
    DocumentType,
    SkillProficiency,
} from "@prisma/client";
import { AuthenticatedUser } from "../src/shared/types";
import { NotFoundError, ForbiddenError } from "../src/shared/errors";

function assert(condition: boolean, message: string) {
    if (!condition) {
        throw new Error(`Assertion Failed: ${message}`);
    }
}

async function assertThrows(
    fn: () => Promise<unknown>,
    errorClass: new (...args: never[]) => Error,
    expectedMessage?: string
) {
    let threw = false;
    let caughtError: unknown = null;

    try {
        await fn();
    } catch (err: unknown) {
        threw = true;
        caughtError = err;
    }

    if (!threw) {
        throw new Error(`Expected function to throw ${errorClass.name} but it succeeded`);
    }

    const err = caughtError as Error;
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
    console.log("🚀 Starting Job Matching Engine Integration Tests...\n");

    // Mock AI Service to run tests offline/deterministically
    const originalGenerate = aiService.generate;
    aiService.generate = async (_prompt: string) => {
        return {
            content: JSON.stringify({
                matchPercentage: 90,
                skillMatch: 95,
                experienceMatch: 85,
                educationMatch: 80,
                projectMatch: 90,
                keywordMatch: 88,
                strengths: ["Strong experience with TypeScript", "Relevant backend projects"],
                missingSkills: ["Docker", "Kubernetes"],
                overallReason: "Candidate is a strong match for backend responsibilities with solid Node.js and TypeScript skills.",
                recommendation: "STRONGLY_RECOMMENDED"
            }),
            responseTime: 120,
        };
    };

    // Setup Test Data
    const company = await prisma.company.create({
        data: { name: `JobMatch Test Company ${Date.now()}` },
    });

    const dept = await prisma.department.create({
        data: { name: `JobMatch Test Department ${Date.now()}`, companyId: company.id, isActive: true },
    });

    const recruiterUser = await prisma.user.create({
        data: {
            email: `ats-recruiter-${Date.now()}@test.com`,
            password: "password123",
            role: "RECRUITER",
            companyId: company.id,
            isActive: true,
        },
    });

    const adminUser = await prisma.user.create({
        data: {
            email: `ats-admin-${Date.now()}@test.com`,
            password: "password123",
            role: "COMPANY_ADMIN",
            companyId: company.id,
            isActive: true,
        },
    });

    const contextRecruiter: AuthenticatedUser = {
        id: recruiterUser.id,
        email: recruiterUser.email,
        role: Role.RECRUITER,
        status: recruiterUser.status as AccountStatus,
        companyId: company.id,
    };

    const contextAdmin: AuthenticatedUser = {
        id: adminUser.id,
        email: adminUser.email,
        role: Role.COMPANY_ADMIN,
        status: adminUser.status as AccountStatus,
        companyId: company.id,
    };

    // Create a job
    const job = await jobService.createJob(
        {
            title: "Senior Backend Developer",
            description: "We are looking for a Senior Developer with strong backend skills.",
            requirements: "TypeScript, Node.js, databases",
            responsibilities: "Write clean code, design systems",
            departmentId: dept.id,
            employmentType: EmploymentType.FULL_TIME,
            workplaceType: WorkplaceType.ONSITE,
            openings: 1,
            experienceMin: 5,
            experienceMax: 10,
            recruiterIds: [recruiterUser.id],
        },
        contextAdmin
    );

    // Seed a skill in catalogue
    const skillObj = await prisma.skill.create({
        data: { name: `JobMatch Test Skill ${Date.now()}` },
    });

    // Create a candidate WITH a parsed resume
    const candidateWithResume = await candidateService.createCandidate(
        {
            firstName: "John",
            lastName: "Doe",
            email: `john.doe-${Date.now()}@gmail.com`,
            phone: `+1234567${Math.floor(Math.random() * 1000)}`,
            primaryRecruiterId: recruiterUser.id,
            documents: [
                {
                    fileName: "resume.pdf",
                    fileUrl: "https://example.com/uploads/resumes/resume.pdf",
                    fileKey: "resumes/resume.pdf",
                    fileSize: 1000,
                    mimeType: "application/pdf",
                    documentType: DocumentType.RESUME,
                    isActive: true,
                },
            ],
            skills: [
                {
                    skillId: skillObj.id,
                    proficiency: SkillProficiency.INTERMEDIATE,
                }
            ],
            education: [],
            experience: [],
        },
        contextAdmin
    );

    // Create Application
    await prisma.application.create({
        data: {
            applicationCode: `APP-${Date.now()}-1`,
            companyId: company.id,
            candidateId: candidateWithResume.id,
            jobId: job.id,
            assignedRecruiterId: recruiterUser.id,
            stage: "APPLIED",
            status: "ACTIVE",
            createdBy: adminUser.id,
        },
    });

    try {
        // Test Case 1: Generate Job Matching Ranks
        console.log("🧪 Test Case 1: Generate Job Matching ranks for Job");
        const report = await jobMatchingService.generateJobMatching(
            {
                jobId: job.id,
            },
            contextRecruiter
        );
        assert(report.jobId === job.id, "Job ID should match");
        assert(report.totalCandidates === 1, "Total candidates matched should be 1");
        assert(report.matches[0].candidateId === candidateWithResume.id, "Candidate ID should match John Doe");
        assert(report.matches[0].matchPercentage === 90, "Match percentage should be 90");
        assert(report.matches[0].recommendation === "STRONGLY_RECOMMENDED", "Hiring recommendation should be STRONGLY_RECOMMENDED");
        console.log("   ✅ Generate Matching verified.");

        // Test Case 2: Save to DB Verification
        console.log("🧪 Test Case 2: Verify JobMatch is Saved in DB");
        const dbScore = await prisma.jobMatch.findFirst({
            where: { candidateId: candidateWithResume.id, jobId: job.id },
        });
        assert(dbScore !== null, "JobMatch record should exist in DB");
        assert(dbScore?.matchPercentage === 90, "DB match percentage should be 90");
        assert(dbScore?.overallReason.includes("Candidate is a strong match"), "DB overall reason should match");
        assert((dbScore?.strengths as string[]).includes("Strong experience with TypeScript"), "DB strengths should match");
        console.log("   ✅ DB persistence verified.");

        // Test Case 3: Get Job Matching History
        console.log("🧪 Test Case 3: Retrieve Job Matching History");
        const history = await jobMatchingService.getJobMatchingHistory(job.id, contextRecruiter);
        assert(history.length >= 1, "History list should contain at least 1 record");
        assert(history[0].candidateId === candidateWithResume.id, "History record candidate ID should match");
        console.log("   ✅ History retrieval verified.");

        // Test Case 4: Get Candidate Match Details
        console.log("🧪 Test Case 4: Retrieve Detailed Candidate Match Info");
        const details = await jobMatchingService.getCandidateMatchDetails(job.id, candidateWithResume.id, contextRecruiter);
        assert(details.matchPercentage === 90, "Details match percentage should be 90");
        assert(details.recommendation === "STRONGLY_RECOMMENDED", "Details recommendation should be STRONGLY_RECOMMENDED");
        console.log("   ✅ Match details retrieval verified.");

        // Test Case 5: Permissions Check - Access Forbidden for super admin
        console.log("🧪 Test Case 5: Generate Matching with Forbidden User role (Super Admin)");
        const contextSuperAdmin: AuthenticatedUser = {
            id: "super-admin-id",
            email: "superadmin@test.com",
            role: Role.SUPER_ADMIN,
            status: AccountStatus.ACTIVE,
            companyId: company.id,
        };
        await assertThrows(
            async () => {
                await jobMatchingService.generateJobMatching({ jobId: job.id }, contextSuperAdmin);
            },
            ForbiddenError
        );
        console.log("   ✅ Forbidden role access rejected correctly.");

        // Test Case 6: Not Found Validation
        console.log("🧪 Test Case 6: Generate Matching with non-existent job ID");
        await assertThrows(
            async () => {
                await jobMatchingService.generateJobMatching(
                    {
                        jobId: "clxyz00000000000000000000",
                    },
                    contextRecruiter
                );
            },
            NotFoundError,
            "Job not found"
        );
        console.log("   ✅ Job not found validation verified.");

    } finally {
        console.log("\n🧹 Cleaning up test database data...");
        // Cleanup ATS & Job Matches
        await prisma.aTSScore.deleteMany({ where: { jobId: job.id } }).catch(() => {});
        await prisma.jobMatch.deleteMany({ where: { jobId: job.id } });
        await prisma.application.deleteMany({ where: { jobId: job.id } });
        await prisma.candidateDocument.deleteMany({ where: { candidateId: candidateWithResume.id } });
        await prisma.candidateSkill.deleteMany({ where: { candidateId: candidateWithResume.id } });
        await prisma.candidate.deleteMany({ where: { id: candidateWithResume.id } });
        await prisma.jobRecruiter.deleteMany({ where: { jobId: job.id } });
        await prisma.job.delete({ where: { id: job.id } });
        await prisma.skill.delete({ where: { id: skillObj.id } });
        await prisma.user.deleteMany({ where: { id: { in: [recruiterUser.id, adminUser.id] } } });
        await prisma.department.delete({ where: { id: dept.id } });
        await prisma.company.delete({ where: { id: company.id } });
        console.log("   ✅ Cleanup done.");
    }

    // Restore original generate
    aiService.generate = originalGenerate;

    console.log("\n🎉 All Job Matching Engine Integration Tests Passed!");
}

runTests().catch((err) => {
    console.error("\n❌ Test run failed with error:", err);
    process.exit(1);
});
