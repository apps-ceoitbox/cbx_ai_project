"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const report_history_model_1 = __importDefault(require("../models/report-history.model"));
const errorCodes_1 = require("../utils/errorCodes");
const asyncHandler_1 = require("../utils/asyncHandler");
class ReportHistoryController {
}
_a = ReportHistoryController;
// Admin: Get all Report history across all users
ReportHistoryController.getAllReportHistory = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const history = yield report_history_model_1.default.find({}).sort({ createdAt: -1 });
        // .select("name email fileName fileType createdAt");
        res.status(errorCodes_1.HttpStatusCodes.OK).json({
            message: "All Report history fetched successfully",
            data: history,
        });
    }
    catch (error) {
        console.error("Error fetching all Report history:", error);
        res.status(errorCodes_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to fetch Report history",
        });
    }
}));
// Report: Get all history for a user
ReportHistoryController.getReportHistory = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.email;
    const history = yield report_history_model_1.default.find({
        email: userId,
    }).sort({ createdAt: -1 });
    // .select("fileName fileType createdAt");
    res.status(errorCodes_1.HttpStatusCodes.OK).json({
        message: "Report history fetched successfully",
        data: history,
    });
}));
// Report: Get a specific history item
ReportHistoryController.getReportHistoryItem = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
    const historyId = req.params.id;
    if (!userId) {
        console.error("User ID missing from req.user for getReportHistoryItem");
        res.status(errorCodes_1.HttpStatusCodes.UNAUTHORIZED).json({
            message: "User not authenticated or user ID missing",
        });
        return;
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(historyId)) {
        res
            .status(errorCodes_1.HttpStatusCodes.BAD_REQUEST)
            .json({ message: "Invalid history ID format" });
        return;
    }
    const historyItem = yield report_history_model_1.default.findOne({
        _id: historyId,
        userId: userId,
    });
    if (!historyItem) {
        res.status(errorCodes_1.HttpStatusCodes.NOT_FOUND).json({
            message: "History item not found",
        });
        return;
    }
    res.status(errorCodes_1.HttpStatusCodes.OK).json({
        message: "History item fetched successfully",
        data: historyItem,
    });
}));
// Report: Save history
ReportHistoryController.saveReportHistory = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
    const { fileName, fileType, report } = req.body;
    if (!userId) {
        console.error("User ID missing from req.user for saveReportHistory");
        res.status(errorCodes_1.HttpStatusCodes.UNAUTHORIZED).json({
            message: "User not authenticated or user ID missing",
        });
        return;
    }
    if (!fileName || !fileType || !report) {
        res.status(errorCodes_1.HttpStatusCodes.BAD_REQUEST).json({
            message: "Missing required fields",
        });
        return;
    }
    const newHistoryItem = new report_history_model_1.default({
        userId,
        name: ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userName) || "User",
        email: ((_d = req.user) === null || _d === void 0 ? void 0 : _d.email) || "user@example.com",
        fileName,
        fileType,
        report,
    });
    yield newHistoryItem.save();
    res.status(errorCodes_1.HttpStatusCodes.CREATED).json({
        message: "Report history saved successfully",
        data: newHistoryItem,
    });
}));
// Report: Delete history item
ReportHistoryController.deleteReportHistoryItem = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield report_history_model_1.default.findOneAndDelete({
        _id: id,
    });
    // if (result.deletedCount === 0) {
    //   res.status(HttpStatusCodes.NOT_FOUND).json({
    //     message: "History item not found or already deleted",
    //   });
    //   return;
    // }
    res.status(errorCodes_1.HttpStatusCodes.OK).json({
        message: "History item deleted successfully",
    });
}));
// Report: Clear all history for a user
ReportHistoryController.clearReportHistory = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
    if (!userId) {
        console.error("User ID missing from req.user for clearReportHistory");
        res.status(errorCodes_1.HttpStatusCodes.UNAUTHORIZED).json({
            message: "User not authenticated or user ID missing",
        });
        return;
    }
    const result = yield report_history_model_1.default.deleteMany({
        userId: userId,
    });
    res.status(errorCodes_1.HttpStatusCodes.OK).json({
        message: "All Report history cleared successfully",
        deletedCount: result.deletedCount,
    });
}));
exports.default = ReportHistoryController;
