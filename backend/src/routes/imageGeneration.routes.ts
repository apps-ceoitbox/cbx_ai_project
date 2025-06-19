import { Router } from "express";
import PromptController from "../controllers/imageGeneration.controller";
const router = Router();

router.post("/enhance-prompt", PromptController.generateEnhancedPrompt);
router.get("/getProvider", PromptController.getApiProvider);
router.get("/getSubmissions", PromptController.getSubmissions);
router.get("/getUserSubmission", PromptController.getUserSubmissions);
router.post("/saveAiProvider", PromptController.saveApiProvider);
router.delete("/deleteSubmission/:id", PromptController.deleteSubmission);
router.post("/generateImage", PromptController.generateImage);
router.get("/download-image", PromptController.downloadImage);
export default router;
