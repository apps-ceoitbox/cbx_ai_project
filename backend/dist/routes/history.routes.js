"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const history_controller_1 = __importDefault(require("../controllers/history.controller"));
const router = express_1.default.Router();
// Mail Sender history routes
router.get("/mail-sender", history_controller_1.default.getMailSenderHistory);
router.post("/mail-sender", history_controller_1.default.saveMailSenderHistory);
router.delete("/mail-sender/:id", history_controller_1.default.deleteMailSenderHistoryItem);
router.delete("/mail-sender", history_controller_1.default.clearMailSenderHistory);
// Zoomary History routes
router.get("/zoomary", history_controller_1.default.getZoomaryHistory);
router.post("/zoomary", history_controller_1.default.saveZoomaryHistory);
router.delete("/zoomary/:id", history_controller_1.default.deleteZoomaryHistoryItem);
router.delete("/zoomary", history_controller_1.default.clearZoomaryHistory);
// Admin Zoomary History routes
router.get("/admin/zoomary", history_controller_1.default.getAllZoomaryHistory);
// Admin Company Profile History routes
router.get("/admin/company-profile", history_controller_1.default.getAllCompanyProfileHistory);
// Admin Mail Sender History routes
router.get("/admin/mail-sender", history_controller_1.default.getAllMailSenderHistory);
// Company Profile History routes
router.get("/company-profile", history_controller_1.default.getCompanyProfileHistory);
router.get("/company-profile/:id", history_controller_1.default.getCompanyProfileHistoryItem);
router.post("/company-profile", history_controller_1.default.saveCompanyProfileHistory);
router.delete("/company-profile/:id", history_controller_1.default.deleteCompanyProfileHistoryItem);
router.delete("/company-profile", history_controller_1.default.clearCompanyProfileHistory);
exports.default = router;
