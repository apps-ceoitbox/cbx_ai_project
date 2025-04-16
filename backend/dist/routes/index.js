"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_routes_1 = __importDefault(require("./user.routes"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const aiSettings_routes_1 = __importDefault(require("./aiSettings.routes"));
const prompt_routes_1 = __importDefault(require("./prompt.routes"));
const submission_routes_1 = __importDefault(require("./submission.routes"));
const astro_routes_1 = __importDefault(require("./astro.routes"));
const router = (0, express_1.Router)();
// Routes that don't require authentication
router.use("/auth", auth_routes_1.default); // Register and login routes
// Middleware that checks for a valid token (authentication)
router.use(authMiddleware_1.authenticateToken);
// Routes that require authentication
router.use("/users", user_routes_1.default);
router.use("/aiSettings", aiSettings_routes_1.default);
router.use("/prompt", prompt_routes_1.default);
router.use("/submission", submission_routes_1.default);
router.use("/astro", astro_routes_1.default);
exports.default = router;
