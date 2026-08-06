import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../../config/prisma";
import { candidateService } from "../../candidates/candidate.service";
import { AuthenticatedUser } from "../../../shared/types";
import { SkillProficiency, DocumentType } from "@prisma/client";
import { logger } from "../../../shared/logger/logger";
import { ValidationError } from "../../../shared/errors";

import { PdfExtractor } from "../utils/pdf-extractor";
import { PromptBuilder } from "../utils/prompt-builder";
import { JsonParser } from "../utils/json-parser";
import { RESUME_PARSER_PROMPT } from "../prompts/resume.prompt";
import { aiService } from "./ai.service";
import { ResumeData } from "../types/resume.types";
import { ResumeSchema } from "../schemas/resume.schema";

// Helper to safely parse dates from AI into valid ISO 8601 datetime strings
function parseDateToISO(dateStr: string | null | undefined): string | null {
    if (!dateStr) return null;
    const trimmed = dateStr.trim().toLowerCase();
    if (
        trimmed === "present" ||
        trimmed === "current" ||
        trimmed === "now" ||
        trimmed === "" ||
        trimmed === "null"
    ) {
        return null;
    }

    // Try parsing as simple year (e.g. "2020")
    if (/^\d{4}$/.test(trimmed)) {
        return `${trimmed}-01-01T00:00:00.000Z`;
    }

    // Try parsing year and month (e.g. "2020-05" or "05-2020" or "2020/05" or "05/2020")
    if (/^\d{4}[-\/]\d{1,2}$/.test(trimmed)) {
        const [y, m] = trimmed.split(/[-\/]/);
        return `${y}-${m.padStart(2, "0")}-01T00:00:00.000Z`;
    }
    if (/^\d{1,2}[-\/]\d{4}$/.test(trimmed)) {
        const [m, y] = trimmed.split(/[-\/]/);
        return `${y}-${m.padStart(2, "0")}-01T00:00:00.000Z`;
    }

    // Try standard parsing
    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed)) {
        return new Date(parsed).toISOString();
    }

    return null;
}

// Helper to extract a graduation year integer
function parseGraduationYear(yearStr: string | null | undefined): number | null {
    if (!yearStr) return null;
    const match = yearStr.match(/\d{4}/);
    if (match) {
        const year = parseInt(match[0], 10);
        if (year >= 1900 && year <= 2100) {
            return year;
        }
    }
    return null;
}

// Helper to map AI skill level to SkillProficiency enum
function mapProficiency(level: string | null | undefined): SkillProficiency {
    if (!level) return SkillProficiency.INTERMEDIATE;
    const lvl = level.toLowerCase();
    if (lvl.includes("expert") || lvl.includes("lead")) {
        return SkillProficiency.EXPERT;
    }
    if (lvl.includes("advanced") || lvl.includes("senior")) {
        return SkillProficiency.ADVANCED;
    }
    if (lvl.includes("beginner") || lvl.includes("junior")) {
        return SkillProficiency.BEGINNER;
    }
    return SkillProficiency.INTERMEDIATE;
}

