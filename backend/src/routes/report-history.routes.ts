import express from "express";
import ReportHistoryController from "../controllers/report-history.controller";

const router = express.Router();

// Report history routes
router.get("/report", ReportHistoryController.getReportHistory);
router.get("/report/:id", ReportHistoryController.getReportHistoryItem);
router.post("/report", ReportHistoryController.saveReportHistory);
router.delete("/report/:id", ReportHistoryController.deleteReportHistoryItem);
router.delete("/report", ReportHistoryController.clearReportHistory);

// Admin Report History routes
router.get("/admin/report", ReportHistoryController.getAllReportHistory);

export default router;