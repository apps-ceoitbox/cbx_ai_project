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
const dotenv_1 = __importDefault(require("dotenv"));
const AI_1 = require("../utils/AI");
const ai_model_1 = __importDefault(require("../models/ai.model"));
const asyncHandler_1 = require("../utils/asyncHandler");
const errorCodes_1 = require("../utils/errorCodes");
const documentSettings_model_1 = __importDefault(require("../models/documentSettings.model"));
const documentSubmission_model_1 = __importDefault(require("../models/documentSubmission.model"));
dotenv_1.default.config();
class DocumentController {
}
_a = DocumentController;
DocumentController.saveSettings = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = yield documentSettings_model_1.default.findOneAndUpdate({ name: "Document" }, // Filter to find the document
    { $set: data }, // Update fields
    { new: true, upsert: true } // Options: create if not found
    );
    res
        .status(errorCodes_1.HttpStatusCodes.OK)
        .json({ message: "Document Settings created successfully", data: result });
}));
DocumentController.getSettings = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield documentSettings_model_1.default.findOne({ name: "Document" });
    res.send({ message: "Astro Settings fetched successfully", data: data });
}));
DocumentController.getDocumentSubmission = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield documentSubmission_model_1.default.find();
    res.send({ message: "Document Submission fetched successfully", data: data });
}));
DocumentController.getDocumentUserSubmission = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield documentSubmission_model_1.default.find({ email: req.user.email });
    res.send({ message: "Document Submission fetched successfully", data: data });
}));
DocumentController.processDocument = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const files = req.body.files;
    const processingOption = req.body.processingOption;
    const documentType = req.body.documentType;
    const goal = req.body.goal;
    const documentSettings = yield documentSettings_model_1.default.findOne({ name: "Document" });
    const apiProvider = yield ai_model_1.default.findOne({ name: documentSettings === null || documentSettings === void 0 ? void 0 : documentSettings.aiProvider.name });
    const ai = new AI_1.AI({
        name: apiProvider === null || apiProvider === void 0 ? void 0 : apiProvider.name,
        model: (_b = documentSettings === null || documentSettings === void 0 ? void 0 : documentSettings.aiProvider) === null || _b === void 0 ? void 0 : _b.model,
        apiKey: apiProvider === null || apiProvider === void 0 ? void 0 : apiProvider.apiKey,
        temperature: apiProvider === null || apiProvider === void 0 ? void 0 : apiProvider.temperature,
        maxTokens: apiProvider === null || apiProvider === void 0 ? void 0 : apiProvider.maxTokens,
    });
    const result = yield ai.processDocument(files, processingOption, documentType, goal, documentSettings.promptContent);
    const submissionData = {
        processingOption,
        files: files.map(file => file.type),
        documentType,
        goal,
        promptContent: documentSettings === null || documentSettings === void 0 ? void 0 : documentSettings.promptContent,
        aiProvider: documentSettings === null || documentSettings === void 0 ? void 0 : documentSettings.aiProvider.name,
        model: (_c = documentSettings === null || documentSettings === void 0 ? void 0 : documentSettings.aiProvider) === null || _c === void 0 ? void 0 : _c.model,
        email: req.user.email,
        name: req.user.userName,
        result
    };
    // DocumentSubmission.create(submissionData);
    res.send(result);
}));
exports.default = DocumentController;
