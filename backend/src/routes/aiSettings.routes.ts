import { Router } from "express";
import AiSettingsController from "../controllers/aiSettings.controller";
const router = Router();

router.get("/", AiSettingsController.getAiSettings);
router.post("/", AiSettingsController.createNewAiEntry);
router.patch("/:id", AiSettingsController.updateAiSettings);
router.patch("/", AiSettingsController.updateManyAiSettings);

export default router;
