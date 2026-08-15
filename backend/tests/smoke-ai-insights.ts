import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { prisma } from "../src/config/prisma";
import { Role, AccountStatus, DocumentType, ApplicationStatus, ResumeRecommendationMode } from "@prisma/client";
import { aiInsightsService } from "../src/modules/ai/services/ai-insights.service";
import { aiService } from "../src/modules/ai/services/ai.service";
import { AuthenticatedUser } from "../src/shared/types";
import { ForbiddenError, NotFoundError, ValidationError } from "../src/shared/errors";
import { z } from "zod";
import { AI_CONFIG } from "../src/modules/ai/config";
import { INSIGHTS_PROMPT_CONFIG } from "../src/modules/ai/prompts/insights.prompt";
import { GetInsightsHistoryParamsSchema, GetInsightsDetailsParamsSchema } from "../src/modules/ai/schemas/insights.schema";

const TEST_COMPANY_A_NAME = "Smoke Test Insights Corp A";
const TEST_COMPANY_B_NAME = "Smoke Test Insights Corp B";
const TEST_DEPT_A_NAME = "Smoke Engineering A";
const TEST_DEPT_B_NAME = "Smoke Engineering B";

const TEST_ADMIN_A_EMAIL = "smoke-insights-admin-a@example.com";
const TEST_ADMIN_B_EMAIL = "smoke-insights-admin-b@example.com";
const TEST_RECRUITER_A_EMAIL = "smoke-insights-recruiter-a@example.com";
const TEST_RECRUITER_B_EMAIL = "smoke-insights-recruiter-b@example.com";
const TEST_CANDIDATE_A_EMAIL = "smoke-insights-candidate-a@example.com";
const TEST_CANDIDATE_B_EMAIL = "smoke-insights-candidate-b@example.com";
const TEST_CANDIDATE_C_EMAIL = "smoke-insights-candidate-c@example.com";

