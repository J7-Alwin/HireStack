import "dotenv/config";
import { prisma } from "../src/config/prisma";
import { atsScoreService } from "../src/modules/ai/services/ats-score.service";
import { aiService } from "../src/modules/ai/services/ai.service";
import { candidateService } from "../src/modules/candidates/candidate.service";
import { jobService } from "../src/modules/jobs/job.service";
import { Role, SkillProficiency, DocumentType, EmploymentType, WorkplaceType } from "@prisma/client";
import { AuthenticatedUser } from "../src/shared/types";
import { AccountStatus } from "../src/shared/enums/status.enum";
import { ValidationError, NotFoundError } from "../src/shared/errors";

// Standard assertion helper
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
    console.log("🚀 Starting ATS Score Engine Integration Tests...\n");

    // Mock AI Service to run tests offline/deterministically
    const originalGenerate = aiService.generate;
    aiService.generate = async (prompt: string) => {
        return {
            content: JSON.stringify({
                overallScore: 85,
                skillScore: 90,
                experienceScore: 80,
                educationScore: 75,
                keywordScore: 88,
                certificationScore: 70,
                strengths: ["Strong backend developer", "Experienced in TypeScript"],
                weaknesses: ["No cloud experience"],
                missingSkills: ["AWS"],
                recommendations: ["Learn AWS"],
                hiringRecommendation: "Recommended",
            }),
            responseTime: 100,
        };
    };

    // Setup Test Data
    const company = await prisma.company.create({
        data: { name: `ATS Test Company ${Date.now()}` },
    });

    const dept = await prisma.department.create({
        data: { name: `ATS Test Department ${Date.now()}`, companyId: company.id, isActive: true },
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
        data: { name: `ATS Score Test Skill ${Date.now()}` },
    });

    // Create a candidate WITH a parsed resume (via manual candidate service creation logic simulating parseResume results)
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

    // Create a candidate WITHOUT a resume
    const candidateWithoutResume = await candidateService.createCandidate(
        {
            firstName: "Jane",
            lastName: "Smith",
            email: `jane.smith-${Date.now()}@gmail.com`,
            phone: `+1234568${Math.floor(Math.random() * 1000)}`,
            primaryRecruiterId: recruiterUser.id,
            skills: [],
            education: [],
            experience: [],
            documents: [],
        },
        contextAdmin
    );

    try {
        // Test Case 1: Match Valid Candidate and Job
        console.log("🧪 Test Case 1: Match Candidate WITH Resume to Job");
        const report = await atsScoreService.calculateATSScore(
            {
                candidateId: candidateWithResume.id,
                jobId: job.id,
            },
            contextRecruiter
        );
        assert(report.overallScore === 85, "Overall score should be 85");
        assert(report.hiringRecommendation === "Recommended", "Should recommend candidate");
        console.log("   ✅ Match succeeded.");

        // Test Case 2: Save to DB Verification
        console.log("🧪 Test Case 2: Verify Score is Saved in DB");
        const dbScore = await prisma.aTSScore.findFirst({
            where: { candidateId: candidateWithResume.id, jobId: job.id },
        });
        assert(dbScore !== null, "Score record should exist in DB");
        assert(dbScore?.overallScore === 85, "DB overall score should match");
        assert((dbScore?.strengths as string[]).includes("Strong backend developer"), "DB strengths should match");
        console.log("   ✅ DB persistence verified.");

        // Test Case 3: Resume Missing Validation
        console.log("🧪 Test Case 3: Match Candidate WITHOUT Resume");
        await assertThrows(
            async () => {
                await atsScoreService.calculateATSScore(
                    {
                        candidateId: candidateWithoutResume.id,
                        jobId: job.id,
                    },
                    contextRecruiter
                );
            },
            ValidationError,
            "Candidate resume is missing"
        );
        console.log("   ✅ Resume validation verified.");

        // Test Case 4: Candidate Not Found Validation
        console.log("🧪 Test Case 4: Invalid Candidate ID");
        await assertThrows(
            async () => {
                await atsScoreService.calculateATSScore(
                    {
                        candidateId: "clxyz00000000000000000000",
                        jobId: job.id,
                    },
                    contextRecruiter
                );
            },
            NotFoundError,
            "Candidate not found"
        );
        console.log("   ✅ Candidate not found validation verified.");

        // Test Case 5: Job Not Found Validation
        console.log("🧪 Test Case 5: Invalid Job ID");
        await assertThrows(
            async () => {
                await atsScoreService.calculateATSScore(
                    {
                        candidateId: candidateWithResume.id,
                        jobId: "clxyz00000000000000000001",
                    },
                    contextRecruiter
                );
            },
            NotFoundError,
            "Job not found"
        );
        console.log("   ✅ Job not found validation verified.");

    } finally {
        // Restore AI Service
        aiService.generate = originalGenerate;

        // Cleanup seeded data
        console.log("\n🧹 Cleaning up test database data...");
        await prisma.aTSScore.deleteMany({
            where: { jobId: job.id },
        });
        await prisma.candidateDocument.deleteMany({
            where: { candidateId: { in: [candidateWithResume.id, candidateWithoutResume.id] } },
        });
        await prisma.candidate.deleteMany({
            where: { id: { in: [candidateWithResume.id, candidateWithoutResume.id] } },
        });
        await prisma.job.delete({
            where: { id: job.id },
        });
        await prisma.skill.delete({
            where: { id: skillObj.id },
        });
        await prisma.user.deleteMany({
            where: { id: { in: [recruiterUser.id, adminUser.id] } },
        });
        await prisma.department.delete({
            where: { id: dept.id },
        });
        await prisma.company.delete({
            where: { id: company.id },
        });
        console.log("   ✅ Cleanup done.");
    }

    console.log("\n🎉 All ATS Score Engine Integration Tests Passed!\n");
}

runTests().catch((err) => {
    console.error("❌ Test run failed with error:", err);
    process.exit(1);
});
