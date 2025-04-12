"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Documentation",
            version: "1.0.0",
            description: "API documentation for your application",
        },
        servers: [
            {
                url: "http://localhost", // Replace with your API server URL
            },
            {
                url: "https://business-hero-assignment.onrender.com", // Replace with your API server URL
            },
        ],
        components: {
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        userName: {
                            type: "string",
                        },
                        email: {
                            type: "string",
                        },
                        password: {
                            type: "string",
                        },
                    },
                },
                RegisterRequest: {
                    type: "object",
                    properties: {
                        userName: {
                            type: "string",
                        },
                        email: {
                            type: "string",
                        },
                        password: {
                            type: "string",
                        },
                    },
                },
            },
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
    },
    apis: ["./src/routes/*.ts", "./dist/routes/*.js"], // Adjust the path to your route files
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
