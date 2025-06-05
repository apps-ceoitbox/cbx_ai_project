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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const errorCodes_1 = require("../utils/errorCodes");
const submission_model_1 = __importDefault(require("../models/submission.model"));
dotenv_1.default.config();
class SubmissionsController {
    static getSubmissions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _a = req.query, { page = 1, limit = 10, dateFrom, dateTo, tool, category, api, search } = _a, rest = __rest(_a, ["page", "limit", "dateFrom", "dateTo", "tool", "category", "api", "search"]);
                const query = Object.assign({}, rest);
                // Date range filter
                if (dateFrom || dateTo) {
                    query.createdAt = Object.assign(Object.assign({}, (dateFrom ? { $gte: dateFrom } : {})), (dateTo ? { $lte: dateTo } : {}));
                }
                // Optional regex filters
                if (tool && tool != "all") {
                    query.tool = { $regex: tool, $options: "i" };
                }
                if (api && api != "all") {
                    query.apiUsed = { $regex: api, $options: "i" };
                }
                if (category && category != "all") {
                    query.category = { $regex: category, $options: "i" };
                }
                // Search across multiple fields (tool, api, category)
                if (search) {
                    query.$or = [
                        { name: { $regex: search, $options: "i" } },
                        { tool: { $regex: search, $options: "i" } },
                        { apiUsed: { $regex: search, $options: "i" } },
                        { category: { $regex: search, $options: "i" } },
                    ];
                }
                console.log(query);
                const pageNumber = parseInt(page, 10) || 1;
                const limitNumber = parseInt(limit, 10) || 10;
                const submissions = yield submission_model_1.default.find(query)
                    .sort({ createdAt: -1 })
                    .skip((pageNumber - 1) * limitNumber)
                    .limit(limitNumber);
                const totalItems = yield submission_model_1.default.countDocuments(query);
                return res.status(200).json({
                    message: "Submissions fetched successfully",
                    data: submissions,
                    totalPages: Math.ceil(totalItems / limitNumber),
                    currentPage: pageNumber,
                    totalItems,
                });
            }
            catch (err) {
                console.error("Error fetching submissions:", err);
                return res.status(500).json({ message: "Server error", error: err.message });
            }
        });
    }
    static getSubmissionFieldValues(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fields = ['tool', 'category', 'apiUsed']; // Add more fields as needed
                const result = {};
                for (const field of fields) {
                    result[field] = yield submission_model_1.default.distinct(field);
                }
                return res.status(200).json({
                    message: 'Distinct values fetched successfully',
                    data: result,
                });
            }
            catch (err) {
                console.error('Error fetching field values:', err);
                return res.status(500).json({ message: 'Server error', error: err.message });
            }
        });
    }
    static getUserSubmission(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const submission = yield submission_model_1.default.find({ email: req.user.email }).sort({
                createdAt: -1,
            });
            res
                .status(errorCodes_1.HttpStatusCodes.OK)
                .json({ message: "Submission fetched successfully", data: submission });
        });
    }
    static updateSubmission(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const submission = yield submission_model_1.default.findByIdAndUpdate(id, req.body, {
                new: true,
            });
            res
                .status(errorCodes_1.HttpStatusCodes.OK)
                .json({ message: "Submission updated successfully", data: submission });
        });
    }
    static deleteSubmission(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const submission = yield submission_model_1.default.findByIdAndDelete(id);
            res
                .status(errorCodes_1.HttpStatusCodes.OK)
                .json({ message: "Submission deleted successfully", data: submission });
        });
    }
}
exports.default = SubmissionsController;
