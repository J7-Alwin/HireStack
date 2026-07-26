const pipelineSchemas = {
    Pipeline: {
        type: "object",
        properties: {
            id: {
                type: "string",
                example: "pipe_123456",
            },
            applicationId: {
                type: "string",
                example: "app_123456",
            },
            currentStage: {
                type: "string",
                enum: [
                    "APPLIED",
                    "SCREENING",
                    "SHORTLISTED",
                    "HR_INTERVIEW",
                    "TECHNICAL_INTERVIEW",
                    "FINAL_INTERVIEW",
                    "OFFER_PENDING",
                    "OFFER_SENT",
                    "OFFER_ACCEPTED",
                    "HIRED",
                    "REJECTED",
                    "WITHDRAWN",
                ],
                example: "SCREENING",
            },
            completed: {
                type: "boolean",
                example: false,
            },
            active: {
                type: "boolean",
                example: true,
            },
            hired: {
                type: "boolean",
                example: false,
            },
            rejected: {
                type: "boolean",
                example: false,
            },
            withdrawn: {
                type: "boolean",
                example: false,
            },
            notes: {
                type: "string",
                nullable: true,
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

    PipelineResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            data: {
                $ref: "#/components/schemas/Pipeline",
            },
        },
    },

    PipelineListResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            data: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/Pipeline",
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
                        example: 20,
                    },
                    total: {
                        type: "integer",
                        example: 85,
                    },
                    totalPages: {
                        type: "integer",
                        example: 5,
                    },
                },
            },
        },
    },

    DashboardSummaryResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            data: {
                type: "object",
                description: "Pipeline dashboard summary metrics.",
            },
        },
    },

    CompanyDashboardResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            data: {
                type: "object",
                description: "Company dashboard metrics.",
            },
        },
    },

    RecruiterDashboardResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            data: {
                type: "object",
                description: "Recruiter dashboard metrics.",
            },
        },
    },

    CreatePipelineRequest: {
        type: "object",
        required: [
            "applicationId",
        ],
        properties: {
            applicationId: {
                type: "string",
            },
            notes: {
                type: "string",
            },
        },
    },

    MovePipelineStageRequest: {
        type: "object",
        required: [
            "toStage",
        ],
        properties: {
            toStage: {
                type: "string",
                enum: [
                    "APPLIED",
                    "SCREENING",
                    "SHORTLISTED",
                    "HR_INTERVIEW",
                    "TECHNICAL_INTERVIEW",
                    "FINAL_INTERVIEW",
                    "OFFER_PENDING",
                    "OFFER_SENT",
                    "OFFER_ACCEPTED",
                    "HIRED",
                    "REJECTED",
                    "WITHDRAWN",
                ],
            },
            reason: {
                type: "string",
            },
            comments: {
                type: "string",
            },
            isOverride: {
                type: "boolean",
                default: false,
            },
        },
    },

    AddPipelineNotesRequest: {
        type: "object",
        required: [
            "notes",
        ],
        properties: {
            notes: {
                type: "string",
            },
        },
    },
};

export default pipelineSchemas;