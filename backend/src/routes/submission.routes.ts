import { Router } from "express";
import SubmissionsController from "../controllers/submissions.controller";
const router = Router();

router.get("/", SubmissionsController.getSubmissions);
router.get("/user", SubmissionsController.getUserSubmission);
router.patch("/:id", SubmissionsController.updateSubmission);
router.delete("/:id", SubmissionsController.deleteSubmission);

export default router;
