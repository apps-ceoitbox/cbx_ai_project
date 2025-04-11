import { Router } from "express";
import PromptController from "../controllers/prompt.controller";
const router = Router();

router.get("/", PromptController.getAllPrompts);
router.post("/", PromptController.createPrompt);
router.patch("/:id", PromptController.updatePrompt);
router.delete("/:id", PromptController.deletePrompt);

export default router;
