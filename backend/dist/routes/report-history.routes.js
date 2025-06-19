"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const report_history_controller_1 = __importDefault(require("../controllers/report-history.controller"));
const router = express_1.default.Router();
// Report history routes
router.get("/report", report_history_controller_1.default.getReportHistory);
router.get("/report/:id", report_history_controller_1.default.getReportHistoryItem);
router.post("/report", report_history_controller_1.default.saveReportHistory);
router.delete("/report/:id", report_history_controller_1.default.deleteReportHistoryItem);
router.delete("/report", report_history_controller_1.default.clearReportHistory);
// Admin Report History routes
router.get("/admin/report", report_history_controller_1.default.getAllReportHistory);
exports.default = router;
