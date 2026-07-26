const authSchemas = {
    LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
            email: {
                type: "string",
                format: "email",
                example: "admin@hirestack.com",
            },
            password: {
                type: "string",
                format: "password",
                example: "Admin@123",
            },
        },
    },

    RefreshTokenRequest: {
        type: "object",
        required: ["refreshToken"],
        properties: {
            refreshToken: {
                type: "string",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
        },
    },

    ForgotPasswordRequest: {
        type: "object",
        required: ["email"],
        properties: {
            email: {
                type: "string",
                format: "email",
                example: "john@example.com",
            },
        },
    },

    ResetPasswordRequest: {
        type: "object",
        required: ["token", "newPassword", "confirmPassword"],
        properties: {
            token: {
                type: "string",
                example: "reset-token",
            },
            newPassword: {
                type: "string",
                example: "NewPassword@123",
            },
            confirmPassword: {
                type: "string",
                example: "NewPassword@123",
            },
        },
    },

    VerifyEmailRequest: {
        type: "object",
        required: ["token"],
        properties: {
            token: {
                type: "string",
                example: "verification-token",
            },
        },
    },

    ChangePasswordRequest: {
        type: "object",
        required: [
            "currentPassword",
            "newPassword",
            "confirmPassword",
        ],
        properties: {
            currentPassword: {
                type: "string",
                example: "OldPassword@123",
            },
            newPassword: {
                type: "string",
                example: "NewPassword@123",
            },
            confirmPassword: {
                type: "string",
                example: "NewPassword@123",
            },
        },
    },

    LoginResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            message: {
                type: "string",
                example: "Login successful",
            },
            data: {
                type: "object",
                properties: {
                    accessToken: {
                        type: "string",
                    },
                    refreshToken: {
                        type: "string",
                    },
                    user: {
                        type: "object",
                    },
                },
            },
        },
    },
};

export default authSchemas;