const securitySchemes = {
    BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
            "Enter your JWT access token. Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    },
};

const globalSecurity = [
    {
        BearerAuth: [],
    },
];

export { securitySchemes, globalSecurity };