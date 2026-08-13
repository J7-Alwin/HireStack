import { prisma } from "../src/config/prisma";
import { Role, AccountStatus, DocumentType } from "@prisma/client";
import { resumeRecommendationService } from "../src/modules/ai/services/resume-recommendation.service";
import { AuthenticatedUser } from "../src/shared/types";
import { logger } from "../src/shared/logger/logger";
import { ForbiddenError } from "../src/shared/errors";

async function runSmokeTests() {
    console.log("=== STARTING RESUME RECOMMENDATION SMOKE TESTS ===");

    // 1. Load seeded base data
    const company = await prisma.company.findFirst({
        where: { name: "HireStack Pvt Ltd" }
    });
    if (!company) throw new Error("Seed company not found.");

    const department = await prisma.department.findFirst({
        where: { companyId: company.id }
    });
    if (!department) throw new Error("Seed department not found.");

    const recruiterUser = await prisma.user.findFirst({
        where: { email: "24mcab08@kristujayanti.com" }
    });
    if (!recruiterUser) throw new Error("Seed recruiter user not found.");

    const companyAdminUser = await prisma.user.findFirst({
        where: { email: "j7alwin@gmail.com" }
    });
    if (!companyAdminUser) throw new Error("Seed company admin user not found.");

    // Create a Candidate User
    const candidateUserEmail = "test-candidate-user@example.com";
    let candidateUser = await prisma.user.findUnique({ where: { email: candidateUserEmail } });
    if (!candidateUser) {
        candidateUser = await prisma.user.create({
            data: {
                email: candidateUserEmail,
                password: "hashedPassword123",
                name: "Test Candidate User",
                role: Role.CANDIDATE,
                status: AccountStatus.ACTIVE,
                companyId: company.id,
            }
        });
    }

    // 2. Create Candidate profile
    const candidateCode = "CAN-99999";
    let candidate = await prisma.candidate.findFirst({ where: { candidateCode } });
    if (candidate) {
        // Clean up previous run if any
        await prisma.candidate.delete({ where: { id: candidate.id } });
    }

    candidate = await prisma.candidate.create({
        data: {
            companyId: company.id,
            primaryRecruiterId: recruiterUser.id,
            candidateCode,
            firstName: "John",
            lastName: "Doe",
            email: candidateUserEmail,
            phone: "+1234567890",
            isActive: true,
            createdBy: companyAdminUser.id,
            skills: {
                create: [
                    {
                        skill: {
                            connectOrCreate: {
                                where: { name: "Node.js" },
                                create: { name: "Node.js" }
                            }
                        },
                        proficiency: "ADVANCED",
                        experienceYears: 3,
                    },
                    {
                        skill: {
                            connectOrCreate: {
                                where: { name: "TypeScript" },
                                create: { name: "TypeScript" }
                            }
                        },
                        proficiency: "INTERMEDIATE",
                        experienceYears: 2,
                    }
                ]
            },
            experience: {
                create: [
                    {
                        company: "Tech Corp",
                        designation: "Software Engineer",
                        startDate: new Date("2022-01-01"),
                        isCurrent: true,
                        description: "Developed backend APIs using Node.js and TypeScript, optimizing database queries.",
                    }
                ]
            },
            education: {
                create: [
                    {
                        degree: "Bachelor of Technology",
                        specialization: "Computer Science",
                        institution: "State University",
                        graduationYear: 2021,
                    }
                ]
            },
            documents: {
                create: [
                    {
                        fileName: "resume.pdf",
                        fileUrl: "uploads/resumes/resume.pdf",
                        fileKey: "resume_key_99999",
                        documentType: DocumentType.RESUME,
                        isActive: true,
                        uploadedBy: companyAdminUser.id,
                    }
                ]
            }
        },
        include: {
            skills: { include: { skill: true } },
            education: true,
            experience: true,
            documents: true,
        }
    });

    console.log(`Created Candidate Profile: ${candidate.firstName} ${candidate.lastName} (ID: ${candidate.id})`);

    // 3. Create a Job profile
    const jobCode = "JOB-99999";
    let job = await prisma.job.findUnique({ where: { jobCode } });
    if (job) {
        await prisma.job.delete({ where: { id: job.id } });
    }

    job = await prisma.job.create({
        data: {
            companyId: company.id,
            departmentId: department.id,
            jobCode,
            title: "Backend Engineer (Node.js & TypeScript)",
            description: "We are looking for a Node.js and TypeScript backend engineer. Experience building REST APIs and SQL optimization is required. Knowledge of Docker is a plus.",
            requirements: "TypeScript, Node.js, SQL, REST APIs. Docker is preferred.",
            responsibilities: "Write clean, performant backend code, write unit tests, design databases.",
            employmentType: "FULL_TIME",
            workplaceType: "HYBRID",
            experienceMin: 2,
            experienceMax: 5,
            openings: 1,
            isActive: true,
            createdBy: companyAdminUser.id,
            recruiters: {
                create: [
                    {
                        recruiterId: recruiterUser.id,
                        assignedById: companyAdminUser.id,
                    }
                ]
            },
            skills: {
                create: [
                    {
                        skill: {
                            connectOrCreate: {
                                where: { name: "Node.js" },
                                create: { name: "Node.js" }
                            }
                        }
                    },
                    {
                        skill: {
                            connectOrCreate: {
                                where: { name: "TypeScript" },
                                create: { name: "TypeScript" }
                            }
                        }
                    }
                ]
            }
        }
    });

    console.log(`Created Job Profile: ${job.title} (ID: ${job.id})`);

    // Prepare Auth Users
    const candidateUserAuth: AuthenticatedUser = {
        id: candidateUser.id,
        email: candidateUser.email,
        role: "CANDIDATE",
        status: "ACTIVE" as any,
        companyId: company.id,
    };

    const recruiterUserAuth: AuthenticatedUser = {
        id: recruiterUser.id,
        email: recruiterUser.email,
        role: "RECRUITER",
        status: "ACTIVE" as any,
        companyId: company.id,
    };

    const companyAdminUserAuth: AuthenticatedUser = {
        id: companyAdminUser.id,
        email: companyAdminUser.email,
        role: "COMPANY_ADMIN",
        status: "ACTIVE" as any,
        companyId: company.id,
    };

    // -------------------------------------------------------------
    // TEST 1: Generate GENERAL Recommendations (without job ID)
    // -------------------------------------------------------------
    console.log("\n--- TEST 1: Running GENERAL Mode Resume Review ---");
    const generalResult = await resumeRecommendationService.generateGeneralRecommendations(
        { candidateId: candidate.id },
        candidateUserAuth
    );
    console.log("TEST 1 PASSED: General Resume recommendations successfully generated:");
    console.log("- Mode:", generalResult.mode);
    console.log("- Overall Summary:", generalResult.overallSummary);
    console.log("- Total recommendations count:", generalResult.recommendations.length);
    if (generalResult.recommendations.length > 0) {
        console.log("- Sample Category:", generalResult.recommendations[0].category);
        console.log("- Sample Recommendation:", generalResult.recommendations[0].recommendation);
    }

    // -------------------------------------------------------------
    // TEST 2: Generate JOB_SPECIFIC Recommendations
    // -------------------------------------------------------------
    console.log("\n--- TEST 2: Running JOB_SPECIFIC Mode Resume Optimization ---");
    const jobSpecificResult = await resumeRecommendationService.generateJobRecommendations(
        { candidateId: candidate.id, jobId: job.id },
        recruiterUserAuth
    );
    console.log("TEST 2 PASSED: Job-Specific Resume recommendations successfully generated:");
    console.log("- Mode:", jobSpecificResult.mode);
    console.log("- Overall Summary:", jobSpecificResult.overallSummary);
    console.log("- Total recommendations count:", jobSpecificResult.recommendations.length);

    // -------------------------------------------------------------
    // TEST 3: Retrieve History
    // -------------------------------------------------------------
    console.log("\n--- TEST 3: Fetching Recommendations History ---");
    const history = await resumeRecommendationService.getRecommendationsHistory(
        candidate.id,
        candidateUserAuth
    );
    console.log("TEST 3 PASSED: History fetched successfully:");
    console.log("- Count of historical evaluations:", history.length);
    for (const h of history) {
        console.log(`  * ID: ${h.id} | Mode: ${h.mode} | Overall Summary: ${h.overallSummary}`);
    }

    // -------------------------------------------------------------
    // TEST 4: Retrieve Details
    // -------------------------------------------------------------
    console.log("\n--- TEST 4: Fetching Recommendation Details ---");
    const latestRec = history[0];
    const details = await resumeRecommendationService.getRecommendationDetails(
        latestRec.id,
        recruiterUserAuth
    );
    console.log("TEST 4 PASSED: Details fetched successfully:");
    console.log("- Mode:", details.mode);
    console.log("- Recommendations details count:", details.recommendations.length);

    // -------------------------------------------------------------
    // TEST 5: Enforce Candidate Ownership boundaries
    // -------------------------------------------------------------
    console.log("\n--- TEST 5: Enforcing Candidate boundaries ---");
    const anotherCandidateUserAuth: AuthenticatedUser = {
        id: "some_other_user_id",
        email: "other-candidate@example.com",
        role: "CANDIDATE",
        status: "ACTIVE" as any,
        companyId: company.id,
    };

    try {
        await resumeRecommendationService.generateGeneralRecommendations(
            { candidateId: candidate.id },
            anotherCandidateUserAuth
        );
        throw new Error("FAIL: Allowed unauthorized candidate to access candidate recommendations!");
    } catch (error) {
        if (error instanceof ForbiddenError) {
            console.log("TEST 5 PASSED: Unauthorized candidate access was successfully blocked:", error.message);
        } else {
            throw error;
        }
    }

    // -------------------------------------------------------------
    // Clean up test data
    // -------------------------------------------------------------
    console.log("\nCleaning up test data...");
    await prisma.resumeRecommendation.deleteMany({
        where: { candidateId: candidate.id }
    });
    await prisma.candidate.delete({ where: { id: candidate.id } });
    await prisma.job.delete({ where: { id: job.id } });
    await prisma.user.delete({ where: { id: candidateUser.id } });

    console.log("\n=== ALL RESUME RECOMMENDATION SMOKE TESTS PASSED! ===");
}

runSmokeTests().catch((error) => {
    console.error("SMOKE TEST RUN FAILED:", error);
    process.exit(1);
});
