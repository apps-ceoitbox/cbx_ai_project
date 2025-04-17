import { Router } from "express";
import AstroController from "../controllers/astro.controller";
const router = Router();

router.get("/", AstroController.getSettings);
router.get("/submissions", AstroController.getAllSubmissions);
router.get("/user/submissions", AstroController.getUserSubmission);
router.post("/", AstroController.saveSettings);
router.post("/generate", AstroController.generateResponseByAI);

export default router;
