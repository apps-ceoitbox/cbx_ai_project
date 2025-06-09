import express from "express";
import HistoryController from "../controllers/history.controller";

const router = express.Router();

// Mail Sender history routes
router.get("/mail-sender", HistoryController.getMailSenderHistory);
router.post("/mail-sender", HistoryController.saveMailSenderHistory);
router.delete(
  "/mail-sender/:id",
  HistoryController.deleteMailSenderHistoryItem
);
router.delete("/mail-sender", HistoryController.clearMailSenderHistory);

// Zoomary History routes
router.get("/zoomary", HistoryController.getZoomaryHistory);
router.post("/zoomary", HistoryController.saveZoomaryHistory);
router.delete("/zoomary/:id", HistoryController.deleteZoomaryHistoryItem);
router.delete("/zoomary", HistoryController.clearZoomaryHistory);

// Admin Zoomary History routes
router.get("/admin/zoomary", HistoryController.getAllZoomaryHistory);

// Admin Company Profile History routes
router.get(
  "/admin/company-profile",
  HistoryController.getAllCompanyProfileHistory
);

// Admin Mail Sender History routes
router.get("/admin/mail-sender", HistoryController.getAllMailSenderHistory);

// Company Profile History routes
router.get("/company-profile", HistoryController.getCompanyProfileHistory);
router.get(
  "/company-profile/:id",
  HistoryController.getCompanyProfileHistoryItem
);
router.post("/company-profile", HistoryController.saveCompanyProfileHistory);
router.delete(
  "/company-profile/:id",
  HistoryController.deleteCompanyProfileHistoryItem
);
router.delete("/company-profile", HistoryController.clearCompanyProfileHistory);

export default router;
