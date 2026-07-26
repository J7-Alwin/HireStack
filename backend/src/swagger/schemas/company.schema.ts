const companySchemas = {
    Company: {
        type: "object",
        properties: {
            id: {
                type: "string",
                example: "cmp_123456",
            },
            name: {
                type: "string",
                example: "Acme Technologies",
            },
            description: {
                type: "string",
                example: "Leading recruitment software company.",
            },
            website: {
                type: "string",
                format: "uri",
                example: "https://acme.com",
            },
            industry: {
                type: "string",
                example: "Information Technology",
            },
            companySize: {
                type: "string",
                example: "201-500",
            },
            contactEmail: {
                type: "string",
                format: "email",
                example: "info@acme.com",
            },
            contactPhone: {
                type: "string",
                example: "+91 9876543210",
            },
            headquarters: {
                type: "string",
                example: "Bangalore, India",
            },
            logoUrl: {
                type: "string",
                format: "uri",
            },
            status: {
                type: "string",
                example: "ACTIVE",
            },
            isVerified: {
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

    CompanyListResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            data: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/Company",
                },
            },
        },
    },

    CompanyResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            data: {
                $ref: "#/components/schemas/Company",
            },
        },
    },

    CompanyOnboardingRequest: {
        type: "object",
        required: ["company", "admin"],
        properties: {
            company: {
                type: "object",
                required: ["name", "industry", "companySize"],
                properties: {
                    name: {
                        type: "string",
                        example: "Acme Technologies",
                    },
                    description: {
                        type: "string",
                    },
                    website: {
                        type: "string",
                        format: "uri",
                    },
                    industry: {
                        type: "string",
                        example: "IT",
                    },
                    companySize: {
                        type: "string",
                        example: "51-200",
                    },
                    contactEmail: {
                        type: "string",
                        format: "email",
                    },
                    contactPhone: {
                        type: "string",
                    },
                    headquarters: {
                        type: "string",
                    },
                    logoUrl: {
                        type: "string",
                        format: "uri",
                    },
                },
            },
            admin: {
                type: "object",
                required: ["email"],
                properties: {
                    email: {
                        type: "string",
                        format: "email",
                        example: "admin@acme.com",
                    },
                    name: {
                        type: "string",
                        example: "John Doe",
                    },
                },
            },
        },
    },

    UpdateCompanyRequest: {
        type: "object",
        properties: {
            name: {
                type: "string",
            },
            description: {
                type: "string",
            },
            website: {
                type: "string",
                format: "uri",
            },
            industry: {
                type: "string",
            },
            companySize: {
                type: "string",
            },
            contactEmail: {
                type: "string",
                format: "email",
            },
            contactPhone: {
                type: "string",
            },
            headquarters: {
                type: "string",
            },
            logoUrl: {
                type: "string",
                format: "uri",
            },
        },
    },

    UpdateCompanyStatusRequest: {
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
};

export default companySchemas;