const jobSchemas = {
    Job: {
        type: "object",
        properties: {
            id: {
                type: "string",
                example: "job_123456",
            },
            title: {
                type: "string",
                example: "Senior Backend Developer",
            },
            description: {
                type: "string",
                example: "Develop scalable backend services using Node.js and TypeScript.",
            },
            responsibilities: {
                type: "string",
                example: "Design APIs, review code, mentor developers.",
            },
            requirements: {
                type: "string",
                example: "5+ years experience with Node.js and PostgreSQL.",
            },
            benefits: {
                type: "string",
                example: "Health insurance, flexible working hours.",
            },
            departmentId: {
                type: "string",
                example: "dept_123456",
            },
            employmentType: {
                type: "string",
                enum: [
                    "FULL_TIME",
                    "PART_TIME",
                    "CONTRACT",
                    "INTERN",
                    "TEMPORARY",
                    "FREELANCE",
                ],
                example: "FULL_TIME",
            },
            workplaceType: {
                type: "string",
                enum: [
                    "ONSITE",
                    "REMOTE",
                    "HYBRID",
                ],
                example: "HYBRID",
            },
            experienceMin: {
                type: "integer",
                example: 3,
            },
            experienceMax: {
                type: "integer",
                example: 6,
            },
            salaryMin: {
                type: "number",
                example: 500000,
            },
            salaryMax: {
                type: "number",
                example: 900000,
            },
            currency: {
                type: "string",
                example: "INR",
            },
            location: {
                type: "string",
                example: "Bangalore",
            },
            openings: {
                type: "integer",
                example: 3,
            },
            visibility: {
                type: "string",
                enum: [
                    "PUBLIC",
                    "PRIVATE",
                ],
                example: "PUBLIC",
            },
            status: {
                type: "string",
                enum: [
                    "DRAFT",
                    "PUBLISHED",
                    "OPEN",
                    "PAUSED",
                    "CLOSED",
                    "ARCHIVED",
                ],
                example: "OPEN",
            },
            closingDate: {
                type: "string",
                format: "date-time",
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

    JobResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            data: {
                $ref: "#/components/schemas/Job",
            },
        },
    },

    JobListResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            data: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/Job",
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
                        example: 125,
                    },
                    totalPages: {
                        type: "integer",
                        example: 13,
                    },
                },
            },
        },
    },

    CreateJobRequest: {
        type: "object",
        required: [
            "title",
            "description",
            "departmentId",
            "employmentType",
            "workplaceType",
            "openings",
        ],
        properties: {
            title: {
                type: "string",
                example: "Senior Backend Developer",
            },
            description: {
                type: "string",
            },
            responsibilities: {
                type: "string",
            },
            requirements: {
                type: "string",
            },
            benefits: {
                type: "string",
            },
            departmentId: {
                type: "string",
            },
            employmentType: {
                type: "string",
                enum: [
                    "FULL_TIME",
                    "PART_TIME",
                    "CONTRACT",
                    "INTERN",
                    "TEMPORARY",
                    "FREELANCE",
                ],
            },
            workplaceType: {
                type: "string",
                enum: [
                    "ONSITE",
                    "REMOTE",
                    "HYBRID",
                ],
            },
            experienceMin: {
                type: "integer",
            },
            experienceMax: {
                type: "integer",
            },
            salaryMin: {
                type: "number",
            },
            salaryMax: {
                type: "number",
            },
            currency: {
                type: "string",
            },
            location: {
                type: "string",
            },
            openings: {
                type: "integer",
                example: 2,
            },
            visibility: {
                type: "string",
                enum: [
                    "PUBLIC",
                    "PRIVATE",
                ],
            },
            closingDate: {
                type: "string",
                format: "date-time",
            },
            recruiterIds: {
                type: "array",
                items: {
                    type: "string",
                },
            },
            skillIds: {
                type: "array",
                items: {
                    type: "string",
                },
            },
        },
    },

    UpdateJobRequest: {
        type: "object",
        properties: {
            title: {
                type: "string",
            },
            description: {
                type: "string",
            },
            responsibilities: {
                type: "string",
            },
            requirements: {
                type: "string",
            },
            benefits: {
                type: "string",
            },
            departmentId: {
                type: "string",
            },
            employmentType: {
                type: "string",
            },
            workplaceType: {
                type: "string",
            },
            experienceMin: {
                type: "integer",
            },
            experienceMax: {
                type: "integer",
            },
            salaryMin: {
                type: "number",
            },
            salaryMax: {
                type: "number",
            },
            currency: {
                type: "string",
            },
            location: {
                type: "string",
            },
            openings: {
                type: "integer",
            },
            visibility: {
                type: "string",
            },
            closingDate: {
                type: "string",
                format: "date-time",
            },
            recruiterIds: {
                type: "array",
                items: {
                    type: "string",
                },
            },
            skillIds: {
                type: "array",
                items: {
                    type: "string",
                },
            },
        },
    },

    AssignRecruitersRequest: {
        type: "object",
        required: [
            "recruiterIds",
        ],
        properties: {
            recruiterIds: {
                type: "array",
                items: {
                    type: "string",
                    example: "rec_123456",
                },
            },
        },
    },
};

export default jobSchemas;