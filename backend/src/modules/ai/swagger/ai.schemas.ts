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
};
