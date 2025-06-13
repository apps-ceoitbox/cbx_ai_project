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
const dotenv_1 = __importDefault(require("dotenv"));
const zoomary_history_model_1 = __importDefault(require("../models/zoomary-history.model"));
const company_profile_history_model_1 = __importDefault(require("../models/company-profile-history.model"));
const mail_sender_history_model_1 = __importDefault(require("../models/mail-sender-history.model"));
const errorCodes_1 = require("../utils/errorCodes");
const asyncHandler_1 = require("../utils/asyncHandler");
dotenv_1.default.config();
class HistoryController {
}
_a = HistoryController;
// Admin: Get all Mail Sender history across all users
HistoryController.getAllMailSenderHistory = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const history = yield mail_sender_history_model_1.default.find({})
            .sort({ createdAt: -1 })
            .select("recipient subject message response name email createdAt");
        res.status(errorCodes_1.HttpStatusCodes.OK).json({
            message: "All Mail Sender history fetched successfully",
            data: history,
        });
    }
    catch (error) {
        console.error("Error fetching all Mail Sender history:", error);
        res.status(errorCodes_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to fetch Mail Sender history",
        });
    }
}));
// Admin: Get all Zoomary history across all users
HistoryController.getAllZoomaryHistory = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const history = yield zoomary_history_model_1.default.find({})
            .sort({ createdAt: -1 })
            .select("name email title summary meetingDate createdAt");
        res.status(errorCodes_1.HttpStatusCodes.OK).json({
            message: "All Zoomary history fetched successfully",
            data: history,
        });
    }
    catch (error) {
        console.error("Error fetching all Zoomary history:", error);
        res.status(errorCodes_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to fetch Zoomary history",
        });
    }
}));
// Mail Sender: Get all history
HistoryController.getMailSenderHistory = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
    if (!userId) {
        console.error("User ID missing from req.user for getMailSenderHistory");
        res.status(errorCodes_1.HttpStatusCodes.UNAUTHORIZED).json({
            message: "User not authenticated or user ID missing",
        });
        return; // Ensure void return
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        res
            .status(errorCodes_1.HttpStatusCodes.BAD_REQUEST)
            .json({ message: "Invalid user ID format for query" });
        return; // Ensure void return
    }
    const history = yield mail_sender_history_model_1.default.find({
        userId: new mongoose_1.default.Types.ObjectId(userId),
    })
        .sort({ createdAt: -1 })
        .select("recipient subject createdAt");
    res.status(errorCodes_1.HttpStatusCodes.OK).json({
        message: "Mail sender history fetched successfully",
        data: history,
    });
}));
// Mail Sender: Save history
HistoryController.saveMailSenderHistory = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d;
    console.log("saveMailSenderHistory: req.user received:", JSON.stringify(req.user, null, 2)); // Log req.user
    const { recipient, subject, message, response } = req.body;
    const userEmail = (_b = req.user) === null || _b === void 0 ? void 0 : _b.email;
    const userName = (_c = req.user) === null || _c === void 0 ? void 0 : _c.userName;
    const userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d._id;
    if (!userEmail || !userName || !userId) {
        console.error("User details missing from req.user for saveMailSenderHistory - Email, Name, or ID is missing.");
        console.error("User details missing from req.user for saveMailSenderHistory");
        res.status(errorCodes_1.HttpStatusCodes.UNAUTHORIZED).json({
            message: "User not authenticated or user details missing",
        });
        return; // Ensure void return
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        res
            .status(errorCodes_1.HttpStatusCodes.BAD_REQUEST)
            .json({ message: "Invalid user ID format for saving" });
        return; // Ensure void return
    }
    if (!recipient || !subject || !message || !response) {
        console.error("Required fields missing from request body.");
        res.status(errorCodes_1.HttpStatusCodes.BAD_REQUEST).json({
            message: "Recipient, subject, message, and response are required",
        });
        return; // Ensure void return
    }
    const newHistoryData = {
        // Prepare data for logging and model
        name: userName,
        email: userEmail,
        userId: new mongoose_1.default.Types.ObjectId(userId),
        recipient,
        subject,
        message,
        response,
    };
    console.log("saveMailSenderHistory: Data prepared for saving:", JSON.stringify(newHistoryData, null, 2)); // Log data before saving
    const newHistory = new mail_sender_history_model_1.default(newHistoryData);
    yield newHistory.save();
    res.status(errorCodes_1.HttpStatusCodes.CREATED).json({
        message: "Mail sender history saved successfully",
        data: newHistory,
    });
}));
// Mail Sender: Delete history item
HistoryController.deleteMailSenderHistoryItem = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { id } = req.params;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
    if (!userId) {
        console.error("User ID missing from req.user for deleteMailSenderHistoryItem");
        res.status(errorCodes_1.HttpStatusCodes.UNAUTHORIZED).json({
            message: "User not authenticated or user ID missing",
        });
        return; // Ensure void return
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(id) ||
        !mongoose_1.default.Types.ObjectId.isValid(userId)) {
        res
            .status(errorCodes_1.HttpStatusCodes.BAD_REQUEST)
            .json({ message: "Invalid history item ID or user ID format" });
        return; // Ensure void return
    }
    try {
        const result = yield mail_sender_history_model_1.default.findOneAndDelete({
            _id: id,
            userId: new mongoose_1.default.Types.ObjectId(userId),
        });
        if (!result) {
            res.status(errorCodes_1.HttpStatusCodes.NOT_FOUND).json({
                message: "History item not found, not authorized, or already deleted",
            });
            return; // Ensure void return
        }
        res.status(errorCodes_1.HttpStatusCodes.OK).json({
            message: "Mail sender history item deleted successfully",
            data: { id: result._id }, // Return the ID of the deleted item
        });
    }
    catch (error) {
        console.error("Error deleting Mail sender history item:", error);
        // Pass to the generic error handler or handle specifically
        next(error);
    }
}));
// Mail Sender: Clear all history
HistoryController.clearMailSenderHistory = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
    if (!userId) {
        console.error("User ID missing from req.user for clearMailSenderHistory");
        res.status(errorCodes_1.HttpStatusCodes.UNAUTHORIZED).json({
            message: "User not authenticated or user ID missing",
        });
        return; // Ensure void return
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        res
            .status(errorCodes_1.HttpStatusCodes.BAD_REQUEST)
            .json({ message: "Invalid user ID format" });
        return; // Ensure void return
    }
    try {
        const result = yield mail_sender_history_model_1.default.deleteMany({
            userId: new mongoose_1.default.Types.ObjectId(userId),
        });
        res.status(errorCodes_1.HttpStatusCodes.OK).json({
            message: "Mail sender history cleared successfully",
            data: { deletedCount: result.deletedCount },
        });
    }
    catch (error) {
        console.error("Error clearing Mail sender history:", error);
        // Pass to the generic error handler or handle specifically
        next(error);
    }
}));
// Zoomary: Get all history
HistoryController.getZoomaryHistory = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userEmail = (_b = req.user) === null || _b === void 0 ? void 0 : _b.email;
    if (!userEmail) {
        res.status(errorCodes_1.HttpStatusCodes.UNAUTHORIZED).json({
            message: "User not authenticated or email missing",
            data: [],
        });
        return; // Ensure void return for asyncHandler
    }
    const history = yield zoomary_history_model_1.default.find({ email: userEmail })
        .sort({ createdAt: -1 })
        .select("title summary meetingDate createdAt");
    res.status(errorCodes_1.HttpStatusCodes.OK).json({
        message: "Zoomary history fetched successfully",
        data: history,
    });
}));
// Zoomary: Save history
HistoryController.saveZoomaryHistory = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const { title, summary, meetingDate } = req.body;
    const userEmail = (_b = req.user) === null || _b === void 0 ? void 0 : _b.email;
    const userName = (_c = req.user) === null || _c === void 0 ? void 0 : _c.userName;
    if (!userEmail || !userName) {
        res.status(errorCodes_1.HttpStatusCodes.UNAUTHORIZED).json({
            message: "User not authenticated or user details missing",
        });
        return; // Ensure void return
    }
    if (!title || !summary) {
        res
            .status(errorCodes_1.HttpStatusCodes.BAD_REQUEST)
            .json({ message: "Title and summary are required" });
        return; // Ensure void return
    }
    const newHistory = new zoomary_history_model_1.default({
        name: userName,
        email: userEmail,
        title,
        summary,
        meetingDate: meetingDate || new Date(),
    });
    yield newHistory.save();
    res.status(errorCodes_1.HttpStatusCodes.CREATED).json({
        message: "Zoomary history saved successfully",
        data: newHistory,
    });
}));
// Zoomary: Delete history item
HistoryController.deleteZoomaryHistoryItem = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res
            .status(errorCodes_1.HttpStatusCodes.BAD_REQUEST)
            .json({ message: "Invalid history item ID" });
        return; // Ensure void return
    }
    try {
        const result = yield zoomary_history_model_1.default.findOneAndDelete({
            _id: id,
        });
        if (!result) {
            res.status(errorCodes_1.HttpStatusCodes.NOT_FOUND).json({
                message: "History item not found, not authorized, or already deleted",
            });
            return; // Ensure void return
        }
        res.status(errorCodes_1.HttpStatusCodes.OK).json({
            message: "Zoomary history item deleted successfully",
            data: { id: result._id },
        });
    }
    catch (error) {
        console.error("Error deleting Zoomary history item:", error);
        next(error);
    }
}));
// Zoomary: Clear all history
HistoryController.clearZoomaryHistory = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userEmail = (_b = req.user) === null || _b === void 0 ? void 0 : _b.email;
    if (!userEmail) {
        res.status(errorCodes_1.HttpStatusCodes.UNAUTHORIZED).json({
            message: "User not authenticated or email missing",
        });
        return; // Ensure void return
    }
    try {
        const result = yield zoomary_history_model_1.default.deleteMany({ email: userEmail });
        res.status(errorCodes_1.HttpStatusCodes.OK).json({
            message: "Zoomary history cleared successfully",
            data: { deletedCount: result.deletedCount },
        });
    }
    catch (error) {
        console.error("Error clearing Zoomary history:", error);
        next(error);
    }
}));
// CompanyProfile: Get all history
HistoryController.getCompanyProfileHistory = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id; // Changed from req.user?.id to req.user?._id
    if (!userId) {
        res.status(errorCodes_1.HttpStatusCodes.UNAUTHORIZED).json({
            message: "User not authenticated or user ID missing",
        });
        return; // Ensure void return
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        res
            .status(errorCodes_1.HttpStatusCodes.BAD_REQUEST)
            .json({ message: "Invalid user ID format for query" });
        return; // Ensure void return
    }
    const history = yield company_profile_history_model_1.default.find({
        userId: new mongoose_1.default.Types.ObjectId(userId),
    })
        .sort({ createdAt: -1 })
        .select("companyName sourcedFrom createdAt");
    res.status(errorCodes_1.HttpStatusCodes.OK).json({
        message: "Company profile history fetched successfully",
        data: history,
    });
}));
// CompanyProfile: Get single history item
HistoryController.getCompanyProfileHistoryItem = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id; // Changed from req.user?.id to req.user?._id
    const { id } = req.params;
    if (!userId) {
        res.status(errorCodes_1.HttpStatusCodes.UNAUTHORIZED).json({
            message: "User not authenticated or user ID missing",
        });
        return; // Ensure void return
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(id) ||
        !mongoose_1.default.Types.ObjectId.isValid(userId)) {
        res
            .status(errorCodes_1.HttpStatusCodes.BAD_REQUEST)
            .json({ message: "Invalid history item ID or user ID format" });
        return; // Ensure void return
    }
    const historyItem = yield company_profile_history_model_1.default.findOne({
        _id: id,
        userId: new mongoose_1.default.Types.ObjectId(userId),
    });
    if (!historyItem) {
        res
            .status(errorCodes_1.HttpStatusCodes.NOT_FOUND)
            .json({ message: "History item not found or not authorized" });
        return; // Ensure void return
    }
    res.status(errorCodes_1.HttpStatusCodes.OK).json({
        message: "Company profile history item fetched successfully",
        data: historyItem,
    });
}));
// CompanyProfile: Save history
HistoryController.saveCompanyProfileHistory = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d;
    const { companyName, report, sourcedFrom } = req.body;
    const userEmail = (_b = req.user) === null || _b === void 0 ? void 0 : _b.email;
    const userName = (_c = req.user) === null || _c === void 0 ? void 0 : _c.userName;
    const userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d._id; // Changed from req.user?.id to req.user?._id
    if (!userEmail || !userName || !userId) {
        res.status(errorCodes_1.HttpStatusCodes.UNAUTHORIZED).json({
            message: "User not authenticated or user details missing",
        });
        return; // Ensure void return
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        res
            .status(errorCodes_1.HttpStatusCodes.BAD_REQUEST)
            .json({ message: "Invalid user ID format for saving" });
        return; // Ensure void return
    }
    if (!companyName || !report) {
        res
            .status(errorCodes_1.HttpStatusCodes.BAD_REQUEST)
            .json({ message: "Company name and report are required" });
        return; // Ensure void return
    }
    const newHistoryData = {
        // Prepare data for logging and model
        name: userName,
        email: userEmail,
        userId: new mongoose_1.default.Types.ObjectId(userId),
        companyName,
        report,
        sourcedFrom: sourcedFrom || "Gmail",
    };
    const newHistory = new company_profile_history_model_1.default(newHistoryData);
    yield newHistory.save();
    res.status(errorCodes_1.HttpStatusCodes.CREATED).json({
        message: "Company profile history saved successfully",
        data: newHistory,
    });
}));
// CompanyProfile: Delete history item
HistoryController.deleteCompanyProfileHistoryItem = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res
            .status(errorCodes_1.HttpStatusCodes.BAD_REQUEST)
            .json({ message: "Invalid history item ID or user ID format" });
        return; // Ensure void return
    }
    try {
        const result = yield company_profile_history_model_1.default.findOneAndDelete({
            _id: id,
        });
        if (!result) {
            res.status(errorCodes_1.HttpStatusCodes.NOT_FOUND).json({
                message: "History item not found, not authorized, or already deleted",
            });
            return; // Ensure void return
        }
        res.status(errorCodes_1.HttpStatusCodes.OK).json({
            message: "Company profile history item deleted successfully",
            data: { id: result._id },
        });
    }
    catch (error) {
        next(error);
    }
}));
// CompanyProfile: Clear all history
HistoryController.clearCompanyProfileHistory = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
    if (!userId) {
        res.status(errorCodes_1.HttpStatusCodes.UNAUTHORIZED).json({
            message: "User not authenticated or user ID missing",
        });
        return; // Ensure void return
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        res
            .status(errorCodes_1.HttpStatusCodes.BAD_REQUEST)
            .json({ message: "Invalid user ID format" });
        return; // Ensure void return
    }
    try {
        const result = yield company_profile_history_model_1.default.deleteMany({
            userId: new mongoose_1.default.Types.ObjectId(userId),
        });
        res.status(errorCodes_1.HttpStatusCodes.OK).json({
            message: "Company profile history cleared successfully",
            data: { deletedCount: result.deletedCount },
        });
    }
    catch (error) {
        next(error);
    }
}));
// This function will be added to the HistoryController class
HistoryController.getAllCompanyProfileHistory = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const history = yield company_profile_history_model_1.default.find({})
            .sort({ createdAt: -1 })
            .select("name email companyName report sourcedFrom createdAt");
        res.status(errorCodes_1.HttpStatusCodes.OK).json({
            message: "All Company Profile history fetched successfully",
            data: history,
        });
    }
    catch (error) {
        res.status(errorCodes_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to fetch Company Profile history",
        });
    }
}));
exports.default = HistoryController;
