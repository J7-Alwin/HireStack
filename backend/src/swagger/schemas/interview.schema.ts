const interviewSchemas = {
    Interview: {
        type: "object",
        properties: {
            id: {
                type: "string",
                example: "int_123456",
            },
            applicationId: {
                type: "string",
                example: "app_123456",
            },
            interviewType: {
                type: "string",
                enum: [
                    "INTERNAL",
                    "CLIENT",
                    "CAMPUS",
                    "WALK_IN",
                    "OTHER",
                ],
                example: "CLIENT",
            },
            round: {
                type: "string",
                enum: [
                    "SCREENING",
                    "TECHNICAL",
                    "MANAGERIAL",
                    "HR",
                    "FINAL",
                ],
                example: "TECHNICAL",
            },
            mode: {
                type: "string",
                enum: [
                    "ONLINE",
                    "ONSITE",
                    "PHONE",
                ],
                example: "ONLINE",
            },
            status: {
                type: "string",
                enum: [
                    "SCHEDULED",
                    "CONFIRMED",
                    "IN_PROGRESS",
                    "COMPLETED",
                    "CANCELLED",
                    "NO_SHOW",
                ],
                example: "SCHEDULED",
            },
            outcome: {
                type: "string",
                nullable: true,
                enum: [
                    "PASS",
                    "FAIL",
                    "ON_HOLD",
                    "RECOMMENDED",
                    "STRONG_RECOMMEND",
                    "NOT_RECOMMENDED",
                ],
                example: "PASS",
            },
            scheduledDate: {
                type: "string",
                format: "date-time",
            },
            startTime: {
                type: "string",
                format: "date-time",
            },
            endTime: {
                type: "string",
                format: "date-time",
            },
            timeZone: {
                type: "string",
                example: "Asia/Kolkata",
            },
            meetingLink: {
                type: "string",
                nullable: true,
                example: "https://meet.google.com/abc-defg-hij",
            },
            location: {
                type: "string",
                nullable: true,
                example: "Conference Room A",
            },
            notes: {
                type: "string",
                nullable: true,
            },
            cancellationReason: {
                type: "string",
                nullable: true,
            },
            resultNotes: {
                type: "string",
                nullable: true,
            },
            interviewers: {
                type: "array",
                items: {
                    type: "string",
                    example: "usr_123456",
                },
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

    InterviewResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            data: {
                $ref: "#/components/schemas/Interview",
            },
        },
    },

    InterviewListResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            data: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/Interview",
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
                        example: 75,
                    },
                    totalPages: {
                        type: "integer",
                        example: 8,
                    },
                },
            },
        },
    },

    ScheduleInterviewRequest: {
        type: "object",
        required: [
            "applicationId",
            "interviewType",
            "round",
            "mode",
            "scheduledDate",
            "startTime",
            "endTime",
            "timeZone",
            "interviewers",
        ],
        properties: {
            applicationId: {
                type: "string",
            },
            interviewType: {
                type: "string",
                enum: [
                    "INTERNAL",
                    "CLIENT",
                    "CAMPUS",
                    "WALK_IN",
                    "OTHER",
                ],
            },
            round: {
                type: "string",
                enum: [
                    "SCREENING",
                    "TECHNICAL",
                    "MANAGERIAL",
                    "HR",
                    "FINAL",
                ],
            },
            mode: {
                type: "string",
                enum: [
                    "ONLINE",
                    "ONSITE",
                    "PHONE",
                ],
            },
            scheduledDate: {
                type: "string",
                format: "date-time",
            },
            startTime: {
                type: "string",
                format: "date-time",
            },
            endTime: {
                type: "string",
                format: "date-time",
            },
            timeZone: {
                type: "string",
            },
            meetingLink: {
                type: "string",
            },
            location: {
                type: "string",
            },
            notes: {
                type: "string",
            },
            interviewers: {
                type: "array",
                items: {
                    type: "string",
                },
            },
        },
    },

    UpdateInterviewRequest: {
        type: "object",
        properties: {
            mode: {
                type: "string",
                enum: [
                    "ONLINE",
                    "ONSITE",
                    "PHONE",
                ],
            },
            notes: {
                type: "string",
            },
        },
    },

    UpdateInterviewStatusRequest: {
        type: "object",
        required: [
            "status",
        ],
        properties: {
            status: {
                type: "string",
                enum: [
                    "SCHEDULED",
                    "CONFIRMED",
                    "IN_PROGRESS",
                    "COMPLETED",
                    "CANCELLED",
                    "NO_SHOW",
                ],
            },
        },
    },

    RescheduleInterviewRequest: {
        type: "object",
        required: [
            "scheduledDate",
            "startTime",
            "endTime",
            "timeZone",
        ],
        properties: {
            scheduledDate: {
                type: "string",
                format: "date-time",
            },
            startTime: {
                type: "string",
                format: "date-time",
            },
            endTime: {
                type: "string",
                format: "date-time",
            },
            timeZone: {
                type: "string",
            },
            meetingLink: {
                type: "string",
            },
            location: {
                type: "string",
            },
            notes: {
                type: "string",
            },
        },
    },

    RecordInterviewOutcomeRequest: {
        type: "object",
        required: [
            "outcome",
        ],
        properties: {
            outcome: {
                type: "string",
                enum: [
                    "PASS",
                    "FAIL",
                    "ON_HOLD",
                    "RECOMMENDED",
                    "STRONG_RECOMMEND",
                    "NOT_RECOMMENDED",
                ],
            },
            resultNotes: {
                type: "string",
            },
        },
    },

    CancelInterviewRequest: {
        type: "object",
        required: [
            "cancellationReason",
        ],
        properties: {
            cancellationReason: {
                type: "string",
            },
        },
    },

    AssignInterviewersRequest: {
        type: "object",
        required: [
            "interviewers",
        ],
        properties: {
            interviewers: {
                type: "array",
                items: {
                    type: "string",
                },
            },
        },
    },
};

export default interviewSchemas;