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
};