export class ResumeParserService {
    async parseResume(file: Express.Multer.File, currentUser: AuthenticatedUser): Promise<any> {
        logger.info("Resume Upload Started", {
            fileName: file.originalname,
            fileSize: file.size,
            userId: currentUser.id,
        });

        logger.info("Resume Parsing Started");
        const uploadTimerStart = Date.now();

        // Step 1: Extract plain text from PDF buffer
        let resumeText: string;
        try {
            resumeText = await PdfExtractor.extract(file.buffer);
            logger.info("PDF Extraction Complete");
        } catch (error) {
            logger.error("Parsing Errors", { error: error instanceof Error ? error.message : "PDF extraction failed" });
            throw new ValidationError("Failed to extract PDF text. The file might be corrupted or unsupported.");
        }

        // Step 2: Build the Prompt
        const prompt = PromptBuilder.build(RESUME_PARSER_PROMPT, resumeText);

        // Step 3: Call AI Service
        let response;
        try {
            response = await aiService.generate(prompt);
            logger.info(`AI Response Time: ${response.responseTime}ms`);
        } catch (error) {
            logger.error("Parsing Errors", { error: error instanceof Error ? error.message : "LLM failure" });
            throw new ValidationError("Failed to generate response from AI model.");
        }

        // Step 4: Parse response string to JSON object
        let parsed: ResumeData;
        try {
            parsed = JsonParser.parse<ResumeData>(response.content);
        } catch (error) {
            logger.error("Parsing Errors", { error: error instanceof Error ? error.message : "JSON parsing failed" });
            throw new ValidationError("Failed to parse response from AI model as valid JSON.");
        }

        if (!parsed.rawText) {
            parsed.rawText = resumeText;
        }

        // Step 5: Validate JSON against Zod schema
        let validated;
        try {
            validated = ResumeSchema.parse(parsed);
        } catch (error) {
            logger.error("Schema Validation Failure", { error });
            logger.error("Parsing Errors", { error });
            throw error; // Rethrow ZodError so it is formatted as Zod validation error by middleware
        }

        // Step 6: Save the uploaded file to disk
        let uniqueFileName: string;
        try {
            const fileExtension = path.extname(file.originalname);
            uniqueFileName = `${uuidv4()}${fileExtension}`;
            const uploadDir = path.join(__dirname, "../../../../uploads/resumes");
            
            await fs.promises.mkdir(uploadDir, { recursive: true });
            const filePath = path.join(uploadDir, uniqueFileName);
            await fs.promises.writeFile(filePath, file.buffer);
            logger.info(`[ResumeParserService] File saved locally to: ${filePath}`);
        } catch (error) {
            logger.error("Parsing Errors", { error: error instanceof Error ? error.message : "File storage failure" });
            throw new ValidationError("Failed to store uploaded resume file.");
        }

        // Step 7: Map validated JSON details to CreateCandidate schema fields
        let candidateSkills = [];
        try {
            if (validated.skills && validated.skills.length > 0) {
                for (const skill of validated.skills) {
                    if (!skill.name) continue;
                    const normalizedName = skill.name.trim();
                    if (!normalizedName) continue;

                    let catalogueSkill = await prisma.skill.findUnique({
                        where: { name: normalizedName },
                    });

                    if (!catalogueSkill) {
                        catalogueSkill = await prisma.skill.create({
                            data: { name: normalizedName },
                        });
                    }

                    candidateSkills.push({
                        skillId: catalogueSkill.id,
                        proficiency: mapProficiency(skill.level),
                        experienceYears: null,
                        experienceMonths: null,
                        isPrimary: false,
                    });
                }
            }
        } catch (error) {
            logger.error("Parsing Errors", { error: error instanceof Error ? error.message : "Skills mapping failure" });
            throw new ValidationError("Failed to map skills catalogue.");
        }

        // Map experience and ensure date logic holds (startDate <= endDate)
        let currentCompany = null;
        let currentDesignation = null;

        const candidateExperience = validated.experience.map((exp) => {
            let startDateISO = parseDateToISO(exp.startDate) || new Date().toISOString();
            let endDateISO = exp.currentlyWorking ? null : parseDateToISO(exp.endDate);

            if (endDateISO && new Date(startDateISO) > new Date(endDateISO)) {
                startDateISO = endDateISO;
            }

            if (exp.currentlyWorking || exp.endDate === "Present" || exp.endDate === "current") {
                currentCompany = exp.company;
                currentDesignation = exp.position;
            }

            return {
                company: exp.company || "Unknown Company",
                designation: exp.position || "Unknown Role",
                employmentType: null,
                startDate: startDateISO,
                endDate: endDateISO,
                isCurrent: exp.currentlyWorking || false,
                description: exp.description || null,
            };
        });

        // If no explicit current company is marked, default to the first experience record
        if (!currentCompany && validated.experience.length > 0) {
            currentCompany = validated.experience[0].company;
            currentDesignation = validated.experience[0].position;
        }

        // Map education records
        const candidateEducation = validated.education.map((edu) => {
            let startDateISO = parseDateToISO(edu.startYear);
            let endDateISO = parseDateToISO(edu.endYear);

            if (startDateISO && endDateISO && new Date(startDateISO) > new Date(endDateISO)) {
                startDateISO = endDateISO;
            }

            return {
                degree: edu.degree || "Unknown Degree",
                institution: edu.institution || "Unknown Institution",
                specialization: edu.field || null,
                startDate: startDateISO,
                endDate: endDateISO,
                graduationYear: parseGraduationYear(edu.endYear),
                grade: null,
                isHighest: false,
            };
        });

        // Add PDF document details to createCandidate
        const candidateDocuments = [
            {
                fileName: file.originalname,
                fileUrl: `/uploads/resumes/${uniqueFileName}`,
                fileKey: `resumes/${uniqueFileName}`,
                fileSize: file.size,
                mimeType: file.mimetype,
                documentType: DocumentType.RESUME,
                isActive: true,
            },
        ];

        // Add summary note
        const candidateNotes = [];
        if (validated.summary) {
            candidateNotes.push({
                content: `Resume Summary:\n${validated.summary}`,
            });
        }

        // Step 8: Call Candidate Service to persist Candidate profile
        let newCandidate;
        try {
            newCandidate = await candidateService.createCandidate(
                {
                    firstName: validated.firstName?.trim() || "Unknown",
                    lastName: validated.lastName?.trim() || "Candidate",
                    email: validated.email || null,
                    phone: validated.phone || null,
                    alternatePhone: null,
                    gender: null,
                    address: validated.location || null,
                    city: null,
                    state: null,
                    country: null,
                    zipCode: null,
                    currentCompany: currentCompany || null,
                    currentDesignation: currentDesignation || null,
                    experienceYears: null,
                    experienceMonths: null,
                    expectedSalary: null,
                    currentSalary: null,
                    currency: null,
                    noticePeriod: null,
                    employmentStatus: null,
                    source: null,
                    linkedInUrl: null,
                    githubUrl: null,
                    portfolioUrl: null,
                    primaryRecruiterId: currentUser.id,
                    skills: candidateSkills,
                    experience: candidateExperience,
                    education: candidateEducation,
                    documents: candidateDocuments,
                    notes: candidateNotes,
                },
                currentUser
            );
        } catch (error) {
            logger.error("Parsing Errors", { error: error instanceof Error ? error.message : "Candidate creation failure" });
            throw error; // Rethrow ConflictError/UnprocessableEntityError so it gets processed standardly
        }

        const totalProcessTime = Date.now() - uploadTimerStart;
        logger.info("Candidate Created", { candidateId: newCandidate.id });
        logger.info(`Resume Parsing Complete`, { totalTime: totalProcessTime });

        return newCandidate;
    }
}

export const resumeParserService = new ResumeParserService();