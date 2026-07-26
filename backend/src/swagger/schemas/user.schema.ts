const userSchemas = {
    User: {
        type: "object",
        properties: {
            id: {
                type: "string",
                example: "clx123456789",
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
                example: "john@hirestack.com",
            },
            role: {
                type: "string",
                example: "COMPANY_ADMIN",
            },
            status: {
                type: "string",
                example: "ACTIVE",
            },
            companyId: {
                type: "string",
                nullable: true,
                example: "cmp_123",
            },
            emailVerified: {
                type: "boolean",
                example: true,
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

    CurrentUserResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            data: {
                $ref: "#/components/schemas/User",
            },
        },
    },

    UserListResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            data: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/User",
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

    UpdateUserStatusRequest: {
        type: "object",
        required: ["status"],
        properties: {
            status: {
                type: "string",
                enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
                example: "ACTIVE",
            },
        },
    },

    SuccessResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            message: {
                type: "string",
                example: "Operation completed successfully.",
            },
        },
    },
};

export default userSchemas;