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
dotenv_1.default.config();
class DocumentController {
}
_a = DocumentController;
DocumentController.processDocument = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.body.files;
    const processingOption = req.body.processingOption;
    const documentType = req.body.documentType;
    const goal = req.body.goal;
    const apiProvider = yield ai_model_1.default.findOne({ name: "Gemini (Google)" });
    const ai = new AI_1.AI({
        name: apiProvider === null || apiProvider === void 0 ? void 0 : apiProvider.name,
        model: apiProvider === null || apiProvider === void 0 ? void 0 : apiProvider.model,
        apiKey: apiProvider === null || apiProvider === void 0 ? void 0 : apiProvider.apiKey,
        temperature: apiProvider === null || apiProvider === void 0 ? void 0 : apiProvider.temperature,
        maxTokens: apiProvider === null || apiProvider === void 0 ? void 0 : apiProvider.maxTokens,
    });
    const result = yield ai.processDocument(files, processingOption, documentType, goal);
    console.log({ result });
    res.send(result);
}));
exports.default = DocumentController;
