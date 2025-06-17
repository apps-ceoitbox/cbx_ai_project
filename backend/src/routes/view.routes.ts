import { Router } from "express";
import ViewController from "../controllers/view.controller";
const router = Router();

router.get("/:id", ViewController.getUserSubmissionById);
router.get("/zoom/:id", ViewController.getZoomAgentSubmissionById);
router.get(
  "/company-profile/:id",
  ViewController.getCompanyProfileAgentSubmissionById
);

export default router;
