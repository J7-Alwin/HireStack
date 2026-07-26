import { Options } from "swagger-jsdoc";

const swaggerConfig: Options = {
    definition: {
        openapi: "3.0.3",

        info: {
            title: "HireStack API",
            version: "1.0.0",
            description:
                "HireStack is a Recruitment Management System API for managing companies, recruiters, candidates, jobs, applications, interviews, offers, and hiring workflows.",
            contact: {
                name: "HireStack Development Team",
            },
            license: {
                name: "MIT",
            },
        },

        servers: [
            {
                url: "http://localhost:5000/api",
                description: "Local Development",
            },
        ],

        tags: [],

        components: {
            securitySchemes: {},
            schemas: {},
        },

        security: [],
    },

    apis: [],
};

export default swaggerConfig;