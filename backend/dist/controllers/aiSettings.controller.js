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
const ai_model_1 = __importDefault(require("../models/ai.model"));
const asyncHandler_1 = require("../utils/asyncHandler");
dotenv_1.default.config();
const apiProviders = [
    { name: "ChatGPT (OpenAI)", models: ["gpt-4o", "gpt-4o-mini"], apiKey: "", temperature: 0.5, maxTokens: 4096 },
    { name: "Claude (Anthropic)", models: ["claude-3-opus-20240229", "claude-3-5-sonnet-20241022", "claude-3-5-sonnet-20240620"], apiKey: "", temperature: 0.5, maxTokens: 4096 },
    { name: "Gemini (Google)", models: ["gemini-1.5-flash-latest", "gemini-1.5-flash-001", "gemini-1.5-flash-002"], apiKey: "", temperature: 0.5, maxTokens: 4096 },
    { name: "Grok (xAI)", models: [], apiKey: "", temperature: 0.5, maxTokens: 4096 },
    { name: "Deepseek", models: [], apiKey: "", temperature: 0.5, maxTokens: 4096 },
    { name: "Ollama (Self-hosted)", models: ["llama3.1-70b"], apiKey: "", temperature: 0.5, maxTokens: 4096 },
    { name: "Perplexity", models: ["perplexity-2024-04-09", "perplexity-2024-04-09-preview", "llama-3.1-sonar-small-128k-online"], apiKey: "", temperature: 0.5, maxTokens: 4096 },
    { name: "Mistral", models: ["mistral-large-latest"], apiKey: "", temperature: 0.5, maxTokens: 4096 },
];
class AiSettingsController {
    static createAiEntries() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const prevEntries = yield ai_model_1.default.find();
                const prevEntriesNames = prevEntries.map(entry => entry.name);
                const uniqueEntries = apiProviders.filter(entry => !prevEntriesNames.includes(entry.name));
                console.log(uniqueEntries);
                const aiSettings = yield ai_model_1.default.insertMany(uniqueEntries);
                return { message: 'AI settings created successfully', data: aiSettings };
            }
            catch (error) {
                console.log(error);
                return { error: error.message };
            }
        });
    }
    static getAiSettings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const aiSettings = yield ai_model_1.default.find();
            res.status(errorCodes_1.HttpStatusCodes.OK).json({ message: 'AI settings fetched successfully', data: aiSettings });
        });
    }
    static updateAiSettings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { apiKey, temperature, maxTokens } = req.body;
            const aiSettings = yield ai_model_1.default.findByIdAndUpdate(id, { apiKey, temperature, maxTokens }, { new: true });
            res.status(errorCodes_1.HttpStatusCodes.OK).json({ message: 'AI settings updated successfully', data: aiSettings });
        });
    }
    static updateManyAiSettings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = req.body;
            const aiSettingsPromise = [];
            for (const item of data) {
                aiSettingsPromise.push(ai_model_1.default.findOneAndUpdate({ _id: item._id }, { apiKey: item.apiKey, model: item.model, temperature: item.temperature, maxTokens: item.maxTokens }, { new: true }));
            }
            const aiSettings = yield Promise.all(aiSettingsPromise);
            res.status(errorCodes_1.HttpStatusCodes.OK).json({ message: 'AI settings updated successfully', data: aiSettings });
        });
    }
}
_a = AiSettingsController;
AiSettingsController.createNewAiEntry = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, models, apiKey, temperature, maxTokens } = req.body;
    const aiSettings = yield ai_model_1.default.create({ name, models, apiKey, temperature, maxTokens });
    res.status(errorCodes_1.HttpStatusCodes.OK).json({ message: 'AI settings created successfully', data: aiSettings });
}));
exports.default = AiSettingsController;
