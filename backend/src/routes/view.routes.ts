import { Router } from "express";
import ViewController from "../controllers/view.controller";
const router = Router();

router.get("/:id", ViewController.getUserSubmissionById);

export default router;
