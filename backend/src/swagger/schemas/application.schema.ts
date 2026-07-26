const applicationSchemas = {
    Application: {
        type: "object",
        properties: {
            id: {
                type: "string",
                example: "app_123456",
            },
            candidateId: {
                type: "string",
                example: "cand_123456",
            },
            jobId: {
                type: "string",
                example: "job_123456",
            },
            assignedRecruiterId: {
                type: "string",
                example: "rec_123456",
            },
            source: {
                type: "string",
                enum: [
                    "REFERRAL",
                    "LINKEDIN",
                    "NAUKRI",
                    "INDEED",
                    "CAREER_PAGE",
                    "CONSULTANCY",
                    "CAMPUS",
                    "WALK_IN",
                    "IMPORT",
                    "OTHER",
                ],
                example: "LINKEDIN",
            },
            stage: {
                type: "string",
                enum: [
                    "APPLIED",
                    "SCREENING",
                    "SHORTLISTED",
                    "INTERVIEW",
                    "OFFER",
                ],
                example: "SCREENING",
            },
            status: {
                type: "string",
                enum: [
                    "ACTIVE",
                    "HIRED",
                    "REJECTED",
                    "WITHDRAWN",
                    "ARCHIVED",
                ],
                example: "ACTIVE",
            },
            remarks: {
                type: "string",
                example: "Strong communication skills.",
            },
            rejectionReasonCode: {
                type: "string",
                nullable: true,
                example: "SKILL_GAP",
            },
            rejectionReasonNote: {
                type: "string",
                nullable: true,
                example: "Required experience not met.",
            },
            withdrawalReasonCode: {
                type: "string",
                nullable: true,
                example: "ACCEPTED_OTHER_OFFER",
            },
            withdrawalReasonNote: {
                type: "string",
                nullable: true,
                example: "Candidate accepted another offer.",
            },
            appliedAt: {
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

    ApplicationResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            data: {
                $ref: "#/components/schemas/Application",
            },
        },
    },

    ApplicationListResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            data: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/Application",
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

    CreateApplicationRequest: {
        type: "object",
        required: [
            "candidateId",
            "jobId",
            "assignedRecruiterId",
        ],
        properties: {
            candidateId: {
                type: "string",
                example: "cand_123456",
            },
            jobId: {
                type: "string",
                example: "job_123456",
            },
            assignedRecruiterId: {
                type: "string",
                example: "rec_123456",
            },
            source: {
                type: "string",
                enum: [
                    "REFERRAL",
                    "LINKEDIN",
                    "NAUKRI",
                    "INDEED",
                    "CAREER_PAGE",
                    "CONSULTANCY",
                    "CAMPUS",
                    "WALK_IN",
                    "IMPORT",
                    "OTHER",
                ],
            },
            remarks: {
                type: "string",
            },
        },
    },

    UpdateApplicationRequest: {
        type: "object",
        properties: {
            remarks: {
                type: "string",
                example: "Candidate requested rescheduling.",
            },
        },
    },

    AssignRecruiterRequest: {
        type: "object",
        required: [
            "assignedRecruiterId",
        ],
        properties: {
            assignedRecruiterId: {
                type: "string",
                example: "rec_123456",
            },
        },
    },

    UpdateApplicationStageRequest: {
        type: "object",
        required: [
            "stage",
        ],
        properties: {
            stage: {
                type: "string",
                enum: [
                    "APPLIED",
                    "SCREENING",
                    "SHORTLISTED",
                    "INTERVIEW",
                    "OFFER",
                ],
                example: "INTERVIEW",
            },
        },
    },

    UpdateApplicationStatusRequest: {
        type: "object",
        required: [
            "status",
        ],
        properties: {
            status: {
                type: "string",
                enum: [
                    "ACTIVE",
                    "HIRED",
                    "REJECTED",
                    "WITHDRAWN",
                    "ARCHIVED",
                ],
                example: "HIRED",
            },
        },
    },

    RejectApplicationRequest: {
        type: "object",
        required: [
            "rejectionReasonCode",
        ],
        properties: {
            rejectionReasonCode: {
                type: "string",
                example: "SKILL_GAP",
            },
            rejectionReasonNote: {
                type: "string",
                example: "Required experience not met.",
            },
        },
    },

    WithdrawApplicationRequest: {
        type: "object",
        required: [
            "withdrawalReasonCode",
        ],
        properties: {
            withdrawalReasonCode: {
                type: "string",
                example: "ACCEPTED_OTHER_OFFER",
            },
            withdrawalReasonNote: {
                type: "string",
                example: "Candidate accepted another opportunity.",
            },
        },
    },
};

export default applicationSchemas;