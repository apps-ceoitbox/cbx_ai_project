"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_routes_1 = __importDefault(require("./user.routes"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const view_routes_1 = __importDefault(require("./view.routes"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const aiSettings_routes_1 = __importDefault(require("./aiSettings.routes"));
const prompt_routes_1 = __importDefault(require("./prompt.routes"));
const submission_routes_1 = __importDefault(require("./submission.routes"));
const astro_routes_1 = __importDefault(require("./astro.routes"));
const document_routes_1 = __importDefault(require("./document.routes"));
const history_routes_1 = __importDefault(require("./history.routes"));
const aiAgentSettings_routes_1 = __importDefault(require("./aiAgentSettings.routes"));
const imageGeneration_routes_1 = __importDefault(require("./imageGeneration.routes"));
const router = (0, express_1.Router)();
router.use("/auth", auth_routes_1.default);
router.use("/view", view_routes_1.default);
router.use(authMiddleware_1.authenticateToken);
router.use("/users", user_routes_1.default);
router.use("/aiSettings", aiSettings_routes_1.default);
router.use("/prompt", prompt_routes_1.default);
router.use("/submission", submission_routes_1.default);
router.use("/astro", astro_routes_1.default);
router.use("/document", document_routes_1.default);
router.use("/history", history_routes_1.default);
router.use("/aiagentsettings", aiAgentSettings_routes_1.default);
router.use("/generateImage", imageGeneration_routes_1.default);
exports.default = router;
