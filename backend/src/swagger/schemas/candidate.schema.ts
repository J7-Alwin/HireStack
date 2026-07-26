const candidateSchemas = {
    Candidate: {
        type: "object",
        properties: {
            id: {
                type: "string",
                example: "cand_123456",
            },
            firstName: {
                type: "string",
                example: "John",
            },
            lastName: {
                type: "string",
                example: "Doe",
            },
            email: {
                type: "string",
                format: "email",
                example: "john@gmail.com",
            },
            phone: {
                type: "string",
                example: "+91 9876543210",
            },
            alternatePhone: {
                type: "string",
            },
            gender: {
                type: "string",
                example: "MALE",
            },
            address: {
                type: "string",
            },
            city: {
                type: "string",
            },
            state: {
                type: "string",
            },
            country: {
                type: "string",
            },
            zipCode: {
                type: "string",
            },
            currentCompany: {
                type: "string",
            },
            currentDesignation: {
                type: "string",
            },
            experienceYears: {
                type: "integer",
                example: 5,
            },
            experienceMonths: {
                type: "integer",
                example: 8,
            },
            expectedSalary: {
                type: "number",
                example: 1200000,
            },
            currentSalary: {
                type: "number",
                example: 900000,
            },
            currency: {
                type: "string",
                example: "INR",
            },
            noticePeriod: {
                type: "integer",
                example: 30,
            },
            employmentStatus: {
                type: "string",
                example: "EMPLOYED",
            },
            source: {
                type: "string",
                example: "LINKEDIN",
            },
            linkedInUrl: {
                type: "string",
                format: "uri",
            },
            githubUrl: {
                type: "string",
                format: "uri",
            },
            portfolioUrl: {
                type: "string",
                format: "uri",
            },
            status: {
                type: "string",
                example: "ACTIVE",
            },
            primaryRecruiterId: {
                type: "string",
            },
            createdAt: {
                type: "string",
                format: "date-time",
            },
            updatedAt: {
                type: "string",
                format: "date-time",
            },
        },
    },

    CandidateResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            data: {
                $ref: "#/components/schemas/Candidate",
            },
        },
    },

    CandidateListResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            data: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/Candidate",
                },
            },
            pagination: {
                type: "object",
                properties: {
                    page: {
                        type: "integer",
                        example: 1,
                    },
                    limit: {
                        type: "integer",
                        example: 10,
                    },
                    total: {
                        type: "integer",
                        example: 120,
                    },
                    totalPages: {
                        type: "integer",
                        example: 12,
                    },
                },
            },
        },
    },

    CreateCandidateRequest: {
        type: "object",
        required: [
            "firstName",
            "lastName",
            "primaryRecruiterId"
        ],
        properties: {
            firstName: {
                type: "string",
                example: "John",
            },
            lastName: {
                type: "string",
                example: "Doe",
            },
            email: {
                type: "string",
                format: "email",
            },
            phone: {
                type: "string",
            },
            gender: {
                type: "string",
            },
            currentCompany: {
                type: "string",
            },
            currentDesignation: {
                type: "string",
            },
            experienceYears: {
                type: "integer",
            },
            experienceMonths: {
                type: "integer",
            },
            expectedSalary: {
                type: "number",
            },
            currentSalary: {
                type: "number",
            },
            currency: {
                type: "string",
            },
            noticePeriod: {
                type: "integer",
            },
            employmentStatus: {
                type: "string",
            },
            source: {
                type: "string",
            },
            linkedInUrl: {
                type: "string",
                format: "uri",
            },
            githubUrl: {
                type: "string",
                format: "uri",
            },
            portfolioUrl: {
                type: "string",
                format: "uri",
            },
            primaryRecruiterId: {
                type: "string",
            },
        },
    },

    UpdateCandidateRequest: {
        type: "object",
        properties: {
            firstName: {
                type: "string",
            },
            lastName: {
                type: "string",
            },
            email: {
                type: "string",
                format: "email",
            },
            phone: {
                type: "string",
            },
            alternatePhone: {
                type: "string",
            },
            currentCompany: {
                type: "string",
            },
            currentDesignation: {
                type: "string",
            },
            experienceYears: {
                type: "integer",
            },
            experienceMonths: {
                type: "integer",
            },
            expectedSalary: {
                type: "number",
            },
            currentSalary: {
                type: "number",
            },
            currency: {
                type: "string",
            },
            noticePeriod: {
                type: "integer",
            },
            employmentStatus: {
                type: "string",
            },
            source: {
                type: "string",
            },
            status: {
                type: "string",
            },
        },
    },


    CandidateSkill: {
        type: "object",
        properties: {
            id: {
                type: "string",
                example: "skill_123456",
            },
            skill: {
                type: "string",
                example: "Node.js",
            },
            level: {
                type: "string",
                example: "ADVANCED",
            },
            yearsOfExperience: {
                type: "integer",
                example: 5,
            },
        },
    },

    AddSkillRequest: {
        type: "object",
        required: ["skill", "level"],
        properties: {
            skill: {
                type: "string",
                example: "TypeScript",
            },
            level: {
                type: "string",
                enum: [
                    "BEGINNER",
                    "INTERMEDIATE",
                    "ADVANCED",
                    "EXPERT",
                ],
                example: "ADVANCED",
            },
            yearsOfExperience: {
                type: "integer",
                example: 4,
            },
        },
    },

    UpdateSkillRequest: {
        type: "object",
        properties: {
            skill: {
                type: "string",
            },
            level: {
                type: "string",
                enum: [
                    "BEGINNER",
                    "INTERMEDIATE",
                    "ADVANCED",
                    "EXPERT",
                ],
            },
            yearsOfExperience: {
                type: "integer",
            },
        },
    },
    CandidateEducation: {
        type: "object",
        properties: {
            id: {
                type: "string",
                example: "edu_123456",
            },
            degree: {
                type: "string",
                example: "Bachelor of Technology",
            },
            specialization: {
                type: "string",
                example: "Computer Science",
            },
            institution: {
                type: "string",
                example: "ABC College",
            },
            university: {
                type: "string",
                example: "XYZ University",
            },
            startDate: {
                type: "string",
                format: "date-time",
            },
            endDate: {
                type: "string",
                format: "date-time",
            },
            graduationYear: {
                type: "integer",
                example: 2024,
            },
            grade: {
                type: "string",
                example: "8.7 CGPA",
            },
            isHighest: {
                type: "boolean",
                example: true,
            },
        },
    },

    AddEducationRequest: {
        type: "object",
        required: [
            "degree",
            "institution",
        ],
        properties: {
            degree: {
                type: "string",
                example: "Bachelor of Technology",
            },
            specialization: {
                type: "string",
                example: "Computer Science",
            },
            institution: {
                type: "string",
                example: "ABC College",
            },
            university: {
                type: "string",
                example: "XYZ University",
            },
            startDate: {
                type: "string",
                format: "date-time",
            },
            endDate: {
                type: "string",
                format: "date-time",
            },
            graduationYear: {
                type: "integer",
                example: 2024,
            },
            grade: {
                type: "string",
                example: "8.5 CGPA",
            },
            isHighest: {
                type: "boolean",
                example: true,
            },
        },
    },

    UpdateEducationRequest: {
        type: "object",
        properties: {
            degree: {
                type: "string",
            },
            specialization: {
                type: "string",
            },
            institution: {
                type: "string",
            },
            university: {
                type: "string",
            },
            startDate: {
                type: "string",
                format: "date-time",
            },
            endDate: {
                type: "string",
                format: "date-time",
            },
            graduationYear: {
                type: "integer",
            },
            grade: {
                type: "string",
            },
            isHighest: {
                type: "boolean",
            },
        },
    },
    CandidateExperience: {
        type: "object",
        properties: {
            id: {
                type: "string",
                example: "exp_123456",
            },
            company: {
                type: "string",
                example: "Google",
            },
            designation: {
                type: "string",
                example: "Software Engineer",
            },
            employmentType: {
                type: "string",
                example: "FULL_TIME",
            },
            startDate: {
                type: "string",
                format: "date-time",
            },
            endDate: {
                type: "string",
                format: "date-time",
                nullable: true,
            },
            isCurrent: {
                type: "boolean",
                example: false,
            },
            description: {
                type: "string",
                example: "Worked on backend APIs using Node.js and PostgreSQL.",
            },
        },
    },

    AddExperienceRequest: {
        type: "object",
        required: [
            "company",
            "designation",
            "startDate",
        ],
        properties: {
            company: {
                type: "string",
                example: "Google",
            },
            designation: {
                type: "string",
                example: "Software Engineer",
            },
            employmentType: {
                type: "string",
                example: "FULL_TIME",
            },
            startDate: {
                type: "string",
                format: "date-time",
            },
            endDate: {
                type: "string",
                format: "date-time",
                nullable: true,
            },
            isCurrent: {
                type: "boolean",
                example: false,
            },
            description: {
                type: "string",
                example: "Worked on backend APIs using Node.js.",
            },
        },
    },

    UpdateExperienceRequest: {
        type: "object",
        properties: {
            company: {
                type: "string",
            },
            designation: {
                type: "string",
            },
            employmentType: {
                type: "string",
            },
            startDate: {
                type: "string",
                format: "date-time",
            },
            endDate: {
                type: "string",
                format: "date-time",
                nullable: true,
            },
            isCurrent: {
                type: "boolean",
            },
            description: {
                type: "string",
            },
        },
    },
    CandidateDocument: {
        type: "object",
        properties: {
            id: {
                type: "string",
                example: "doc_123456",
            },
            fileName: {
                type: "string",
                example: "resume.pdf",
            },
            fileUrl: {
                type: "string",
                format: "uri",
                example: "https://storage.example.com/resume.pdf",
            },
            fileKey: {
                type: "string",
                example: "candidates/resume.pdf",
            },
            fileSize: {
                type: "integer",
                example: 254876,
            },
            mimeType: {
                type: "string",
                example: "application/pdf",
            },
            documentType: {
                type: "string",
                example: "RESUME",
            },
            isActive: {
                type: "boolean",
                example: true,
            },
            uploadedAt: {
                type: "string",
                format: "date-time",
            },
        },
    },

    AddDocumentRequest: {
        type: "object",
        required: [
            "fileName",
            "fileUrl",
            "fileKey"
        ],
        properties: {
            fileName: {
                type: "string",
                example: "resume.pdf",
            },
            fileUrl: {
                type: "string",
                format: "uri",
            },
            fileKey: {
                type: "string",
                example: "candidate/resume.pdf",
            },
            fileSize: {
                type: "integer",
                example: 204800,
            },
            mimeType: {
                type: "string",
                example: "application/pdf",
            },
            documentType: {
                type: "string",
                example: "RESUME",
            },
            isActive: {
                type: "boolean",
                example: true,
            },
        },
    },
    CandidateNote: {
        type: "object",
        properties: {
            id: {
                type: "string",
                example: "note_123456",
            },
            content: {
                type: "string",
                example: "Candidate has excellent communication skills.",
            },
            createdBy: {
                type: "string",
                example: "rec_123456",
            },
            createdAt: {
                type: "string",
                format: "date-time",
            },
            updatedAt: {
                type: "string",
                format: "date-time",
            },
        },
    },

    AddNoteRequest: {
        type: "object",
        required: ["content"],
        properties: {
            content: {
                type: "string",
                example: "Candidate cleared the technical interview.",
            },
        },
    },

    UpdateNoteRequest: {
        type: "object",
        properties: {
            content: {
                type: "string",
                example: "Candidate scheduled for the HR interview.",
            },
        },
    },
    CandidateTag: {
        type: "object",
        properties: {
            id: {
                type: "string",
                example: "tag_123456",
            },
            name: {
                type: "string",
                example: "Immediate Joiner",
            },
            createdAt: {
                type: "string",
                format: "date-time",
            },
        },
    },

    AddTagRequest: {
        type: "object",
        required: ["name"],
        properties: {
            name: {
                type: "string",
                example: "Immediate Joiner",
            },
        },
    },
};
export default candidateSchemas;