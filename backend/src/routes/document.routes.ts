import { Router } from "express";
import DocumentController from "../controllers/document.controller";

const router = Router();

router.get("/", DocumentController.getSettings);
router.post("/", DocumentController.saveSettings);
router.post("/process", DocumentController.processDocument);
router.get("/submissions", DocumentController.getDocumentSubmission);
router.get("/user-submissions", DocumentController.getDocumentUserSubmission);

export default router;
    