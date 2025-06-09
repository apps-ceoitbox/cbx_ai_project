"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aiAgentSettings_controller_1 = __importDefault(require("../controllers/aiAgentSettings.controller"));
const router = express_1.default.Router();
// GET: Get AI Agent setting by ID
router.get("/", aiAgentSettings_controller_1.default.getSettingsById);
router.post("/addAiCredentials", aiAgentSettings_controller_1.default.saveSettings);
exports.default = router;
