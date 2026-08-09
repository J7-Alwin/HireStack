export const aiSwaggerSchemas = {
    AIHealthCheckResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            message: {
                type: "string",
                example: "AI service health checked successfully",
            },
            data: {
                type: "object",
                properties: {
                    provider: {
                        type: "string",
                        example: "ollama",
                    },
                    model: {
                        type: "string",
                        example: "llama3.2",
                    },
                    status: {
                        type: "string",
                        example: "healthy",
                    },
                    responseTime: {
                        type: "integer",
                        example: 1245,
                    },
                },
            },
        },
    },
    ATSScoreRequest: {
        type: "object",
        required: ["candidateId", "jobId"],
        properties: {
            candidateId: {
                type: "string",
                example: "clxyz12340000t3t1cr4a6136",
            },
            jobId: {
                type: "string",
                example: "clxyz56780000t3t1cr4a6136",
            },
        },
    },
    ATSScoreResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            message: {
                type: "string",
                example: "ATS score generated successfully.",
            },
            data: {
                type: "object",
                properties: {
                    overallScore: {
                        type: "integer",
                        example: 89,
                    },
                    skillScore: {
                        type: "integer",
                        example: 94,
                    },
                    experienceScore: {
                        type: "integer",
                        example: 86,
                    },
                    educationScore: {
                        type: "integer",
                        example: 91,
                    },
                    keywordScore: {
                        type: "integer",
                        example: 84,
                    },
                    certificationScore: {
                        type: "integer",
                        example: 72,
                    },
                    strengths: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                        example: ["Strong React development skills"],
                    },
                    weaknesses: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                        example: ["Lacks containerization experience"],
                    },
                    missingSkills: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                        example: ["Docker"],
                    },
                    recommendations: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                        example: ["Study containerization technologies like Docker"],
                    },
                    hiringRecommendation: {
                        type: "string",
                        enum: ["STRONGLY_RECOMMENDED", "RECOMMENDED", "CONSIDER", "NOT_RECOMMENDED"],
                        example: "RECOMMENDED",
                    },
                    overallReason: {
                        type: "string",
                        example: "Candidate has strong backend development experience with excellent project relevance. Missing Kubernetes and Redis experience, but overall matches most required skills.",
                    },
                },
            },
        },
    },
    JobMatchingRequest: {
        type: "object",
        required: ["jobId"],
        properties: {
            jobId: {
                type: "string",
                example: "clxyz56780000t3t1cr4a6136",
            },
        },
    },
    JobMatchingResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            message: {
                type: "string",
                example: "Job matching generated successfully.",
            },
            data: {
                type: "object",
                properties: {
                    jobId: {
                        type: "string",
                        example: "clxyz56780000t3t1cr4a6136",
                    },
                    totalCandidates: {
                        type: "integer",
                        example: 2,
                    },
                    generatedAt: {
                        type: "string",
                        example: "2026-08-09T12:00:00Z",
                    },
                    matches: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                candidateId: {
                                    type: "string",
                                    example: "clxyz12340000t3t1cr4a6136",
                                },
                                candidateName: {
                                    type: "string",
                                    example: "John Doe",
                                },
                                matchPercentage: {
                                    type: "integer",
                                    example: 95,
                                },
                                recommendation: {
                                    type: "string",
                                    enum: ["STRONGLY_RECOMMENDED", "RECOMMENDED", "CONSIDER", "NOT_RECOMMENDED"],
                                    example: "STRONGLY_RECOMMENDED",
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    JobMatchHistoryResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            message: {
                type: "string",
                example: "Job matching history retrieved successfully.",
            },
            data: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/JobMatchDetailsResponse",
                },
            },
        },
    },
    JobMatchDetailsResponse: {
        type: "object",
        properties: {
            id: {
                type: "string",
                example: "clmatch12340000t3t1cr4a6136",
            },
            jobId: {
                type: "string",
                example: "clxyz56780000t3t1cr4a6136",
            },
            candidateId: {
                type: "string",
                example: "clxyz12340000t3t1cr4a6136",
            },
            candidateName: {
                type: "string",
                example: "John Doe",
                nullable: true,
            },
            matchPercentage: {
                type: "integer",
                example: 95,
            },
            skillMatch: {
                type: "integer",
                example: 90,
            },
            experienceMatch: {
                type: "integer",
                example: 85,
            },
            educationMatch: {
                type: "integer",
                example: 80,
            },
            projectMatch: {
                type: "integer",
                example: 95,
            },
            keywordMatch: {
                type: "integer",
                example: 88,
            },
            strengths: {
                type: "array",
                items: {
                    type: "string",
                },
                example: ["Strong experience with TypeScript", "Relevant backend projects"],
            },
            missingSkills: {
                type: "array",
                items: {
                    type: "string",
                },
                example: ["Docker", "Kubernetes"],
            },
            overallReason: {
                type: "string",
                example: "Candidate is a strong match for backend responsibilities with solid Node.js and TypeScript skills.",
            },
            recommendation: {
                type: "string",
                enum: ["STRONGLY_RECOMMENDED", "RECOMMENDED", "CONSIDER", "NOT_RECOMMENDED"],
                example: "STRONGLY_RECOMMENDED",
            },
            aiModel: {
                type: "string",
                example: "llama3.2",
            },
            promptVersion: {
                type: "string",
                example: "1.0.0",
            },
            createdAt: {
                type: "string",
                example: "2026-08-09T12:00:00Z",
            },
            updatedAt: {
                type: "string",
                example: "2026-08-09T12:00:00Z",
            },
        },
    },
};
