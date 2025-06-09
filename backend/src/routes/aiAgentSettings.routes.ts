import express from "express";
import AiAgentSettingsController from "../controllers/aiAgentSettings.controller";

const router = express.Router();

// GET: Get AI Agent setting by ID
router.get("/", AiAgentSettingsController.getSettingsById);
router.post("/addAiCredentials", AiAgentSettingsController.saveSettings);

export default router;
