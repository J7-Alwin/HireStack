const recruiterSchemas = {
    Recruiter: {
        type: "object",
        properties: {
            id: {
                type: "string",
                example: "rec_123456",
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
                example: "john@company.com",
            },
            designation: {
                type: "string",
                example: "Senior Recruiter",
            },
            departmentId: {
                type: "string",
                example: "dept_123456",
            },
            phone: {
                type: "string",
                example: "+91 9876543210",
            },
            experience: {
                type: "integer",
                example: 5,
            },
            avatar: {
                type: "string",
                format: "uri",
            },
            isActive: {
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

    RecruiterResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            data: {
                $ref: "#/components/schemas/Recruiter",
            },
        },
    },

    RecruiterListResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            data: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/Recruiter",
                },
            },
        },
    },

    CreateRecruiterRequest: {
        type: "object",
        required: [
            "firstName",
            "lastName",
            "email",
            "departmentId",
            "designation",
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
            departmentId: {
                type: "string",
            },
            designation: {
                type: "string",
            },
            phone: {
                type: "string",
            },
            experience: {
                type: "integer",
            },
            avatar: {
                type: "string",
                format: "uri",
            },
        },
    },

    UpdateRecruiterRequest: {
        type: "object",
        properties: {
            firstName: {
                type: "string",
            },
            lastName: {
                type: "string",
            },
            designation: {
                type: "string",
            },
            phone: {
                type: "string",
            },
            experience: {
                type: "integer",
            },
            avatar: {
                type: "string",
                format: "uri",
            },
            departmentId: {
                type: "string",
            },
        },
    },

    ChangeRecruiterDepartmentRequest: {
        type: "object",
        required: ["departmentId"],
        properties: {
            departmentId: {
                type: "string",
                example: "dept_123456",
            },
        },
    },
};

export default recruiterSchemas;