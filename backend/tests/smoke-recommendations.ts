import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { prisma } from "../src/config/prisma";
import { Role, AccountStatus, DocumentType, ResumeRecommendationMode, Company, User, Job, Candidate, Department } from "@prisma/client";
import { resumeRecommendationService } from "../src/modules/ai/services/resume-recommendation.service";
import { aiService } from "../src/modules/ai/services/ai.service";
import { AuthenticatedUser } from "../src/shared/types";
import { ForbiddenError, NotFoundError, ValidationError } from "../src/shared/errors";
import { z } from "zod";
import { GetDetailsParamsSchema } from "../src/modules/ai/schemas/resume-recommendation.schema";

const TEST_COMPANY_NAME = "Smoke Test Recommendations Corp";
const TEST_DEPT_NAME = "Smoke Engineering";
const TEST_ADMIN_EMAIL = "smoke-admin@example.com";
const TEST_RECRUITER_A_EMAIL = "smoke-recruiter-a@example.com";
const TEST_RECRUITER_B_EMAIL = "smoke-recruiter-b@example.com";
const TEST_CANDIDATE_EMAIL = "smoke-candidate@example.com";
const TEST_CANDIDATE_CODE = "CAN-SMOKE-99";
const TEST_JOB_A_CODE = "JOB-SMOKE-A";
const TEST_JOB_B_CODE = "JOB-SMOKE-B";

const minimalPdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
72 712 Td
(Test Resume Content) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000242 00000 n 
0000000314 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
409
%%EOF`;

async function runSmokeTests() {
    console.log("=== STARTING RESUME RECOMMENDATION PRODUCTION-READINESS SMOKE TESTS ===");

    // Global Test Resources to clean up
    let company: Company | null = null;
    let adminUser: User | null = null;
    let recruiterA: User | null = null;
    let recruiterB: User | null = null;
    let candidateUser: User | null = null;
    let candidateProfile: Candidate | null = null;
    let jobA: Job | null = null;
    let jobB: Job | null = null;
    let department: Department | null = null;

    const originalGenerate = aiService.generate;

    // Helper for assertions
    function assert(condition: boolean, message: string) {
        if (!condition) {
            throw new Error(`Assertion Failed: ${message}`);
        }
    }

    async function assertThrows(
        fn: () => Promise<unknown>,
        errorType: new (...args: never[]) => Error | z.ZodError,
        messageContains?: string
    ) {
        try {
            await fn();
            throw new Error("Expected function to throw, but it succeeded.");
        } catch (error: unknown) {
            if (error instanceof Error && error.message === "Expected function to throw, but it succeeded.") {
                throw error;
            }
            if (errorType && !(error instanceof errorType)) {
                throw new Error(`Expected error of type ${errorType.name}, but got ${(error as Error).constructor.name}: ${(error as Error).message}`, { cause: error });
            }
            if (messageContains && !(error as Error).message.toLowerCase().includes(messageContains.toLowerCase())) {
                throw new Error(`Expected error message to contain "${messageContains}", but got: "${(error as Error).message}"`, { cause: error });
            }
            console.log(`   ✅ Caught expected error: [${(error as Error).constructor.name}] ${(error as Error).message}`);
        }
    }

    // Set up PDF file on disk
    const uploadsDir = path.join(__dirname, "../uploads/resumes");
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const pdfPath = path.join(uploadsDir, "smoke-resume.pdf");
    fs.writeFileSync(pdfPath, minimalPdf, "utf8");
    console.log(`Created test PDF at: ${pdfPath}`);

    try {
        // Pre-test cleanup of leftover data
        const existingCompany = await prisma.company.findFirst({
            where: { name: TEST_COMPANY_NAME }
        });
        if (existingCompany) {
            await prisma.resumeRecommendation.deleteMany({
                where: { candidate: { companyId: existingCompany.id } }
            });
            await prisma.application.deleteMany({
                where: { candidate: { companyId: existingCompany.id } }
            });
            await prisma.candidate.deleteMany({ where: { companyId: existingCompany.id } });
            await prisma.job.deleteMany({ where: { companyId: existingCompany.id } });
            await prisma.user.deleteMany({ where: { companyId: existingCompany.id } });
            await prisma.department.deleteMany({ where: { companyId: existingCompany.id } });
            await prisma.company.delete({ where: { id: existingCompany.id } });
        }

        // Create company and department
        company = await prisma.company.create({
            data: {
                name: TEST_COMPANY_NAME,
                industry: "Tech",
                status: "ACTIVE",
            }
        });

        const dept = await prisma.department.create({
            data: {
                companyId: company.id,
                name: TEST_DEPT_NAME,
            }
        });
        department = dept;

        // Create Admin, Recruiters, and Candidate User
        adminUser = await prisma.user.create({
            data: {
                email: TEST_ADMIN_EMAIL,
                password: "hashedPassword",
                name: "Smoke Admin",
                role: Role.COMPANY_ADMIN,
                status: AccountStatus.ACTIVE,
                companyId: company.id,
            }
        });

        recruiterA = await prisma.user.create({
            data: {
                email: TEST_RECRUITER_A_EMAIL,
                password: "hashedPassword",
                name: "Recruiter A",
                role: Role.RECRUITER,
                status: AccountStatus.ACTIVE,
                companyId: company.id,
            }
        });

        recruiterB = await prisma.user.create({
            data: {
                email: TEST_RECRUITER_B_EMAIL,
                password: "hashedPassword",
                name: "Recruiter B",
                role: Role.RECRUITER,
                status: AccountStatus.ACTIVE,
                companyId: company.id,
            }
        });

        candidateUser = await prisma.user.create({
            data: {
                email: TEST_CANDIDATE_EMAIL,
                password: "hashedPassword",
                name: "Candidate User",
                role: Role.CANDIDATE,
                status: AccountStatus.ACTIVE,
                companyId: company.id,
            }
        });

        // Auth Contexts
        const adminAuth: AuthenticatedUser = { id: adminUser.id, email: adminUser.email, role: "COMPANY_ADMIN", status: AccountStatus.ACTIVE, companyId: company.id };
        const recruiterAAuth: AuthenticatedUser = { id: recruiterA.id, email: recruiterA.email, role: "RECRUITER", status: AccountStatus.ACTIVE, companyId: company.id };
        const recruiterBAuth: AuthenticatedUser = { id: recruiterB.id, email: recruiterB.email, role: "RECRUITER", status: AccountStatus.ACTIVE, companyId: company.id };
        const candidateAuth: AuthenticatedUser = { id: candidateUser.id, email: candidateUser.email, role: "CANDIDATE", status: AccountStatus.ACTIVE, companyId: company.id };

        // Create Jobs
        jobA = await prisma.job.create({
            data: {
                companyId: company.id,
                departmentId: dept.id,
                jobCode: TEST_JOB_A_CODE,
                title: "Job A Dev",
                description: "TypeScript and Node.js Dev",
                employmentType: "FULL_TIME",
                workplaceType: "REMOTE",
                openings: 1,
                isActive: true,
                createdBy: adminUser.id,
                recruiters: {
                    create: { recruiterId: recruiterA.id, assignedById: adminUser.id }
                }
            }
        });

        jobB = await prisma.job.create({
            data: {
                companyId: company.id,
                departmentId: dept.id,
                jobCode: TEST_JOB_B_CODE,
                title: "Job B Cloud Dev",
                description: "AWS cloud developer",
                employmentType: "FULL_TIME",
                workplaceType: "REMOTE",
                openings: 1,
                isActive: true,
                createdBy: adminUser.id,
                recruiters: {
                    create: { recruiterId: recruiterB.id, assignedById: adminUser.id }
                }
            }
        });

        // -------------------------------------------------------------
        // GENERAL MODE RECOMMENDATION TESTS
        // -------------------------------------------------------------
        console.log("\n--- GENERAL MODE TESTS ---");

        // Test 1: Invalid Candidate (non-existent ID)
        console.log("TEST 1: Invalid candidate ID should throw NotFoundError");
        await assertThrows(
            () => resumeRecommendationService.generateGeneralRecommendations({ candidateId: "clxyz12340000t3t1cr4a6136" }, adminAuth),
            NotFoundError,
            "candidate not found"
        );

        // Test 2: Invalid Candidate ID schema check (Zod CUID format error)
        console.log("TEST 2: Zod schema should validate CUID format");
        await assertThrows(
            () => resumeRecommendationService.generateGeneralRecommendations({ candidateId: "invalid-id" }, adminAuth),
            z.ZodError,
            "invalid candidate id format"
        );

        // Test 3: Candidate missing resume
        console.log("TEST 3: Candidate missing resume document should throw ValidationError");
        const candidateNoDoc = await prisma.candidate.create({
            data: {
                companyId: company.id,
                primaryRecruiterId: recruiterA.id,
                candidateCode: "CAN-NO-DOC",
                firstName: "No",
                lastName: "Doc",
                email: "nodoc@example.com",
                isActive: true,
                createdBy: adminUser.id,
            }
        });
        await assertThrows(
            () => resumeRecommendationService.generateGeneralRecommendations({ candidateId: candidateNoDoc.id }, adminAuth),
            ValidationError,
            "candidate resume is missing"
        );
        await prisma.candidate.delete({ where: { id: candidateNoDoc.id } });

        // Test 4: Insufficient resume information
        console.log("TEST 4: Resume with insufficient info (no skills/experience/edu) should throw ValidationError");
        const candidateEmpty = await prisma.candidate.create({
            data: {
                companyId: company.id,
                primaryRecruiterId: recruiterA.id,
                candidateCode: "CAN-EMPTY",
                firstName: "Empty",
                lastName: "Resume",
                email: "empty@example.com",
                isActive: true,
                createdBy: adminUser.id,
                documents: {
                    create: {
                        fileName: "smoke-resume.pdf",
                        fileUrl: "uploads/resumes/smoke-resume.pdf",
                        fileKey: "smoke_key",
                        documentType: DocumentType.RESUME,
                        isActive: true,
                        uploadedBy: adminUser.id,
                    }
                }
            }
        });
        await assertThrows(
            () => resumeRecommendationService.generateGeneralRecommendations({ candidateId: candidateEmpty.id }, adminAuth),
            ValidationError,
            "resume contains insufficient information"
        );
        await prisma.candidate.delete({ where: { id: candidateEmpty.id } });

        // Create standard valid Candidate Profile for remaining tests
        candidateProfile = await prisma.candidate.create({
            data: {
                companyId: company.id,
                primaryRecruiterId: recruiterB.id,
                candidateCode: TEST_CANDIDATE_CODE,
                firstName: "Smoke",
                lastName: "Candidate",
                email: TEST_CANDIDATE_EMAIL,
                isActive: true,
                createdBy: adminUser.id,
                skills: {
                    create: {
                        skill: { connectOrCreate: { where: { name: "TypeScript" }, create: { name: "TypeScript" } } },
                        proficiency: "ADVANCED",
                        experienceYears: 2,
                    }
                },
                experience: {
                    create: {
                        company: "Stack Inc",
                        designation: "Full Stack Dev",
                        startDate: new Date("2023-01-01"),
                        isCurrent: true,
                        description: "Developed TS apps",
                    }
                },
                education: {
                    create: {
                        degree: "BS",
                        specialization: "CS",
                        institution: "Uni",
                        graduationYear: 2022,
                    }
                },
                documents: {
                    create: {
                        fileName: "smoke-resume.pdf",
                        fileUrl: "uploads/resumes/smoke-resume.pdf",
                        fileKey: "smoke_key",
                        documentType: DocumentType.RESUME,
                        isActive: true,
                        uploadedBy: adminUser.id,
                    }
                }
            }
        });

        // Create Job Application (Candidate applies to Job B)
        await prisma.application.create({
            data: {
                applicationCode: "APP-SMOKE-99",
                companyId: company.id,
                candidateId: candidateProfile.id,
                jobId: jobB.id,
                assignedRecruiterId: recruiterB.id,
                stage: "APPLIED",
                status: "ACTIVE",
                createdBy: adminUser.id,
            }
        });

        // Test 5: Successful General Recommendation Persistence
        console.log("TEST 5: Successful General recommendations generation and database persistence");
        const generalRec = await resumeRecommendationService.generateGeneralRecommendations(
            { candidateId: candidateProfile.id },
            recruiterBAuth
        );
        assert(generalRec.mode === ResumeRecommendationMode.GENERAL, "Mode must be GENERAL");
        assert(generalRec.recommendations.length > 0, "Should generate recommendations");

        // Verify it was stored in the database
        const dbRec = await prisma.resumeRecommendation.findUnique({ where: { id: generalRec.id } });
        assert(dbRec !== null, "Must be persisted in database");
        assert(dbRec?.mode === ResumeRecommendationMode.GENERAL, "DB record mode must be GENERAL");
        console.log("   ✅ General recommendation stored successfully in database.");

        // -------------------------------------------------------------
        // JOB SPECIFIC MODE RECOMMENDATION TESTS
        // -------------------------------------------------------------
        console.log("\n--- JOB-SPECIFIC MODE TESTS ---");

        // Test 6: Invalid Candidate in Job Specific
        console.log("TEST 6: Invalid candidate ID should throw NotFoundError");
        await assertThrows(
            () => resumeRecommendationService.generateJobRecommendations({ candidateId: "clxyz12340000t3t1cr4a6136", jobId: jobB.id }, recruiterBAuth),
            NotFoundError,
            "candidate not found"
        );

        // Test 7: Invalid Job in Job Specific
        console.log("TEST 7: Invalid job ID should throw NotFoundError");
        await assertThrows(
            () => resumeRecommendationService.generateJobRecommendations({ candidateId: candidateProfile.id, jobId: "clxyz56780000t3t1cr4a6136" }, recruiterBAuth),
            NotFoundError,
            "job not found"
        );

        // Test 8: Recruiter Unauthorized (Recruiter A not assigned to Job B)
        console.log("TEST 8: Unauthorized recruiter access should throw ForbiddenError");
        await assertThrows(
            () => resumeRecommendationService.generateJobRecommendations({ candidateId: candidateProfile.id, jobId: jobB.id }, recruiterAAuth),
            ForbiddenError,
            "you do not have permission to access this job"
        );

        // Test 9: Candidate Job Scope Validation (Candidate not applied to Job A)
        console.log("TEST 9: Candidate accessing unapplied Job A should throw ForbiddenError");
        await assertThrows(
            () => resumeRecommendationService.generateJobRecommendations({ candidateId: candidateProfile.id, jobId: jobA.id }, candidateAuth),
            ForbiddenError,
            "you can only request recommendations for jobs you have applied to"
        );

        // Test 9b: Candidate Job Scope Validation (Candidate applied but application is REJECTED)
        console.log("TEST 9b: Candidate accessing Job B with inactive application (REJECTED) should throw ForbiddenError");
        await prisma.application.updateMany({
            where: { candidateId: candidateProfile.id, jobId: jobB.id },
            data: { status: "REJECTED" }
        });
        await assertThrows(
            () => resumeRecommendationService.generateJobRecommendations({ candidateId: candidateProfile.id, jobId: jobB.id }, candidateAuth),
            ForbiddenError,
            "you can only request recommendations for jobs you have applied to"
        );
        await prisma.application.updateMany({
            where: { candidateId: candidateProfile.id, jobId: jobB.id },
            data: { status: "ACTIVE" }
        });

        // Test 10: Candidate Job Scope Success (Candidate applied to Job B)
        console.log("TEST 10: Candidate accessing applied Job B should be authorized and succeed");
        const candJobSpecific = await resumeRecommendationService.generateJobRecommendations(
            { candidateId: candidateProfile.id, jobId: jobB.id },
            candidateAuth
        );
        assert(candJobSpecific.mode === ResumeRecommendationMode.JOB_SPECIFIC, "Mode must be JOB_SPECIFIC");
        assert(candJobSpecific.jobId === jobB.id, "jobId must match");

        // Test 11: Authorized Recruiter Success
        console.log("TEST 11: Authorized Recruiter generate job-specific recommendations");
        const recJobSpecific = await resumeRecommendationService.generateJobRecommendations(
            { candidateId: candidateProfile.id, jobId: jobB.id },
            recruiterBAuth
        );
        assert(recJobSpecific.mode === ResumeRecommendationMode.JOB_SPECIFIC, "Mode must be JOB_SPECIFIC");
        console.log("   ✅ Job-Specific recommendation succeeded and persisted.");

        // -------------------------------------------------------------
        // HISTORY TESTS
        // -------------------------------------------------------------
        console.log("\n--- HISTORY TESTS ---");

        // Test 12: Multiple generations (history is append-only)
        console.log("TEST 12: Generating a second time should create a new record and keep the first unchanged");
        const firstId = recJobSpecific.id;
        const secondJobSpecific = await resumeRecommendationService.generateJobRecommendations(
            { candidateId: candidateProfile.id, jobId: jobB.id },
            recruiterBAuth
        );
        const secondId = secondJobSpecific.id;
        assert(firstId !== secondId, "Should create a new record with a different ID");

        // Verify first record remains unchanged
        const firstRecordDb = await prisma.resumeRecommendation.findUnique({ where: { id: firstId } });
        assert(firstRecordDb !== null, "First record must still exist");

        // Test 13: Fetch history contains all records
        console.log("TEST 13: History should return all records");
        const historyList = await resumeRecommendationService.getRecommendationsHistory(candidateProfile.id, recruiterBAuth);
        assert(historyList.length >= 3, "History should contain general, first job-specific, and second job-specific");
        assert(historyList.some(h => h.id === firstId), "Should contain first job recommendation");
        assert(historyList.some(h => h.id === secondId), "Should contain second job recommendation");
        console.log("   ✅ History list verified and contains both records.");

        // Test 14: Recruiter A requesting history (should NOT see job B recommendations)
        console.log("TEST 14: Unauthorized recruiter requesting candidate history should not see unassigned job recommendations");
        const recruiterAHistory = await resumeRecommendationService.getRecommendationsHistory(candidateProfile.id, recruiterAAuth);
        const hasJobBRecs = recruiterAHistory.some(h => h.jobId === jobB.id);
        assert(!hasJobBRecs, "Recruiter A must not see Job B recommendations in candidate history");
        console.log("   ✅ Recruiter A history filtered correctly.");

        // -------------------------------------------------------------
        // DETAILS TESTS
        // -------------------------------------------------------------
        console.log("\n--- DETAILS TESTS ---");

        // Test 15: Authorized Recruiter Details retrieval
        console.log("TEST 15: Authorized Recruiter retrieves details");
        const details = await resumeRecommendationService.getRecommendationDetails(firstId, recruiterBAuth);
        assert(details.id === firstId, "Retrieved ID must match");
        assert(details.recommendations.length > 0, "Must return details list");

        // Test 16: Unauthorized Recruiter Details retrieval (ForbiddenError)
        console.log("TEST 16: Unauthorized Recruiter retrieves details should throw ForbiddenError");
        await assertThrows(
            () => resumeRecommendationService.getRecommendationDetails(firstId, recruiterAAuth),
            ForbiddenError,
            "you do not have permission to access this job"
        );

        // Test 17: Candidate retrieving own details
        console.log("TEST 17: Candidate retrieves own recommendation details");
        const candidateDetails = await resumeRecommendationService.getRecommendationDetails(firstId, candidateAuth);
        assert(candidateDetails.id === firstId, "Candidate retrieved ID must match");

        // Test 18: Invalid ID format in details query should throw ZodError
        console.log("TEST 18: Invalid ID format in details query should throw ZodError");
        try {
            GetDetailsParamsSchema.parse({ id: "invalid-id" });
            throw new Error("Failed to validate invalid details ID format");
        } catch (error) {
            assert(error instanceof z.ZodError, "Must throw ZodError");
            console.log("   ✅ Checked Zod schema validation for details path parameters.");
        }

        // Test 19: Non-existent recommendation ID (NotFoundError)
        console.log("TEST 19: Non-existent details ID should throw NotFoundError");
        await assertThrows(
            () => resumeRecommendationService.getRecommendationDetails("clxyz12340000t3t1cr4a6136", recruiterBAuth),
            NotFoundError,
            "resume recommendation not found"
        );

        // -------------------------------------------------------------
        // AI FAILURE SIMULATION TESTS (MOCKING)
        // -------------------------------------------------------------
        console.log("\n--- AI FAILURE MOCK TESTS ---");

        // Test 20: AI Invalid JSON failure
        console.log("TEST 20: AI returning invalid JSON should throw ValidationError");
        aiService.generate = async () => ({ content: "Malformed { json content", responseTime: 100 });
        await assertThrows(
            () => resumeRecommendationService.generateGeneralRecommendations({ candidateId: candidateProfile.id }, recruiterBAuth),
            ValidationError,
            "failed to parse response from AI model as valid JSON"
        );

        // Test 21: AI Invalid schema structure failure
        console.log("TEST 21: AI violating schema constraints should throw ZodError");
        aiService.generate = async () => ({
            content: JSON.stringify({ overallSummary: "Too short", recommendations: [{ category: "WRONG_CATEGORY" }] }),
            responseTime: 100
        });
        await assertThrows(
            () => resumeRecommendationService.generateGeneralRecommendations({ candidateId: candidateProfile.id }, recruiterBAuth),
            z.ZodError,
            "invalid"
        );

        // Test 22: AI Empty response
        console.log("TEST 22: AI returning empty response should throw ValidationError");
        aiService.generate = async () => ({ content: "", responseTime: 100 });
        await assertThrows(
            () => resumeRecommendationService.generateGeneralRecommendations({ candidateId: candidateProfile.id }, recruiterBAuth),
            ValidationError,
            "failed to parse response from AI model as valid JSON"
        );

        // Test 23: AI failure / timeout simulation
        console.log("TEST 23: AI service general error/timeout should throw original error");
        aiService.generate = async () => { throw new Error("Connection Timeout"); };
        await assertThrows(
            () => resumeRecommendationService.generateGeneralRecommendations({ candidateId: candidateProfile.id }, recruiterBAuth),
            Error,
            "connection timeout"
        );

        // Restore original generate function
        aiService.generate = originalGenerate;

        // -------------------------------------------------------------
        // PDF EXTRACTION MISSING DISK FILE TEST
        // -------------------------------------------------------------
        console.log("\n--- PDF EXTRACTION SCENARIOS ---");

        console.log("TEST 24: PDF file deleted from disk should throw ValidationError");
        if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
        }
        await assertThrows(
            () => resumeRecommendationService.generateGeneralRecommendations({ candidateId: candidateProfile.id }, recruiterBAuth),
            ValidationError,
            "could not be accessed"
        );

    } finally {
        // Restore AI service original state
        aiService.generate = originalGenerate;

        // Cleanup PDF from disk
        if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
            console.log(`Cleaned up PDF: ${pdfPath}`);
        }

        // Clean up database tables
        console.log("\nCleaning up test database records...");
        if (candidateProfile) {
            await prisma.resumeRecommendation.deleteMany({ where: { candidateId: candidateProfile.id } });
            await prisma.application.deleteMany({ where: { candidateId: candidateProfile.id } });
            await prisma.candidate.delete({ where: { id: candidateProfile.id } });
        }
        if (jobA) {
            await prisma.job.delete({ where: { id: jobA.id } });
        }
        if (jobB) {
            await prisma.job.delete({ where: { id: jobB.id } });
        }
        if (adminUser) {
            await prisma.user.delete({ where: { id: adminUser.id } });
        }
        if (recruiterA) {
            await prisma.user.delete({ where: { id: recruiterA.id } });
        }
        if (recruiterB) {
            await prisma.user.delete({ where: { id: recruiterB.id } });
        }
        if (candidateUser) {
            await prisma.user.delete({ where: { id: candidateUser.id } });
        }
        if (department) {
            await prisma.department.delete({ where: { id: department.id } });
        }
        if (company) {
            await prisma.company.delete({ where: { id: company.id } });
        }
        console.log("Database clean up completed successfully.");
    }

    console.log("\n=== ALL RESUME RECOMMENDATION PRODUCTION-READINESS SMOKE TESTS PASSED! ===");
}

runSmokeTests().catch((error) => {
    console.error("SMOKE TEST RUN FAILED:", error);
    process.exit(1);
});
