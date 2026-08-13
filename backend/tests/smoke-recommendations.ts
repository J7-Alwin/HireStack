import { prisma } from "../src/config/prisma";
import { Role, AccountStatus, DocumentType } from "@prisma/client";
import { resumeRecommendationService } from "../src/modules/ai/services/resume-recommendation.service";
import { AuthenticatedUser } from "../src/shared/types";
import { ForbiddenError } from "../src/shared/errors";

async function runSmokeTests() {
    console.log("=== STARTING RESUME RECOMMENDATION SECURITY SMOKE TESTS ===");

    // 1. Load seeded base data
    const company = await prisma.company.findFirst({
        where: { name: "HireStack Pvt Ltd" }
    });
    if (!company) throw new Error("Seed company not found.");

    const department = await prisma.department.findFirst({
        where: { companyId: company.id }
    });
    if (!department) throw new Error("Seed department not found.");

    const companyAdminUser = await prisma.user.findFirst({
        where: { email: "j7alwin@gmail.com" }
    });
    if (!companyAdminUser) throw new Error("Seed company admin user not found.");

    // Create Recruiter A & B Users
    const recruiterAEmail = "recruiter-a@example.com";
    let recruiterA = await prisma.user.findUnique({ where: { email: recruiterAEmail } });
    if (!recruiterA) {
        recruiterA = await prisma.user.create({
            data: {
                email: recruiterAEmail,
                password: "hashedPassword123",
                name: "Recruiter A",
                role: Role.RECRUITER,
                status: AccountStatus.ACTIVE,
                companyId: company.id,
            }
        });
    }

    const recruiterBEmail = "recruiter-b@example.com";
    let recruiterB = await prisma.user.findUnique({ where: { email: recruiterBEmail } });
    if (!recruiterB) {
        recruiterB = await prisma.user.create({
            data: {
                email: recruiterBEmail,
                password: "hashedPassword123",
                name: "Recruiter B",
                role: Role.RECRUITER,
                status: AccountStatus.ACTIVE,
                companyId: company.id,
            }
        });
    }

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
        await prisma.candidate.delete({ where: { id: candidate.id } });
    }

    candidate = await prisma.candidate.create({
        data: {
            companyId: company.id,
            primaryRecruiterId: recruiterB.id,
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

    console.log(`Created Candidate Profile: ${candidate.firstName} (ID: ${candidate.id})`);

    // 3. Create Job A (assigned to Recruiter A)
    const jobACode = "JOB-A-99999";
    let jobA = await prisma.job.findUnique({ where: { jobCode: jobACode } });
    if (jobA) {
        await prisma.job.delete({ where: { id: jobA.id } });
    }
    jobA = await prisma.job.create({
        data: {
            companyId: company.id,
            departmentId: department.id,
            jobCode: jobACode,
            title: "Backend Dev Job A",
            description: "Backend Job A requiring Node.js",
            requirements: "Node.js",
            responsibilities: "Write code",
            employmentType: "FULL_TIME",
            workplaceType: "HYBRID",
            openings: 1,
            isActive: true,
            createdBy: companyAdminUser.id,
            recruiters: {
                create: [
                    {
                        recruiterId: recruiterA.id,
                        assignedById: companyAdminUser.id,
                    }
                ]
            }
        }
    });

    // Create Job B (assigned to Recruiter B)
    const jobBCode = "JOB-B-99999";
    let jobB = await prisma.job.findUnique({ where: { jobCode: jobBCode } });
    if (jobB) {
        await prisma.job.delete({ where: { id: jobB.id } });
    }
    jobB = await prisma.job.create({
        data: {
            companyId: company.id,
            departmentId: department.id,
            jobCode: jobBCode,
            title: "Backend Dev Job B",
            description: "Backend Job B requiring TypeScript",
            requirements: "TypeScript",
            responsibilities: "Write code",
            employmentType: "FULL_TIME",
            workplaceType: "HYBRID",
            openings: 1,
            isActive: true,
            createdBy: companyAdminUser.id,
            recruiters: {
                create: [
                    {
                        recruiterId: recruiterB.id,
                        assignedById: companyAdminUser.id,
                    }
                ]
            }
        }
    });

    console.log(`Created Job A: ${jobA.title} (ID: ${jobA.id}, Recruiter A: ${recruiterA.name})`);
    console.log(`Created Job B: ${jobB.title} (ID: ${jobB.id}, Recruiter B: ${recruiterB.name})`);

    // Prepare Auth Users
    const candidateUserAuth: AuthenticatedUser = {
        id: candidateUser.id,
        email: candidateUser.email,
        role: "CANDIDATE",
        status: AccountStatus.ACTIVE,
        companyId: company.id,
    };

    const recruiterAAuth: AuthenticatedUser = {
        id: recruiterA.id,
        email: recruiterA.email,
        role: "RECRUITER",
        status: AccountStatus.ACTIVE,
        companyId: company.id,
    };

    const recruiterBAuth: AuthenticatedUser = {
        id: recruiterB.id,
        email: recruiterB.email,
        role: "RECRUITER",
        status: AccountStatus.ACTIVE,
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
    console.log("TEST 1 PASSED: General Resume recommendations successfully generated.");
    console.log("- Mode:", generalResult.mode);
    console.log("- Overall Summary:", generalResult.overallSummary);

    // -------------------------------------------------------------
    // TEST 2: Generate JOB_SPECIFIC Recommendations for Job B using Recruiter B
    // -------------------------------------------------------------
    console.log("\n--- TEST 2: Running JOB_SPECIFIC Mode Resume Optimization for Job B ---");
    const jobSpecificBResult = await resumeRecommendationService.generateJobRecommendations(
        { candidateId: candidate.id, jobId: jobB.id },
        recruiterBAuth
    );
    console.log("TEST 2 PASSED: Job B Specific recommendations successfully generated by Recruiter B.");
    console.log("- Mode:", jobSpecificBResult.mode);
    console.log("- Recommendations count:", jobSpecificBResult.recommendations.length);

    // -------------------------------------------------------------
    // TEST 3: Recruiter A attempting to generate recommendations for Job B (should fail)
    // -------------------------------------------------------------
    console.log("\n--- TEST 3: Recruiter A attempting to generate Job-Specific recommendations for Job B ---");
    try {
        await resumeRecommendationService.generateJobRecommendations(
            { candidateId: candidate.id, jobId: jobB.id },
            recruiterAAuth
        );
        throw new Error("FAIL: Recruiter A was able to generate recommendations for Job B!");
    } catch (error) {
        if (error instanceof ForbiddenError) {
            console.log("TEST 3 PASSED: Generation blocked as expected:", error.message);
        } else {
            throw error;
        }
    }

    // -------------------------------------------------------------
    // TEST 4: Recruiter A attempting to retrieve details of Job B recommendation (should fail)
    // -------------------------------------------------------------
    console.log("\n--- TEST 4: Recruiter A attempting to retrieve details for Job B recommendation ---");
    try {
        await resumeRecommendationService.getRecommendationDetails(
            jobSpecificBResult.id,
            recruiterAAuth
        );
        throw new Error("FAIL: Recruiter A was able to retrieve details for Job B recommendation!");
    } catch (error) {
        if (error instanceof ForbiddenError) {
            console.log("TEST 4 PASSED: Retrieval blocked as expected:", error.message);
        } else {
            throw error;
        }
    }

    // -------------------------------------------------------------
    // TEST 5: Recruiter A requesting history of Candidate (should not contain Job B recommendations)
    // -------------------------------------------------------------
    console.log("\n--- TEST 5: Recruiter A requesting candidate history ---");
    const recruiterAHistory = await resumeRecommendationService.getRecommendationsHistory(
        candidate.id,
        recruiterAAuth
    );

    const hasJobBRec = recruiterAHistory.some((h) => h.id === jobSpecificBResult.id);
    if (hasJobBRec) {
        throw new Error("FAIL: Candidate history for Recruiter A contained the unauthorized Job B recommendation!");
    }
    console.log("TEST 5 PASSED: History fetched for Recruiter A successfully filtered out Job B recommendations.");
    console.log("- Count of visible reviews for Recruiter A:", recruiterAHistory.length);
    for (const h of recruiterAHistory) {
        console.log(`  * ID: ${h.id} | Mode: ${h.mode} | Overall Summary: ${h.overallSummary}`);
    }

    // Verify Recruiter B history contains both Job B and General recommendations
    console.log("\n--- TEST 6: Recruiter B requesting candidate history ---");
    const recruiterBHistory = await resumeRecommendationService.getRecommendationsHistory(
        candidate.id,
        recruiterBAuth
    );
    const hasJobBRecForB = recruiterBHistory.some((h) => h.id === jobSpecificBResult.id);
    if (!hasJobBRecForB) {
        throw new Error("FAIL: Recruiter B history is missing their own Job B recommendation!");
    }
    console.log("TEST 6 PASSED: Recruiter B history correctly displays the Job B recommendations.");
    console.log("- Count of visible reviews for Recruiter B:", recruiterBHistory.length);

    // -------------------------------------------------------------
    // Clean up test data
    // -------------------------------------------------------------
    console.log("\nCleaning up test database records...");
    await prisma.resumeRecommendation.deleteMany({
        where: { candidateId: candidate.id }
    });
    await prisma.candidate.delete({ where: { id: candidate.id } });
    await prisma.job.delete({ where: { id: jobA.id } });
    await prisma.job.delete({ where: { id: jobB.id } });
    await prisma.user.delete({ where: { id: recruiterA.id } });
    await prisma.user.delete({ where: { id: recruiterB.id } });
    await prisma.user.delete({ where: { id: candidateUser.id } });

    console.log("\n=== ALL RESUME RECOMMENDATION SMOKE TESTS PASSED! ===");
}

runSmokeTests().catch((error) => {
    console.error("SMOKE TEST RUN FAILED:", error);
    process.exit(1);
});
