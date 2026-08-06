import swaggerJsdoc, { Options } from "swagger-jsdoc";

import tags from "./tags";
import schemas from "./schemas";
import { securitySchemes, globalSecurity } from "./security";

const options: Options = {
    definition: {
        openapi: "3.0.3",

        info: {
            title: "HireStack API",
            version: "1.0.0",
            description:
                "HireStack Recruitment Management System API",
        },

        servers: [
            {
                url: "http://localhost:5000/api",
                description: "Development Server",
            },
        ],

        tags,

        components: {
            securitySchemes,
            schemas,
        },

        security: globalSecurity,
    },

    apis: [
        "./src/swagger/paths/*.ts",
        "./src/modules/ai/swagger/*.ts",
    ],
};


const swaggerSpec = swaggerJsdoc(options);

//console.log(Object.keys(swaggerSpec.paths ?? {}));



export default swaggerSpec;