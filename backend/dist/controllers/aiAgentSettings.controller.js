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
const errorCodes_1 = require("../utils/errorCodes");
const asyncHandler_1 = require("../utils/asyncHandler");
const aiAgentSettings_model_1 = __importDefault(require("../models/aiAgentSettings.model"));
dotenv_1.default.config();
class AiAgentSettingsController {
}
_a = AiAgentSettingsController;
// GET: Fetch settings by ID
AiAgentSettingsController.getSettingsById = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const setting = yield aiAgentSettings_model_1.default.find({});
    if (!setting) {
        res
            .status(errorCodes_1.HttpStatusCodes.NOT_FOUND)
            .json({ message: "AI Agent setting not found" });
    }
    res.status(errorCodes_1.HttpStatusCodes.OK).json({
        message: "AI Agent setting fetched successfully",
        data: setting,
    });
}));
AiAgentSettingsController.saveSettings = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = yield aiAgentSettings_model_1.default.findOneAndUpdate({ name: data === null || data === void 0 ? void 0 : data.name }, { $set: data }, { new: true, upsert: true });
    res
        .status(errorCodes_1.HttpStatusCodes.OK)
        .json({ message: "AI Settings created successfully", data: result });
}));
exports.default = AiAgentSettingsController;
