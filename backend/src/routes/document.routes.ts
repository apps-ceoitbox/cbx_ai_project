import { Router } from "express";
import DocumentController from "../controllers/document.controller";

const router = Router();

router.post("/process", DocumentController.processDocument);

export default router;