const TEST_JOB_A_CODE = "JOB-INS-SMOKE-A";
const TEST_JOB_B_CODE = "JOB-INS-SMOKE-B";
const TEST_JOB_C_CODE = "JOB-INS-SMOKE-C";

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
    console.log("=== STARTING AI INSIGHTS PRODUCTION-READINESS SMOKE TESTS ===");

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
    const pdfPath = path.join(uploadsDir, "smoke-insights-resume.pdf");
    fs.writeFileSync(pdfPath, minimalPdf, "utf8");

    try {
        // Pre-test cleanup of leftover data
        const cleanupCompanies = async () => {
            const comps = await prisma.company.findMany({
                where: { name: { in: [TEST_COMPANY_A_NAME, TEST_COMPANY_B_NAME] } }
            });
            for (const comp of comps) {
                await prisma.aiInsight.deleteMany({
                    where: { candidate: { companyId: comp.id } }
                });
                await prisma.interviewAssistant.deleteMany({
                    where: { candidate: { companyId: comp.id } }
                });
                await prisma.resumeRecommendation.deleteMany({
                    where: { candidate: { companyId: comp.id } }
                });
                await prisma.jobMatch.deleteMany({
                    where: { candidate: { companyId: comp.id } }
                });
                await prisma.aTSScore.deleteMany({
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
        const recruiterA2 = await prisma.user.create({
            data: { email: "smoke-insights-recruiter-a2@example.com", password: "hash", name: "Recruiter A2", role: Role.RECRUITER, status: AccountStatus.ACTIVE, companyId: companyA.id }
        });
        const recruiterB = await prisma.user.create({
            data: { email: TEST_RECRUITER_B_EMAIL, password: "hash", name: "Recruiter B", role: Role.RECRUITER, status: AccountStatus.ACTIVE, companyId: companyB.id }
        });
        const candidateUserA = await prisma.user.create({
            data: { email: TEST_CANDIDATE_A_EMAIL, password: "hash", name: "Candidate A", role: Role.CANDIDATE, status: AccountStatus.ACTIVE, companyId: companyA.id }
        });
        const _candidateUserB = await prisma.user.create({
            data: { email: TEST_CANDIDATE_B_EMAIL, password: "hash", name: "Candidate B", role: Role.CANDIDATE, status: AccountStatus.ACTIVE, companyId: companyA.id }
        });
        const _candidateUserC = await prisma.user.create({
            data: { email: TEST_CANDIDATE_C_EMAIL, password: "hash", name: "Candidate C", role: Role.CANDIDATE, status: AccountStatus.ACTIVE, companyId: companyB.id }
        });

        // Auth Contexts
        const adminAAuth: AuthenticatedUser = { id: adminUserA.id, email: adminUserA.email, role: "COMPANY_ADMIN", status: AccountStatus.ACTIVE, companyId: companyA.id };
        const adminBAuth: AuthenticatedUser = { id: adminUserB.id, email: adminUserB.email, role: "COMPANY_ADMIN", status: AccountStatus.ACTIVE, companyId: companyB.id };
        const recruiterAAuth: AuthenticatedUser = { id: recruiterA.id, email: recruiterA.email, role: "RECRUITER", status: AccountStatus.ACTIVE, companyId: companyA.id };
        const recruiterA2Auth: AuthenticatedUser = { id: recruiterA2.id, email: recruiterA2.email, role: "RECRUITER", status: AccountStatus.ACTIVE, companyId: companyA.id };
        const candidateAAuth: AuthenticatedUser = { id: candidateUserA.id, email: candidateUserA.email, role: "CANDIDATE", status: AccountStatus.ACTIVE, companyId: companyA.id };

        // 3. Create Jobs
        const jobA = await prisma.job.create({
            data: {
                companyId: companyA.id,
                departmentId: deptA.id,
                jobCode: TEST_JOB_A_CODE,
                title: "Senior Distributed Backend Engineer",
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
                title: "Financial Quantitative Analyst",
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
                candidateCode: "CAN-INS-A",
                firstName: "Alice",
                lastName: "Architect",
                email: TEST_CANDIDATE_A_EMAIL,
                isActive: true,
                createdBy: adminUserA.id,
                documents: {
                    create: {
                        fileName: "smoke-insights-resume.pdf",
                        fileUrl: "uploads/resumes/smoke-insights-resume.pdf",
                        fileKey: "smoke_ins_key_a",
                        documentType: DocumentType.RESUME,
                        isActive: true,
                        uploadedBy: adminUserA.id,
                    }
                },
                education: {
                    create: { degree: "M.S. in Computer Science", institution: "Stanford", graduationYear: 2017 }
                },
                experience: {
                    create: { company: "CloudScale Inc", designation: "Staff Backend Engineer", description: "Led distributed consensus and high-throughput Node.js microservices", startDate: new Date("2017-06-01") }
                },
                skills: {
                    create: {
                        skill: { connectOrCreate: { where: { name: "Node.js" }, create: { name: "Node.js" } } },
                        proficiency: "EXPERT",
                        experienceYears: 6
                    }
                }
            }
        });

        const candidateProfileB = await prisma.candidate.create({
            data: {
                companyId: companyA.id,
                primaryRecruiterId: recruiterA.id,
                candidateCode: "CAN-INS-B",
                firstName: "Bob",
                lastName: "Frontend",
                email: TEST_CANDIDATE_B_EMAIL,
                isActive: true,
                createdBy: adminUserA.id,
                documents: {
                    create: {
                        fileName: "smoke-insights-resume.pdf",
                        fileUrl: "uploads/resumes/smoke-insights-resume.pdf",
                        fileKey: "smoke_ins_key_b",
                        documentType: DocumentType.RESUME,
                        isActive: true,
                        uploadedBy: adminUserA.id,
                    }
                },
                experience: {
                    create: { company: "WebCorp", designation: "Frontend Engineer", description: "Built React web apps", startDate: new Date("2020-01-01") }
                }
            }
        });

        const candidateProfileC = await prisma.candidate.create({
            data: {
                companyId: companyB.id,
                primaryRecruiterId: recruiterB.id,
                candidateCode: "CAN-INS-C",
                firstName: "Charlie",
                lastName: "Finance",
                email: TEST_CANDIDATE_C_EMAIL,
                isActive: true,
                createdBy: adminUserB.id,
                documents: {
                    create: {
                        fileName: "smoke-insights-resume.pdf",
                        fileUrl: "uploads/resumes/smoke-insights-resume.pdf",
                        fileKey: "smoke_ins_key_c",
                        documentType: DocumentType.RESUME,
                        isActive: true,
                        uploadedBy: adminUserB.id,
                    }
                },
                education: {
                    create: { degree: "B.A. Economics", institution: "Columbia", graduationYear: 2019 }
                }
            }
        });

        // 5. Create Applications
        await prisma.application.create({
            data: {
                applicationCode: "APP-SMOKE-INS-001",
                companyId: companyA.id,
                candidateId: candidateProfileA.id,
                jobId: jobA.id,
                assignedRecruiterId: recruiterA.id,
                status: ApplicationStatus.ACTIVE,
                stage: "INTERVIEW",
                createdBy: adminUserA.id,
            }
        });

        // 6. Seed Existing Evaluations for Candidate A on Job A (ATS, Job Match, Resume Recommendations)
        await prisma.aTSScore.create({
            data: {
                candidateId: candidateProfileA.id,
                jobId: jobA.id,
                overallScore: 92,
                skillScore: 95,
                experienceScore: 90,
                educationScore: 90,
                keywordScore: 90,
                certificationScore: 85,
                strengths: ["Node.js"],
                weaknesses: ["Kubernetes"],
                missingSkills: ["Kubernetes"],
                recommendations: ["Candidate has strong distributed systems background", "Explore container orchestration"],
                hiringRecommendation: "HIRE",
                overallReason: "Strong fit",
                aiModel: AI_CONFIG.model,
                promptVersion: "1.0.0",
            }
        });

        await prisma.jobMatch.create({
            data: {
                candidateId: candidateProfileA.id,
                jobId: jobA.id,
                matchPercentage: 94,
                skillMatch: 95,
                experienceMatch: 92,
                educationMatch: 90,
                projectMatch: 95,
                keywordMatch: 90,
                strengths: ["Node.js mastery", "PostgreSQL tuning"],
                missingSkills: ["Kubernetes"],
                overallReason: "Exceptional alignment with core backend stack",
                recommendation: "Strong candidate for architectural interview",
                aiModel: AI_CONFIG.model,
                promptVersion: "1.0.0",
            }
        });

        await prisma.resumeRecommendation.create({
            data: {
                candidateId: candidateProfileA.id,
                jobId: jobA.id,
                mode: ResumeRecommendationMode.JOB_SPECIFIC,
                overallSummary: "Strong resume tailored for senior distributed systems roles.",
                recommendations: [
                    { category: "KEYWORD", suggestion: "Mention Kubernetes orchestration if experienced", impact: "HIGH" }
                ],
                aiModel: AI_CONFIG.model,
                promptVersion: "1.0.0",
            }
        });

        console.log("\n--- TEST SUITE 1: VALIDATION & ERROR PATHS ---");

        // Test 1: Malformed Request / Missing CandidateId or JobId
        console.log("TEST 1: Malformed request / Missing parameters");
        await assertThrows(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            () => aiInsightsService.generateInsights({} as any, adminAAuth),
            z.ZodError
        );

        // Test 2: Invalid CUID format
        console.log("TEST 2: Invalid candidateId format");
        await assertThrows(
            () => aiInsightsService.generateInsights({ candidateId: "invalid-cuid", jobId: jobA.id }, adminAAuth),
            z.ZodError,
            "invalid candidate id format"
        );

        // Test 3: Candidate Not Found
        console.log("TEST 3: Non-existent candidate ID");
        await assertThrows(
            () => aiInsightsService.generateInsights({ candidateId: "clxyz12340000t3t1cr4a6136", jobId: jobA.id }, adminAAuth),
            NotFoundError,
            "candidate not found"
        );

        // Test 4: Job Not Found
        console.log("TEST 4: Non-existent job ID");
        await assertThrows(
            () => aiInsightsService.generateInsights({ candidateId: candidateProfileA.id, jobId: "clxyz99990000t3t1cr4a6136" }, adminAAuth),
            NotFoundError,
            "job not found"
        );

        // Test 5: Missing Resume document
        console.log("TEST 5: Candidate missing resume document");
        const candNoDoc = await prisma.candidate.create({
            data: {
                companyId: companyA.id,
                primaryRecruiterId: recruiterA.id,
                candidateCode: "CAN-NODOC-INS",
                firstName: "No",
                lastName: "Doc",
                email: "nodoc-ins@example.com",
                isActive: true,
                createdBy: adminUserA.id,
            }
        });
        await assertThrows(
            () => aiInsightsService.generateInsights({ candidateId: candNoDoc.id, jobId: jobA.id }, adminAAuth),
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
                candidateCode: "CAN-EMPTY-INS",
                firstName: "Empty",
                lastName: "Profile",
                email: "empty-ins@example.com",
                isActive: true,
                createdBy: adminUserA.id,
                documents: {
                    create: {
                        fileName: "smoke-insights-resume.pdf",
                        fileUrl: "uploads/resumes/smoke-insights-resume.pdf",
                        fileKey: "smoke_empty_key_ins",
                        documentType: DocumentType.RESUME,
                        isActive: true,
                        uploadedBy: adminUserA.id,
                    }
                }
            }
        });
        await assertThrows(
            () => aiInsightsService.generateInsights({ candidateId: candEmpty.id, jobId: jobA.id }, adminAAuth),
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
                candidateCode: "CAN-NOPDF-INS",
                firstName: "NoPdf",
                lastName: "Candidate",
                email: "nopdf-ins@example.com",
                isActive: true,
                createdBy: adminUserA.id,
                documents: {
                    create: {
                        fileName: "missing-resume.pdf",
                        fileUrl: "uploads/resumes/nonexistent-insights-file.pdf",
                        fileKey: "missing_pdf_key_ins",
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
            () => aiInsightsService.generateInsights({ candidateId: candMissingPdf.id, jobId: jobA.id }, adminAAuth),
            ValidationError,
            "resume pdf file could not be accessed"
        );
        await prisma.candidate.delete({ where: { id: candMissingPdf.id } });

        console.log("\n--- TEST SUITE 2: AI FAILURE PATHS ---");

        // Test 8: AI Returns Malformed / Invalid JSON
        console.log("TEST 8: AI malformed JSON response throws ValidationError and persists no records");
        aiService.generate = async () => ({
            content: "INVALID JSON { unclosed",
            responseTime: 100
        });

        const preCount = await prisma.aiInsight.count();
        await assertThrows(
            () => aiInsightsService.generateInsights({ candidateId: candidateProfileA.id, jobId: jobA.id }, adminAAuth),
            ValidationError,
            "failed to parse response from ai model as valid json"
        );
        const postCount = await prisma.aiInsight.count();
        assert(preCount === postCount, "No AiInsight record should be persisted on JSON failure");

        // Test 9: AI Returns Invalid Schema (out of bounds confidence or empty overallInsight)
        console.log("TEST 9: AI invalid schema response throws ZodError and persists nothing");
        aiService.generate = async () => ({
            content: JSON.stringify({
                overallInsight: "", // Empty violates min(1)
                strengths: ["Strong"],
                weaknesses: [],
                skillGaps: [],
                experienceConcerns: [],
                hiringRisks: [],
                hiringConfidence: 150, // Out of bounds > 100
                jobFitObservations: [],
                recruiterFocusAreas: [],
                recommendation: "Hire"
            }),
            responseTime: 120
        });

        await assertThrows(
            () => aiInsightsService.generateInsights({ candidateId: candidateProfileA.id, jobId: jobA.id }, adminAAuth),
            z.ZodError
        );
        const postSchemaCount = await prisma.aiInsight.count();
        assert(preCount === postSchemaCount, "No record should be persisted on schema validation failure");

        // Test 10: AI Service Timeout / Network Failure
        console.log("TEST 10: AI service exception propagates cleanly without corrupted records");
        aiService.generate = async () => {
            throw new Error("AI provider connection timed out");
        };

        await assertThrows(
            () => aiInsightsService.generateInsights({ candidateId: candidateProfileA.id, jobId: jobA.id }, adminAAuth),
            Error,
            "connection timed out"
        );
        const postTimeoutCount = await prisma.aiInsight.count();
        assert(preCount === postTimeoutCount, "No record persisted on AI timeout");

        console.log("\n--- TEST SUITE 3: HAPPY PATHS & PERSISTENCE ---");

        // Mock deterministic valid AI response
        const mockValidInsightAI = {
            overallInsight: "Highly qualified candidate with 6+ years of distributed backend systems experience matching the Senior Distributed Backend Engineer requirements.",
            strengths: [
                "Extensive hands-on experience scaling Node.js microservices at CloudScale Inc",
                "Advanced PostgreSQL schema optimization and performance tuning",
                "Strong educational foundation with an M.S. in Computer Science from Stanford"
            ],
            weaknesses: [
                "Limited verified experience with Kubernetes production deployments"
            ],
            skillGaps: [
                "Kubernetes"
            ],
            experienceConcerns: [
                "Has primarily worked in established cloud tech; verify transition adaptability"
            ],
            hiringRisks: [
                "Short ramp-up time required for container orchestration tooling"
            ],
            hiringConfidence: 92,
            jobFitObservations: [
                "Core responsibilities at CloudScale Inc closely mirror Job A distributed API and throughput requirements"
            ],
            recruiterFocusAreas: [
                "Deep-dive into architectural trade-offs during system design round",
                "Clarify hands-on familiarity with Kubernetes vs cloud-managed container services"
            ],
            recommendation: "Strong candidate for architectural technical panel. Recommend proceeding immediately."
        };

        // Test 11: Generate AI Insights with Full Existing Evaluations (Happy Path)
        console.log("TEST 11: Generate AI Insights with full evaluation context (Admin Auth)");
        aiService.generate = async () => ({
            content: JSON.stringify(mockValidInsightAI),
            responseTime: 280
        });

        const insightResult = await aiInsightsService.generateInsights(
            { candidateId: candidateProfileA.id, jobId: jobA.id },
            adminAAuth
        );

        assert(insightResult.id !== undefined, "Result ID must be defined");
        assert(insightResult.candidateId === candidateProfileA.id, "CandidateId must match");
        assert(insightResult.jobId === jobA.id, "JobId must match Job A");
        assert(insightResult.overallInsight === mockValidInsightAI.overallInsight, "Overall insight must match");
        assert(insightResult.hiringConfidence === 92, "Hiring confidence must be 92");
        assert(insightResult.strengths.length === 3, "Must contain 3 strengths");
        assert(insightResult.skillGaps.length === 1, "Must contain 1 skill gap");
        assert(insightResult.aiModel === AI_CONFIG.model, "AI model must match configuration");
        assert(insightResult.promptVersion === INSIGHTS_PROMPT_CONFIG.version, "Prompt version must match config");

        // Verify Direct DB Record
        const dbRecord = await prisma.aiInsight.findUnique({
            where: { id: insightResult.id }
        });
        assert(dbRecord !== null, "DB record must exist");
        assert(dbRecord!.jobId === jobA.id, "DB record jobId must match Job A");
        assert(dbRecord!.hiringConfidence === 92, "DB record hiringConfidence must match");
        console.log("   ✅ AI Insight record created and verified in database.");

        // Test 11b: Resume Recommendation Context Scoping (Verify strict candidateId + jobId + mode scoping)
        console.log("TEST 11b: Resume Recommendation Context Scoping (Verify strict candidateId + jobId + mode scoping)");
        // Seed Job B Recommendation for Candidate A
        const jobBRec = await prisma.resumeRecommendation.create({
            data: {
                candidateId: candidateProfileA.id,
                jobId: jobB.id,
                mode: ResumeRecommendationMode.JOB_SPECIFIC,
                overallSummary: "SPECIAL_JOB_B_FRONTEND_UNIQUE_RECOMMENDATION",
                recommendations: [
                    { category: "KEYWORD", suggestion: "Add React Architecture skills", impact: "HIGH" }
                ],
                aiModel: AI_CONFIG.model,
                promptVersion: "1.0.0",
            }
        });

        // Seed General Recommendation for Candidate A
        const generalRec = await prisma.resumeRecommendation.create({
            data: {
                candidateId: candidateProfileA.id,
                mode: ResumeRecommendationMode.GENERAL,
                overallSummary: "SPECIAL_GENERAL_UNIQUE_RECOMMENDATION",
                recommendations: [
                    { category: "STRUCTURE", suggestion: "Improve resume layout", impact: "LOW" }
                ],
                aiModel: AI_CONFIG.model,
                promptVersion: "1.0.0",
            }
        });

        let capturedPrompt = "";
        aiService.generate = async (prompt) => {
            capturedPrompt = typeof prompt === "string" ? prompt : JSON.stringify(prompt);
            return {
                content: JSON.stringify(mockValidInsightAI),
                responseTime: 200,
            };
        };

        // Generate for Candidate A on Job A (where Job A currently has its own recommendation seeded earlier in setup)
        await aiInsightsService.generateInsights(
            { candidateId: candidateProfileA.id, jobId: jobA.id },
            adminAAuth
        );

        // Verify that Job B recommendation is NOT in capturedPrompt
        assert(!capturedPrompt.includes("SPECIAL_JOB_B_FRONTEND_UNIQUE_RECOMMENDATION"), "Job B recommendation must NOT be included when generating insights for Job A");
        // Verify that General recommendation is NOT in capturedPrompt
        assert(!capturedPrompt.includes("SPECIAL_GENERAL_UNIQUE_RECOMMENDATION"), "General recommendation must NOT be included when generating job-specific insights");
        // Verify that Job A recommendation IS in capturedPrompt
        assert(capturedPrompt.includes("Strong resume tailored for senior distributed systems roles"), "Job A recommendation MUST be included in the evaluation context");
        console.log("   ✅ Resume Recommendation context scoping strictly verified.");

        // Cleanup test recommendations
        await prisma.resumeRecommendation.deleteMany({
            where: { id: { in: [jobBRec.id, generalRec.id] } }
        });

        // Test 12: Generate AI Insights without prior evaluations (Candidate B on Job A)
        console.log("TEST 12: Generate AI Insights without prior evaluations (Graceful fallback)");
        aiService.generate = async () => ({
            content: JSON.stringify({
                ...mockValidInsightAI,
                overallInsight: "Frontend candidate evaluated against backend job opening.",
                hiringConfidence: 45,
                recommendation: "Not recommended for backend role."
            }),
            responseTime: 260
        });

        const candBInsight = await aiInsightsService.generateInsights(
            { candidateId: candidateProfileB.id, jobId: jobA.id },
            adminAAuth
        );
        assert(candBInsight.id !== undefined, "Insight generated without prior evaluations");
        assert(candBInsight.hiringConfidence === 45, "Confidence matches fallback generation");
        console.log("   ✅ Fallback generation without prior evaluations verified.");

        // Test 13: Immutable History (Repeated Generation creates distinct records)
        console.log("TEST 13: Immutable history - Repeated generation creates distinct records");
        const secondGenResult = await aiInsightsService.generateInsights(
            { candidateId: candidateProfileA.id, jobId: jobA.id },
            adminAAuth
        );
        assert(secondGenResult.id !== insightResult.id, "Second generation must produce a new unique ID");

        const firstRecordCheck = await prisma.aiInsight.findUnique({
            where: { id: insightResult.id }
        });
        assert(firstRecordCheck !== null, "First record must remain untouched");
        console.log("   ✅ Historical evaluations are immutable and preserved.");

        // Test 14: Get Candidate AI Insights History
        console.log("TEST 14: Get Candidate AI Insights History (Newest first)");
        const history = await aiInsightsService.getInsightsHistory(
            candidateProfileA.id,
            adminAAuth
        );

        assert(history.length >= 2, `History must contain at least 2 records, got ${history.length}`);
        assert(history[0].id === secondGenResult.id, "Newest record must be first in history list");
        assert(new Date(history[0].createdAt).getTime() >= new Date(history[1].createdAt).getTime(), "History must be sorted newest first");
        console.log("   ✅ History correctly returned in descending chronological order.");

        // Test 15: Get AI Insight Details
        console.log("TEST 15: Get AI Insight Details");
        const details = await aiInsightsService.getInsightsDetails(insightResult.id, adminAAuth);
        assert(details.id === insightResult.id, "Details ID must match");
        assert(details.strengths.length === 3, "Strengths array must be populated in details");
        assert(details.jobFitObservations.length > 0, "Job fit observations must be populated");

        // Test 15b: Nonexistent details ID throws NotFoundError
        await assertThrows(
            () => aiInsightsService.getInsightsDetails("clxyznonexist0000t3t1cr4a6136", adminAAuth),
            NotFoundError,
            "ai insight not found"
        );
        console.log("   ✅ Details retrieval verified.");

        console.log("\n--- TEST SUITE 4: SECURITY & AUTHORIZATION MATRIX ---");

        // Test 16: Candidate Role Access Rejection (AI Insights is Admin/Recruiter only)
        console.log("TEST 16: Candidate role cannot generate insights, view history, or view details");
        await assertThrows(
            () => aiInsightsService.generateInsights({ candidateId: candidateProfileA.id, jobId: jobA.id }, candidateAAuth),
            ForbiddenError,
            "do not have permission"
        );
        await assertThrows(
            () => aiInsightsService.getInsightsHistory(candidateProfileA.id, candidateAAuth),
            ForbiddenError,
            "do not have permission"
        );
        await assertThrows(
            () => aiInsightsService.getInsightsDetails(insightResult.id, candidateAAuth),
            ForbiddenError,
            "do not have permission"
        );
        console.log("   ✅ Candidate role access strictly rejected.");

        // Test 17: Recruiter Job Assignment Scoping
        console.log("TEST 17: Recruiter job assignment scoping");
        // Recruiter A assigned to Job A -> PASS
        const recJobA = await aiInsightsService.generateInsights(
            { candidateId: candidateProfileA.id, jobId: jobA.id },
            recruiterAAuth
        );
        assert(recJobA.id !== undefined, "Recruiter A assigned to Job A -> should succeed");

        // Recruiter A is NOT assigned to Job B -> FORBIDDEN
        await assertThrows(
            () => aiInsightsService.generateInsights({ candidateId: candidateProfileB.id, jobId: jobB.id }, recruiterAAuth),
            ForbiddenError,
            "do not have permission to access this job"
        );
        console.log("   ✅ Recruiter unassigned job restriction enforced.");

        // Test 18: Recruiter History Filtering (Unassigned job insights hidden)
        console.log("TEST 18: Recruiter history filtering hides unassigned job insights");
        // Generate a Job B insight as Admin
        const jobBInsight = await aiInsightsService.generateInsights(
            { candidateId: candidateProfileB.id, jobId: jobB.id },
            adminAAuth
        );
        assert(jobBInsight.id !== undefined, "Job B insight created by admin");

        // Recruiter A views Candidate B history: should NOT see Job B specific insight
        const recAHistoryForB = await aiInsightsService.getInsightsHistory(candidateProfileB.id, recruiterAAuth);
        const hasJobBInsight = recAHistoryForB.some((h) => h.id === jobBInsight.id);
        assert(!hasJobBInsight, "Recruiter A must NOT see Job B insight in Candidate B's history");
        console.log("   ✅ Recruiter history query-level isolation verified.");

        // Test 19: Cross-Company Isolation (Company A user cannot access Company B records)
        console.log("TEST 19: Cross-Company Access Isolation");
        // Admin A attempts Candidate C (Company B)
        await assertThrows(
            () => aiInsightsService.generateInsights({ candidateId: candidateProfileC.id, jobId: jobA.id }, adminAAuth),
            NotFoundError,
            "candidate not found"
        );

        // Admin A attempts Job C (Company B)
        await assertThrows(
            () => aiInsightsService.generateInsights({ candidateId: candidateProfileA.id, jobId: jobC.id }, adminAAuth),
            ForbiddenError,
            "cross-company access is forbidden"
        );

        // Recruiter A attempts Candidate C
        await assertThrows(
            () => aiInsightsService.getInsightsHistory(candidateProfileC.id, recruiterAAuth),
            NotFoundError,
            "candidate not found"
        );

        // Admin B cannot access Candidate A history
        await assertThrows(
            () => aiInsightsService.getInsightsHistory(candidateProfileA.id, adminBAuth),
            NotFoundError,
            "candidate not found"
        );
        console.log("   ✅ Cross-company multi-tenant isolation strictly verified.");

        console.log("\n--- TEST SUITE 5: RELATIONAL INTEGRITY & CASCADE BEHAVIOR ---");

        // Test 20: Candidate Deletion Cascade (GDPR Compliance)
        console.log("TEST 20: Candidate deletion cascades to remove AiInsight records");
        const cascadeCand = await prisma.candidate.create({
            data: {
                companyId: companyA.id,
                primaryRecruiterId: recruiterA.id,
                candidateCode: "CAN-CASCADE-INS",
                firstName: "Cascade",
                lastName: "Candidate",
                email: "cascade-ins@example.com",
                isActive: true,
                createdBy: adminUserA.id,
                documents: {
                    create: {
                        fileName: "smoke-insights-resume.pdf",
                        fileUrl: "uploads/resumes/smoke-insights-resume.pdf",
                        fileKey: "smoke_casc_key_ins",
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

        const cascadeInsight = await aiInsightsService.generateInsights(
            { candidateId: cascadeCand.id, jobId: jobA.id },
            adminAAuth
        );
        assert(cascadeInsight.id !== undefined, "Cascade insight created");

        // Delete candidate
        await prisma.candidate.delete({ where: { id: cascadeCand.id } });

        // Verify AiInsight record was cascaded
        const cascadedRecord = await prisma.aiInsight.findUnique({
            where: { id: cascadeInsight.id }
        });
        assert(cascadedRecord === null, "AiInsight record must be deleted via CASCADE on Candidate deletion");
        console.log("   ✅ Candidate deletion CASCADE verified.");

        // Test 21: Job Deletion SetNull (Preserves History)
        console.log("TEST 21: Job deletion sets jobId to NULL without deleting history");
        const tempJob = await prisma.job.create({
            data: {
                companyId: companyA.id,
                departmentId: deptA.id,
                jobCode: "JOB-TEMP-INS",
                title: "Temporary Job",
                description: "Temporary role for SetNull test",
                employmentType: "FULL_TIME",
                workplaceType: "REMOTE",
                openings: 1,
                isActive: true,
                createdBy: adminUserA.id,
            }
        });

        const setNullInsight = await prisma.aiInsight.create({
            data: {
                candidateId: candidateProfileA.id,
                jobId: tempJob.id,
                overallInsight: "Temp job insight summary",
                strengths: ["Fast learner"],
                weaknesses: [],
                skillGaps: [],
                experienceConcerns: [],
                hiringRisks: [],
                hiringConfidence: 80,
                jobFitObservations: ["Good match"],
                recruiterFocusAreas: ["Culture fit"],
                recommendation: "Hire",
                aiModel: AI_CONFIG.model,
                promptVersion: INSIGHTS_PROMPT_CONFIG.version,
            }
        });

        // Delete the temporary job
        await prisma.job.delete({ where: { id: tempJob.id } });

        // Verify AiInsight record still exists with jobId = null
        const preservedRecord = await prisma.aiInsight.findUnique({
            where: { id: setNullInsight.id }
        });
        assert(preservedRecord !== null, "AiInsight record must NOT be deleted when job is deleted");
        assert(preservedRecord!.jobId === null, "AiInsight record jobId must be set to NULL (SetNull)");
        console.log("   ✅ Job deletion SetNull behavior verified.");

        // Test 21b: Deleted-Job Authorization Matrix (Recruiter vs Admin access on deleted job insights)
        console.log("TEST 21b: Deleted-job authorization matrix (Admin vs Assigned Recruiter vs Unassigned Recruiter vs Cross-Company)");
        const jobForDelete = await prisma.job.create({
            data: {
                companyId: companyA.id,
                departmentId: deptA.id,
                jobCode: "JOB-DEL-AUTH-INS",
                title: "Job to be Deleted",
                description: "Temporary role for deleted-job authorization verification",
                employmentType: "FULL_TIME",
                workplaceType: "REMOTE",
                openings: 1,
                isActive: true,
                createdBy: adminUserA.id,
                recruiters: {
                    create: { recruiterId: recruiterA.id, assignedById: adminUserA.id }
                }
            }
        });

        const deletedJobInsight = await aiInsightsService.generateInsights(
            { candidateId: candidateProfileA.id, jobId: jobForDelete.id },
            adminAAuth
        );
        assert(deletedJobInsight.id !== undefined, "Insight generated before job deletion");

        // Delete the job
        await prisma.job.delete({ where: { id: jobForDelete.id } });

        // Confirm record remains with jobId = null
        const orphanedInsight = await prisma.aiInsight.findUnique({
            where: { id: deletedJobInsight.id }
        });
        assert(orphanedInsight !== null, "AiInsight must remain after job deletion");
        assert(orphanedInsight!.jobId === null, "AiInsight jobId must be set to null");

        // 1. Company Admin A (same company) can view in history and details
        const adminHistory = await aiInsightsService.getInsightsHistory(candidateProfileA.id, adminAAuth);
        assert(adminHistory.some((h) => h.id === deletedJobInsight.id), "Company Admin A must still see deleted-job insight in history");
        const adminDetails = await aiInsightsService.getInsightsDetails(deletedJobInsight.id, adminAAuth);
        assert(adminDetails.id === deletedJobInsight.id, "Company Admin A must be able to view deleted-job insight details");

        // 2. Recruiter A (formerly assigned to the deleted job) CANNOT view deleted job insight in history or details
        const recAHistory = await aiInsightsService.getInsightsHistory(candidateProfileA.id, recruiterAAuth);
        assert(!recAHistory.some((h) => h.id === deletedJobInsight.id), "Recruiter A must NOT see deleted-job insight in history");
        await assertThrows(
            () => aiInsightsService.getInsightsDetails(deletedJobInsight.id, recruiterAAuth),
            ForbiddenError,
            "permission to access insights for a deleted job"
        );

        // 3. Recruiter A2 (same company A, unassigned to the job) CANNOT view deleted job insight in history or details
        const recA2History = await aiInsightsService.getInsightsHistory(candidateProfileA.id, recruiterA2Auth);
        assert(!recA2History.some((h) => h.id === deletedJobInsight.id), "Recruiter A2 must NOT see deleted-job insight in history");
        await assertThrows(
            () => aiInsightsService.getInsightsDetails(deletedJobInsight.id, recruiterA2Auth),
            ForbiddenError,
            "permission to access insights for a deleted job"
        );

        // 4. Cross-company user (Admin B from Company B) cannot access candidate or deleted-job insight
        await assertThrows(
            () => aiInsightsService.getInsightsHistory(candidateProfileA.id, adminBAuth),
            NotFoundError,
            "candidate not found"
        );
        await assertThrows(
            () => aiInsightsService.getInsightsDetails(deletedJobInsight.id, adminBAuth),
            NotFoundError,
            "candidate not found"
        );
        console.log("   ✅ Deleted-job authorization matrix strictly verified.");

        console.log("\n--- TEST SUITE 6: ROUTE PARAMETER & SCHEMA VALIDATION ---");

        // Test 22: Route Param Schema Validation
        console.log("TEST 22: Route parameter schemas (GetInsightsHistoryParamsSchema & GetInsightsDetailsParamsSchema)");
        assert(GetInsightsHistoryParamsSchema.safeParse({ candidateId: candidateProfileA.id }).success, "Valid history params must pass");
        assert(!GetInsightsHistoryParamsSchema.safeParse({ candidateId: "not-a-cuid" }).success, "Invalid history params must fail");
        assert(GetInsightsDetailsParamsSchema.safeParse({ id: insightResult.id }).success, "Valid details params must pass");
        assert(!GetInsightsDetailsParamsSchema.safeParse({ id: "invalid-id" }).success, "Invalid details params must fail");
        console.log("   ✅ Parameter validation schemas verified.");

        console.log("\n=======================================================");
        console.log("🎉 ALL TEST SUITES IN AI INSIGHTS SMOKE SUITE PASSED SUCCESSFULLY!");
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
                await prisma.aiInsight.deleteMany({
                    where: { candidate: { companyId: comp.id } }
                });
                await prisma.interviewAssistant.deleteMany({
                    where: { candidate: { companyId: comp.id } }
                });
                await prisma.resumeRecommendation.deleteMany({
                    where: { candidate: { companyId: comp.id } }
                });
                await prisma.jobMatch.deleteMany({
                    where: { candidate: { companyId: comp.id } }
                });
                await prisma.aTSScore.deleteMany({
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
            console.log("AI Insights smoke test run completed.");
            process.exit(0);
        })
        .catch((err) => {
            console.error("❌ AI Insights smoke test failed:", err);
            process.exit(1);
        });
}

export { runSmokeTests };
