import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { prisma } from "../src/config/prisma";
import { Role, AccountStatus, DocumentType, InterviewAssistantMode, ApplicationStatus, Prisma } from "@prisma/client";
import { interviewService } from "../src/modules/ai/services/interview.service";
import { aiService } from "../src/modules/ai/services/ai.service";
import { AuthenticatedUser } from "../src/shared/types";
import { ForbiddenError, NotFoundError, ValidationError } from "../src/shared/errors";
import { z } from "zod";
import { AI_CONFIG } from "../src/modules/ai/config";
import { INTERVIEW_PROMPT_CONFIG } from "../src/modules/ai/prompts/interview.prompt";
import { GetInterviewHistoryParamsSchema, GetInterviewDetailsParamsSchema } from "../src/modules/ai/schemas/interview.schema";

const TEST_COMPANY_A_NAME = "Smoke Test Interview Corp A";
const TEST_COMPANY_B_NAME = "Smoke Test Interview Corp B";
const TEST_DEPT_A_NAME = "Smoke Engineering A";
const TEST_DEPT_B_NAME = "Smoke Engineering B";

const TEST_ADMIN_A_EMAIL = "smoke-interview-admin-a@example.com";
const TEST_ADMIN_B_EMAIL = "smoke-interview-admin-b@example.com";
const TEST_RECRUITER_A_EMAIL = "smoke-interview-recruiter-a@example.com";
const TEST_RECRUITER_B_EMAIL = "smoke-interview-recruiter-b@example.com";
const TEST_CANDIDATE_A_EMAIL = "smoke-interview-candidate-a@example.com";
const TEST_CANDIDATE_B_EMAIL = "smoke-interview-candidate-b@example.com";
const TEST_CANDIDATE_C_EMAIL = "smoke-interview-candidate-c@example.com";

