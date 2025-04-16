import { Router } from "express";
import AstroController from "../controllers/astro.controller";
const router = Router();

router.get("/", AstroController.getSettings);
router.get("/submissions", AstroController.getAllSubmissions);
router.post("/", AstroController.saveSettings);
router.post("/generate", AstroController.generateResponseByAI);

export default router;