const TEST_JOB_A_CODE = "JOB-INT-SMOKE-A";
const TEST_JOB_B_CODE = "JOB-INT-SMOKE-B";
const TEST_JOB_C_CODE = "JOB-INT-SMOKE-C";

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
    console.log("=== STARTING AI INTERVIEW ASSISTANT PRODUCTION-READINESS SMOKE TESTS ===");

    const originalGenerate = aiService.generate;

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
    const pdfPath = path.join(uploadsDir, "smoke-interview-resume.pdf");
    fs.writeFileSync(pdfPath, minimalPdf, "utf8");

    try {
        // Pre-test cleanup of leftover data
        const cleanupCompanies = async () => {
            const comps = await prisma.company.findMany({
                where: { name: { in: [TEST_COMPANY_A_NAME, TEST_COMPANY_B_NAME] } }
            });
            for (const comp of comps) {
                await prisma.interviewAssistant.deleteMany({
                    where: { candidate: { companyId: comp.id } }
                });
                await prisma.application.deleteMany({
                    where: { candidate: { companyId: comp.id } }
                });
                await prisma.candidate.deleteMany({ where: { companyId: comp.id } });
                await prisma.job.deleteMany({ where: { companyId: comp.id } });
                await prisma.user.deleteMany({ where: { companyId: comp.id } });
                await prisma.department.deleteMany({ where: { companyId: comp.id } });
                await prisma.company.delete({ where: { id: comp.id } });
            }
        };

        await cleanupCompanies();

        // 1. Create Companies & Departments
        const companyA = await prisma.company.create({
            data: { name: TEST_COMPANY_A_NAME, industry: "Technology", status: "ACTIVE" }
        });
        const deptA = await prisma.department.create({
            data: { companyId: companyA.id, name: TEST_DEPT_A_NAME }
        });

        const companyB = await prisma.company.create({
            data: { name: TEST_COMPANY_B_NAME, industry: "Finance", status: "ACTIVE" }
        });
        const deptB = await prisma.department.create({
            data: { companyId: companyB.id, name: TEST_DEPT_B_NAME }
        });

        // 2. Create Users
        const adminUserA = await prisma.user.create({
            data: { email: TEST_ADMIN_A_EMAIL, password: "hash", name: "Admin A", role: Role.COMPANY_ADMIN, status: AccountStatus.ACTIVE, companyId: companyA.id }
        });
        const adminUserB = await prisma.user.create({
            data: { email: TEST_ADMIN_B_EMAIL, password: "hash", name: "Admin B", role: Role.COMPANY_ADMIN, status: AccountStatus.ACTIVE, companyId: companyB.id }
        });
        const recruiterA = await prisma.user.create({
            data: { email: TEST_RECRUITER_A_EMAIL, password: "hash", name: "Recruiter A", role: Role.RECRUITER, status: AccountStatus.ACTIVE, companyId: companyA.id }
        });
        const recruiterB = await prisma.user.create({
            data: { email: TEST_RECRUITER_B_EMAIL, password: "hash", name: "Recruiter B", role: Role.RECRUITER, status: AccountStatus.ACTIVE, companyId: companyB.id }
        });
        const candidateUserA = await prisma.user.create({
            data: { email: TEST_CANDIDATE_A_EMAIL, password: "hash", name: "Candidate A", role: Role.CANDIDATE, status: AccountStatus.ACTIVE, companyId: companyA.id }
        });
        const candidateUserB = await prisma.user.create({
            data: { email: TEST_CANDIDATE_B_EMAIL, password: "hash", name: "Candidate B", role: Role.CANDIDATE, status: AccountStatus.ACTIVE, companyId: companyA.id }
        });
        const candidateUserC = await prisma.user.create({
            data: { email: TEST_CANDIDATE_C_EMAIL, password: "hash", name: "Candidate C", role: Role.CANDIDATE, status: AccountStatus.ACTIVE, companyId: companyB.id }
        });

        // Auth Contexts
        const adminAAuth: AuthenticatedUser = { id: adminUserA.id, email: adminUserA.email, role: "COMPANY_ADMIN", status: AccountStatus.ACTIVE, companyId: companyA.id };
        const adminBAuth: AuthenticatedUser = { id: adminUserB.id, email: adminUserB.email, role: "COMPANY_ADMIN", status: AccountStatus.ACTIVE, companyId: companyB.id };
        const recruiterAAuth: AuthenticatedUser = { id: recruiterA.id, email: recruiterA.email, role: "RECRUITER", status: AccountStatus.ACTIVE, companyId: companyA.id };
        const _recruiterBAuth: AuthenticatedUser = { id: recruiterB.id, email: recruiterB.email, role: "RECRUITER", status: AccountStatus.ACTIVE, companyId: companyB.id };
        const candidateAAuth: AuthenticatedUser = { id: candidateUserA.id, email: candidateUserA.email, role: "CANDIDATE", status: AccountStatus.ACTIVE, companyId: companyA.id };
        const _candidateBAuth: AuthenticatedUser = { id: candidateUserB.id, email: candidateUserB.email, role: "CANDIDATE", status: AccountStatus.ACTIVE, companyId: companyA.id };
        const _candidateCAuth: AuthenticatedUser = { id: candidateUserC.id, email: candidateUserC.email, role: "CANDIDATE", status: AccountStatus.ACTIVE, companyId: companyB.id };

        // 3. Create Jobs
        const jobA = await prisma.job.create({
            data: {
                companyId: companyA.id,
                departmentId: deptA.id,
                jobCode: TEST_JOB_A_CODE,
                title: "Senior Backend Engineer",
                description: "Design and scale Node.js/PostgreSQL microservices.",
                requirements: "5+ years Node.js, PostgreSQL, Distributed systems.",
                responsibilities: "Build high-throughput APIs, lead architectural design.",
                employmentType: "FULL_TIME",
                workplaceType: "REMOTE",
                openings: 2,
                isActive: true,
                createdBy: adminUserA.id,
                recruiters: {
                    create: { recruiterId: recruiterA.id, assignedById: adminUserA.id }
                }
            }
        });

        const jobB = await prisma.job.create({
            data: {
                companyId: companyA.id,
                departmentId: deptA.id,
                jobCode: TEST_JOB_B_CODE,
                title: "Frontend Architect",
                description: "Lead Next.js and frontend engineering architecture.",
                requirements: "Expert in React, TypeScript, Performance optimization.",
                employmentType: "FULL_TIME",
                workplaceType: "REMOTE",
                openings: 1,
                isActive: true,
                createdBy: adminUserA.id,
                recruiters: {
                    // Recruiter A is NOT assigned to Job B
                }
            }
        });

        const jobC = await prisma.job.create({
            data: {
                companyId: companyB.id,
                departmentId: deptB.id,
                jobCode: TEST_JOB_C_CODE,
                title: "Financial Analyst",
                description: "Financial modeling and quantitative risk analysis.",
                employmentType: "FULL_TIME",
                workplaceType: "HYBRID",
                openings: 1,
                isActive: true,
                createdBy: adminUserB.id,
                recruiters: {
                    create: { recruiterId: recruiterB.id, assignedById: adminUserB.id }
                }
            }
        });

        // 4. Create Candidates
        const candidateProfileA = await prisma.candidate.create({
            data: {
                companyId: companyA.id,
                primaryRecruiterId: recruiterA.id,
                candidateCode: "CAN-INT-A",
                firstName: "Alice",
                lastName: "Engineer",
                email: TEST_CANDIDATE_A_EMAIL,
                isActive: true,
                createdBy: adminUserA.id,
                documents: {
                    create: {
                        fileName: "smoke-interview-resume.pdf",
                        fileUrl: "uploads/resumes/smoke-interview-resume.pdf",
                        fileKey: "smoke_int_key_a",
                        documentType: DocumentType.RESUME,
                        isActive: true,
                        uploadedBy: adminUserA.id,
                    }
                },
                education: {
                    create: { degree: "B.S. in Computer Science", institution: "MIT", graduationYear: 2018 }
                },
                experience: {
                    create: { company: "Acme Cloud", designation: "Backend Lead", description: "Scaled distributed backend systems in Node.js", startDate: new Date("2018-01-01") }
                }
            }
        });

        const candidateProfileB = await prisma.candidate.create({
            data: {
                companyId: companyA.id,
                primaryRecruiterId: recruiterA.id,
                candidateCode: "CAN-INT-B",
                firstName: "Bob",
                lastName: "Frontend",
                email: TEST_CANDIDATE_B_EMAIL,
                isActive: true,
                createdBy: adminUserA.id,
                documents: {
                    create: {
                        fileName: "smoke-interview-resume.pdf",
                        fileUrl: "uploads/resumes/smoke-interview-resume.pdf",
                        fileKey: "smoke_int_key_b",
                        documentType: DocumentType.RESUME,
                        isActive: true,
                        uploadedBy: adminUserA.id,
                    }
                },
                experience: {
                    create: { company: "WebCorp", designation: "Frontend Engineer", description: "Built React UI", startDate: new Date("2020-01-01") }
                }
            }
        });

        const candidateProfileC = await prisma.candidate.create({
            data: {
                companyId: companyB.id,
                primaryRecruiterId: recruiterB.id,
                candidateCode: "CAN-INT-C",
                firstName: "Charlie",
                lastName: "Finance",
                email: TEST_CANDIDATE_C_EMAIL,
                isActive: true,
                createdBy: adminUserB.id,
                documents: {
                    create: {
                        fileName: "smoke-interview-resume.pdf",
                        fileUrl: "uploads/resumes/smoke-interview-resume.pdf",
                        fileKey: "smoke_int_key_c",
                        documentType: DocumentType.RESUME,
                        isActive: true,
                        uploadedBy: adminUserB.id,
                    }
                },
                education: {
                    create: { degree: "B.A. Economics", institution: "Stanford", graduationYear: 2019 }
                }
            }
        });

        // 5. Create Applications
        // Candidate A applied to Job A
        await prisma.application.create({
            data: {
                applicationCode: "APP-SMOKE-INT-001",
                companyId: companyA.id,
                candidateId: candidateProfileA.id,
                jobId: jobA.id,
                assignedRecruiterId: recruiterA.id,
                status: ApplicationStatus.ACTIVE,
                stage: "INTERVIEW",
                createdBy: adminUserA.id,
            }
        });

        // Candidate B applied to Job B
        await prisma.application.create({
            data: {
                applicationCode: "APP-SMOKE-INT-002",
                companyId: companyA.id,
                candidateId: candidateProfileB.id,
                jobId: jobB.id,
                assignedRecruiterId: recruiterA.id,
                status: ApplicationStatus.ACTIVE,
                stage: "APPLIED",
                createdBy: adminUserA.id,
            }
        });

        console.log("\n--- TEST SUITE 1: VALIDATION & ERROR PATHS ---");

        // Test 1: Malformed Request / Missing CandidateId
        console.log("TEST 1: Malformed request / Missing candidateId");
        await assertThrows(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            () => interviewService.generateGeneralInterview({} as any, adminAAuth),
            z.ZodError
        );

        // Test 2: Invalid CUID format
        console.log("TEST 2: Invalid candidateId format");
        await assertThrows(
            () => interviewService.generateGeneralInterview({ candidateId: "invalid-cuid-123" }, adminAAuth),
            z.ZodError,
            "invalid candidate id format"
        );

        // Test 3: Missing JobId in Job-Specific Request
        console.log("TEST 3: Missing jobId in Job-Specific Request");
        await assertThrows(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            () => interviewService.generateJobInterview({ candidateId: candidateProfileA.id } as any, adminAAuth),
            z.ZodError
        );

        // Test 4: Candidate Not Found (valid CUID format but nonexistent)
        console.log("TEST 4: Non-existent candidate ID");
        await assertThrows(
            () => interviewService.generateGeneralInterview({ candidateId: "clxyz12340000t3t1cr4a6136" }, adminAAuth),
            NotFoundError,
            "candidate not found"
        );

        // Test 5: Missing Resume document
        console.log("TEST 5: Candidate missing resume document");
        const candNoDoc = await prisma.candidate.create({
            data: {
                companyId: companyA.id,
                primaryRecruiterId: recruiterA.id,
                candidateCode: "CAN-NODOC-INT",
                firstName: "No",
                lastName: "Doc",
                email: "nodoc-int@example.com",
                isActive: true,
                createdBy: adminUserA.id,
            }
        });
        await assertThrows(
            () => interviewService.generateGeneralInterview({ candidateId: candNoDoc.id }, adminAAuth),
            ValidationError,
            "candidate resume is missing"
        );
        await prisma.candidate.delete({ where: { id: candNoDoc.id } });

        // Test 6: Insufficient Resume Info (no skills, exp, edu)
        console.log("TEST 6: Candidate with empty/insufficient resume profile");
        const candEmpty = await prisma.candidate.create({
            data: {
                companyId: companyA.id,
                primaryRecruiterId: recruiterA.id,
                candidateCode: "CAN-EMPTY-INT",
                firstName: "Empty",
                lastName: "Profile",
                email: "empty-int@example.com",
                isActive: true,
                createdBy: adminUserA.id,
                documents: {
                    create: {
                        fileName: "smoke-interview-resume.pdf",
                        fileUrl: "uploads/resumes/smoke-interview-resume.pdf",
                        fileKey: "smoke_empty_key",
                        documentType: DocumentType.RESUME,
                        isActive: true,
                        uploadedBy: adminUserA.id,
                    }
                }
            }
        });
        await assertThrows(
            () => interviewService.generateGeneralInterview({ candidateId: candEmpty.id }, adminAAuth),
            ValidationError,
            "insufficient information"
        );
        await prisma.candidate.delete({ where: { id: candEmpty.id } });

        // Test 7: Missing physical PDF file
        console.log("TEST 7: Missing physical PDF on disk throws ValidationError");
        const candMissingPdf = await prisma.candidate.create({
            data: {
                companyId: companyA.id,
                primaryRecruiterId: recruiterA.id,
                candidateCode: "CAN-NOPDF-INT",
                firstName: "NoPdf",
                lastName: "Candidate",
                email: "nopdf-int@example.com",
                isActive: true,
                createdBy: adminUserA.id,
                documents: {
                    create: {
                        fileName: "missing-resume.pdf",
                        fileUrl: "uploads/resumes/nonexistent-file.pdf",
                        fileKey: "missing_pdf_key",
                        documentType: DocumentType.RESUME,
                        isActive: true,
                        uploadedBy: adminUserA.id,
                    }
                },
                experience: {
                    create: { company: "OldCorp", designation: "Dev", startDate: new Date("2020-01-01") }
                }
            }
        });
        await assertThrows(
            () => interviewService.generateGeneralInterview({ candidateId: candMissingPdf.id }, adminAAuth),
            ValidationError,
            "resume pdf file could not be accessed"
        );
        await prisma.candidate.delete({ where: { id: candMissingPdf.id } });

        console.log("\n--- TEST SUITE 2: AI FAILURE PATHS ---");

        // Test 8: AI Returns Malformed / Invalid JSON
        console.log("TEST 8: AI malformed JSON response throws ValidationError and persists no records");
        aiService.generate = async () => ({
            content: "NOT A VALID JSON OUTPUT { malformed",
            responseTime: 100
        });

        const preCount = await prisma.interviewAssistant.count();
        await assertThrows(
            () => interviewService.generateGeneralInterview({ candidateId: candidateProfileA.id }, adminAAuth),
            ValidationError,
            "failed to parse response from ai model as valid json"
        );
        const postCount = await prisma.interviewAssistant.count();
        assert(preCount === postCount, "No InterviewAssistant record should be persisted on JSON failure");

        // Test 9: AI Returns Invalid Schema (e.g. invalid category / empty overallSummary)
        console.log("TEST 9: AI invalid schema response throws ZodError and persists nothing");
        aiService.generate = async () => ({
            content: JSON.stringify({
                overallSummary: "", // Empty summary violates min(1)
                questions: [
                    {
                        category: "INVALID_CATEGORY",
                        question: "Test question",
                        reason: "Test reason",
                        difficulty: "MEDIUM",
                        followUps: []
                    }
                ]
            }),
            responseTime: 120
        });

        await assertThrows(
            () => interviewService.generateGeneralInterview({ candidateId: candidateProfileA.id }, adminAAuth),
            z.ZodError
        );
        const postSchemaCount = await prisma.interviewAssistant.count();
        assert(preCount === postSchemaCount, "No record should be persisted on schema validation failure");

        // Test 10: AI Service Timeout / Network Failure
        console.log("TEST 10: AI service exception propagates cleanly without corrupted records");
        aiService.generate = async () => {
            throw new Error("AI provider timed out after 60000ms");
        };

        await assertThrows(
            () => interviewService.generateGeneralInterview({ candidateId: candidateProfileA.id }, adminAAuth),
            Error,
            "AI provider timed out"
        );
        const postTimeoutCount = await prisma.interviewAssistant.count();
        assert(preCount === postTimeoutCount, "No record persisted on AI timeout");

        console.log("\n--- TEST SUITE 3: HAPPY PATHS & PERSISTENCE ---");

        // Mock deterministic valid AI response for general mode
        const mockGeneralAI = {
            overallSummary: "Structured interview kit assessing core backend capabilities and system design.",
            questions: [
                {
                    category: "TECHNICAL",
                    question: "How did you optimize PostgreSQL query performance at Acme Cloud?",
                    reason: "Probes candidate's relational database scaling experience.",
                    difficulty: "MEDIUM",
                    followUps: ["Did you use connection pooling?", "How did you monitor slow queries?"]
                },
                {
                    category: "BEHAVIORAL",
                    question: "Describe a high-stakes outage you resolved at Acme Cloud.",
                    reason: "Evaluates problem-solving under pressure and root-cause analysis.",
                    difficulty: "HARD",
                    followUps: ["How was post-mortem communication handled?"]
                }
            ]
        };

        // Mock deterministic valid AI response for job-specific mode
        const mockJobSpecificAI = {
            overallSummary: "Job-specific technical assessment tailored for Senior Backend Engineer role requirements.",
            questions: [
                {
                    category: "ROLE_SPECIFIC",
                    question: "How would you architect high-throughput Node.js microservices for our distributed API requirements?",
                    reason: "Directly tests candidate alignment with Job A core responsibilities.",
                    difficulty: "HARD",
                    followUps: ["What strategy do you use for distributed tracing?"]
                },
                {
                    category: "PROJECT",
                    question: "Explain the architecture of the distributed backend systems you built at Acme Cloud.",
                    reason: "Validates depth of verified past project experience against our requirements.",
                    difficulty: "MEDIUM",
                    followUps: ["What trade-offs were made?"]
                }
            ]
        };

        // Test 11: General Interview Generation (Happy Path)
        console.log("TEST 11: Generate General Interview Kit (Admin Auth)");
        aiService.generate = async () => ({
            content: JSON.stringify(mockGeneralAI),
            responseTime: 250
        });

        const generalResult = await interviewService.generateGeneralInterview(
            { candidateId: candidateProfileA.id },
            adminAAuth
        );

        assert(generalResult.id !== undefined, "Result ID must be defined");
        assert(generalResult.candidateId === candidateProfileA.id, "CandidateId must match");
        assert(generalResult.jobId === null, "JobId must be null for GENERAL mode");
        assert(generalResult.mode === InterviewAssistantMode.GENERAL, "Mode must be GENERAL");
        assert(generalResult.overallSummary === mockGeneralAI.overallSummary, "Overall summary must match");
        assert(generalResult.questions.length === 2, "Must contain 2 questions");
        assert(generalResult.questions[0].category === "TECHNICAL", "First question category is TECHNICAL");
        assert(generalResult.aiModel === AI_CONFIG.model, "AI model must match configuration");
        assert(generalResult.promptVersion === INTERVIEW_PROMPT_CONFIG.version, "Prompt version must match config");

        // Verify Direct DB Record
        const dbGeneralRecord = await prisma.interviewAssistant.findUnique({
            where: { id: generalResult.id }
        });
        assert(dbGeneralRecord !== null, "DB record must exist");
        assert(dbGeneralRecord!.mode === "GENERAL", "DB mode must be GENERAL");
        assert(dbGeneralRecord!.jobId === null, "DB jobId must be null");
        console.log("   ✅ General mode kit created and verified in database.");

        // Test 12: Job-Specific Interview Generation (Happy Path)
        console.log("TEST 12: Generate Job-Specific Interview Kit (Admin Auth)");
        aiService.generate = async () => ({
            content: JSON.stringify(mockJobSpecificAI),
            responseTime: 300
        });

        const jobResult = await interviewService.generateJobInterview(
            { candidateId: candidateProfileA.id, jobId: jobA.id },
            adminAAuth
        );

        assert(jobResult.id !== undefined, "Job result ID must be defined");
        assert(jobResult.candidateId === candidateProfileA.id, "CandidateId must match");
        assert(jobResult.jobId === jobA.id, "JobId must match Job A");
        assert(jobResult.mode === InterviewAssistantMode.JOB_SPECIFIC, "Mode must be JOB_SPECIFIC");
        assert(jobResult.questions.length === 2, "Must contain 2 questions");
        assert(jobResult.questions[0].category === "ROLE_SPECIFIC", "Question category must be ROLE_SPECIFIC");

        // Verify Direct DB Record
        const dbJobRecord = await prisma.interviewAssistant.findUnique({
            where: { id: jobResult.id }
        });
        assert(dbJobRecord !== null, "DB job-specific record must exist");
        assert(dbJobRecord!.jobId === jobA.id, "DB record jobId must match Job A");
        console.log("   ✅ Job-specific kit created and verified in database.");

        // Test 13: Immutable History (Repeated Generation)
        console.log("TEST 13: Immutable history - Repeated generation creates distinct records");
        const secondGenResult = await interviewService.generateGeneralInterview(
            { candidateId: candidateProfileA.id },
            adminAAuth
        );
        assert(secondGenResult.id !== generalResult.id, "Second generation must produce a new unique ID");

        const firstRecordCheck = await prisma.interviewAssistant.findUnique({
            where: { id: generalResult.id }
        });
        assert(firstRecordCheck !== null, "First record must remain untouched");
        console.log("   ✅ Historical evaluations are immutable and preserved.");

        // Test 14: Get Candidate Interview History
        console.log("TEST 14: Get Candidate Interview History (Newest first)");
        const history = await interviewService.getInterviewHistory(
            candidateProfileA.id,
            adminAAuth
        );

        assert(history.length >= 3, `History must contain at least 3 records, got ${history.length}`);
        assert(history[0].id === secondGenResult.id, "Newest record must be first in history list");
        assert(new Date(history[0].createdAt).getTime() >= new Date(history[1].createdAt).getTime(), "History must be sorted newest first");
        console.log("   ✅ History correctly returned in descending chronological order.");

        // Test 15: Get Interview Kit Details (General & Job-Specific)
        console.log("TEST 15: Get Interview Kit Details");
        const generalDetails = await interviewService.getInterviewDetails(generalResult.id, adminAAuth);
        assert(generalDetails.id === generalResult.id, "Details ID must match");
        assert(generalDetails.questions.length === 2, "Questions array must be populated in details");
        assert(generalDetails.mode === "GENERAL", "Mode must match");

        const jobDetails = await interviewService.getInterviewDetails(jobResult.id, adminAAuth);
        assert(jobDetails.id === jobResult.id, "Details ID must match");
        assert(jobDetails.jobId === jobA.id, "JobId must match");
        assert(jobDetails.mode === "JOB_SPECIFIC", "Mode must match");

        // Test 15b: Nonexistent details ID throws NotFoundError
        await assertThrows(
            () => interviewService.getInterviewDetails("clxyznonexist0000t3t1cr4a6136", adminAAuth),
            NotFoundError,
            "interview assistant kit not found"
        );
        console.log("   ✅ Details retrieval verified for both modes.");

        console.log("\n--- TEST SUITE 4: SECURITY & AUTHORIZATION MATRIX ---");

        // Test 16: Candidate Self-Access (Candidate A accesses Candidate A's history and details)
        console.log("TEST 16: Candidate self-access to history and details");
        const candAHistory = await interviewService.getInterviewHistory(candidateProfileA.id, candidateAAuth);
        assert(candAHistory.length > 0, "Candidate A should be able to view their own history");
        const candADetails = await interviewService.getInterviewDetails(generalResult.id, candidateAAuth);
        assert(candADetails.id === generalResult.id, "Candidate A should view their own kit details");
        console.log("   ✅ Candidate self-access permitted.");

        // Test 17: Candidate Cross-Access Denial (Candidate A attempts Candidate B)
        console.log("TEST 17: Candidate A cannot access Candidate B history or details");
        await assertThrows(
            () => interviewService.getInterviewHistory(candidateProfileB.id, candidateAAuth),
            ForbiddenError,
            "not authorized"
        );
        await assertThrows(
            () => interviewService.generateGeneralInterview({ candidateId: candidateProfileB.id }, candidateAAuth),
            ForbiddenError,
            "not authorized"
        );
        console.log("   ✅ Candidate cross-access strictly forbidden.");

        // Test 18: Candidate Job Application Requirement (Candidate A on Job A vs Job B)
        console.log("TEST 18: Candidate can only request interview kits for jobs applied to");
        // Candidate A applied to Job A -> PASS
        const candJobA = await interviewService.generateJobInterview(
            { candidateId: candidateProfileA.id, jobId: jobA.id },
            candidateAAuth
        );
        assert(candJobA.id !== undefined, "Candidate A applied to Job A -> should succeed");

        // Candidate A did NOT apply to Job B -> FORBIDDEN
        await assertThrows(
            () => interviewService.generateJobInterview({ candidateId: candidateProfileA.id, jobId: jobB.id }, candidateAAuth),
            ForbiddenError,
            "only request interview kits for jobs you have applied to"
        );
        console.log("   ✅ Candidate unapplied job restriction enforced.");

        // Test 19: Recruiter Job Assignment Scoping
        console.log("TEST 19: Recruiter job assignment scoping");
        // Recruiter A assigned to Job A -> PASS
        const recJobA = await interviewService.generateJobInterview(
            { candidateId: candidateProfileA.id, jobId: jobA.id },
            recruiterAAuth
        );
        assert(recJobA.id !== undefined, "Recruiter A assigned to Job A -> should succeed");

        // Recruiter A is NOT assigned to Job B -> FORBIDDEN
        await assertThrows(
            () => interviewService.generateJobInterview({ candidateId: candidateProfileB.id, jobId: jobB.id }, recruiterAAuth),
            ForbiddenError,
            "do not have permission to access this job"
        );
        console.log("   ✅ Recruiter unassigned job restriction enforced.");

        // Test 20: Recruiter History Filtering (Unassigned Job-Specific kits hidden)
        console.log("TEST 20: Recruiter history filtering hides unassigned job kits");
        // Generate a Job B specific kit as Admin
        const jobBKit = await interviewService.generateJobInterview(
            { candidateId: candidateProfileB.id, jobId: jobB.id },
            adminAAuth
        );
        assert(jobBKit.id !== undefined, "Job B kit created by admin");

        // Recruiter A views Candidate B history: should see GENERAL kits but NOT Job B specific kit
        const recAHistoryForB = await interviewService.getInterviewHistory(candidateProfileB.id, recruiterAAuth);
        const hasJobBKit = recAHistoryForB.some((h) => h.id === jobBKit.id);
        assert(!hasJobBKit, "Recruiter A must NOT see Job B specific kit in Candidate B's history");
        console.log("   ✅ Recruiter history query-level isolation verified.");

        // Test 21: Cross-Company Isolation (Company A user cannot access Company B records)
        console.log("TEST 21: Cross-Company Access Isolation");
        // Admin A attempts Candidate C (Company B)
        await assertThrows(
            () => interviewService.generateGeneralInterview({ candidateId: candidateProfileC.id }, adminAAuth),
            NotFoundError,
            "candidate not found"
        );

        // Admin A attempts Job C (Company B)
        await assertThrows(
            () => interviewService.generateJobInterview({ candidateId: candidateProfileA.id, jobId: jobC.id }, adminAAuth),
            ForbiddenError,
            "cross-company access is forbidden"
        );

        // Recruiter A attempts Candidate C
        await assertThrows(
            () => interviewService.getInterviewHistory(candidateProfileC.id, recruiterAAuth),
            NotFoundError,
            "candidate not found"
        );

        // Admin B cannot access Candidate A
        await assertThrows(
            () => interviewService.getInterviewHistory(candidateProfileA.id, adminBAuth),
            NotFoundError,
            "candidate not found"
        );
        console.log("   ✅ Cross-company multi-tenant isolation strictly verified.");

        console.log("\n--- TEST SUITE 5: RELATIONAL INTEGRITY & CASCADE BEHAVIOR ---");

        // Test 22: Candidate Deletion Cascade (GDPR Compliance)
        console.log("TEST 22: Candidate deletion cascades to remove InterviewAssistant records");
        const cascadeCand = await prisma.candidate.create({
            data: {
                companyId: companyA.id,
                primaryRecruiterId: recruiterA.id,
                candidateCode: "CAN-CASCADE-INT",
                firstName: "Cascade",
                lastName: "Candidate",
                email: "cascade-int@example.com",
                isActive: true,
                createdBy: adminUserA.id,
                documents: {
                    create: {
                        fileName: "smoke-interview-resume.pdf",
                        fileUrl: "uploads/resumes/smoke-interview-resume.pdf",
                        fileKey: "smoke_casc_key",
                        documentType: DocumentType.RESUME,
                        isActive: true,
                        uploadedBy: adminUserA.id,
                    }
                },
                experience: {
                    create: { company: "CascCorp", designation: "Engineer", startDate: new Date("2021-01-01") }
                }
            }
        });

        const cascadeKit = await interviewService.generateGeneralInterview(
            { candidateId: cascadeCand.id },
            adminAAuth
        );
        assert(cascadeKit.id !== undefined, "Cascade kit created");

        // Delete candidate
        await prisma.candidate.delete({ where: { id: cascadeCand.id } });

        // Verify InterviewAssistant record was cascaded
        const cascadedRecord = await prisma.interviewAssistant.findUnique({
            where: { id: cascadeKit.id }
        });
        assert(cascadedRecord === null, "InterviewAssistant record must be deleted via CASCADE on Candidate deletion");
        console.log("   ✅ Candidate deletion CASCADE verified.");

        // Test 23: Job Deletion SetNull (Preserves History)
        console.log("TEST 23: Job deletion sets jobId to NULL without deleting history");
        const tempJob = await prisma.job.create({
            data: {
                companyId: companyA.id,
                departmentId: deptA.id,
                jobCode: "JOB-TEMP-INT",
                title: "Temporary Job",
                description: "Temporary role for SetNull test",
                employmentType: "FULL_TIME",
                workplaceType: "REMOTE",
                openings: 1,
                isActive: true,
                createdBy: adminUserA.id,
            }
        });

        const setNullKit = await prisma.interviewAssistant.create({
            data: {
                candidateId: candidateProfileA.id,
                jobId: tempJob.id,
                mode: InterviewAssistantMode.JOB_SPECIFIC,
                overallSummary: "Temp job kit summary",
                questions: mockJobSpecificAI.questions as unknown as Prisma.InputJsonValue,
                aiModel: AI_CONFIG.model,
                promptVersion: INTERVIEW_PROMPT_CONFIG.version,
            }
        });

        // Delete the temporary job
        await prisma.job.delete({ where: { id: tempJob.id } });

        // Verify InterviewAssistant record still exists with jobId = null
        const preservedRecord = await prisma.interviewAssistant.findUnique({
            where: { id: setNullKit.id }
        });
        assert(preservedRecord !== null, "InterviewAssistant record must NOT be deleted when job is deleted");
        assert(preservedRecord!.jobId === null, "InterviewAssistant record jobId must be set to NULL (SetNull)");
        console.log("   ✅ Job deletion SetNull behavior verified.");

        console.log("\n--- TEST SUITE 6: ROUTE PARAMETER & SCHEMA VALIDATION ---");

        // Test 24: Route Param Schema Validation
        console.log("TEST 24: Route parameter schemas (GetInterviewHistoryParamsSchema & GetInterviewDetailsParamsSchema)");
        assert(GetInterviewHistoryParamsSchema.safeParse({ candidateId: candidateProfileA.id }).success, "Valid history params must pass");
        assert(!GetInterviewHistoryParamsSchema.safeParse({ candidateId: "not-a-cuid" }).success, "Invalid history params must fail");
        assert(GetInterviewDetailsParamsSchema.safeParse({ id: generalResult.id }).success, "Valid details params must pass");
        assert(!GetInterviewDetailsParamsSchema.safeParse({ id: "invalid-id" }).success, "Invalid details params must fail");
        console.log("   ✅ Parameter validation schemas verified.");

        console.log("\n=======================================================");
        console.log("🎉 ALL 24 TEST SUITES IN SMOKE SUITE PASSED SUCCESSFULLY!");
        console.log("=======================================================\n");
    } finally {
        // Restore aiService.generate
        aiService.generate = originalGenerate;

        // Clean up test file on disk
        if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
        }

        // Cleanup database records in foreign-key safe order
        console.log("Cleaning up test database records...");
        try {
            const comps = await prisma.company.findMany({
                where: { name: { in: [TEST_COMPANY_A_NAME, TEST_COMPANY_B_NAME] } }
            });
            for (const comp of comps) {
                await prisma.interviewAssistant.deleteMany({
                    where: { candidate: { companyId: comp.id } }
                });
                await prisma.application.deleteMany({
                    where: { candidate: { companyId: comp.id } }
                });
                await prisma.candidate.deleteMany({ where: { companyId: comp.id } });
                await prisma.job.deleteMany({ where: { companyId: comp.id } });
                await prisma.user.deleteMany({ where: { companyId: comp.id } });
                await prisma.department.deleteMany({ where: { companyId: comp.id } });
                await prisma.company.delete({ where: { id: comp.id } });
            }
            console.log("Cleanup completed successfully.");
        } catch (cleanupErr) {
            console.error("Cleanup error:", cleanupErr);
        }
    }
}

// Execute smoke tests if run directly
if (require.main === module) {
    runSmokeTests()
        .then(() => {
            console.log("Interview Assistant smoke test run completed.");
            process.exit(0);
        })
        .catch((err) => {
            console.error("❌ Interview Assistant smoke test failed:", err);
            process.exit(1);
        });
}

export { runSmokeTests };
