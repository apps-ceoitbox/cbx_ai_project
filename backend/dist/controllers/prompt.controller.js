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
const prompt_model_1 = __importDefault(require("../models/prompt.model"));
const asyncHandler_1 = require("../utils/asyncHandler");
const ai_model_1 = __importDefault(require("../models/ai.model"));
const AI_1 = require("../utils/AI");
const submission_model_1 = __importDefault(require("../models/submission.model"));
dotenv_1.default.config();
class PromptController {
}
_a = PromptController;
PromptController.createPrompt = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const prompt = yield prompt_model_1.default.create(data);
    res.status(errorCodes_1.HttpStatusCodes.OK).json({ message: 'Prompt created successfully', data: prompt });
}));
PromptController.getAllPrompts = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prompts = yield prompt_model_1.default.find().sort({ createdAt: -1 });
    res.status(errorCodes_1.HttpStatusCodes.OK).json({ message: 'Prompts fetched successfully', data: prompts });
}));
PromptController.getPromptById = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = yield prompt_model_1.default.findById(req.params.id);
    res.status(errorCodes_1.HttpStatusCodes.OK).json({ message: 'Prompt fetched successfully', data: prompt });
}));
PromptController.updatePrompt = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = yield prompt_model_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(errorCodes_1.HttpStatusCodes.OK).json({ message: 'Prompt updated successfully', data: prompt });
}));
PromptController.deletePrompt = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield prompt_model_1.default.findByIdAndDelete(req.params.id);
    res.status(errorCodes_1.HttpStatusCodes.OK).json({ message: 'Prompt deleted successfully' });
}));
PromptController.getPromptByToolId = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prompts = yield prompt_model_1.default.find({ toolId: req.params.toolId });
    res.status(errorCodes_1.HttpStatusCodes.OK).json({ message: 'Prompts fetched successfully', data: prompts });
}));
PromptController.generateResponseByAI = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const questions = req.body.questions;
    const prompt = yield prompt_model_1.default.findOne({ _id: req.body.toolId });
    const apiProvider = yield ai_model_1.default.findOne({ name: prompt.defaultAiProvider.name });
    const genPrompt = generatePrompt(questions, prompt);
    const ai = new AI_1.AI({
        name: apiProvider === null || apiProvider === void 0 ? void 0 : apiProvider.name,
        model: prompt.defaultAiProvider.model,
        apiKey: apiProvider.apiKey,
        temperature: apiProvider.temperature,
        maxTokens: apiProvider.maxTokens
    });
    const response = yield ai.generateResponse(genPrompt);
    submission_model_1.default.create({
        name: req.user.userName,
        email: req.user.email,
        company: req.user.companyName,
        tool: prompt.heading,
        date: new Date(),
        apiUsed: apiProvider.name,
        questionsAndAnswers: questions,
        generatedContent: response,
    });
    res.status(errorCodes_1.HttpStatusCodes.OK).json({ message: 'Response generated successfully', data: response });
}));
exports.default = PromptController;
function generatePrompt(userAnswers, promptData) {
    // Step 1: Format user answers
    let formattedAnswers = Object.entries(userAnswers)
        .map(([question, answer]) => `${question}: ${answer}`)
        .join("\n");
    // Step 2: Construct the AI prompt
    const prompt = `
        ${promptData.initialGreetingsMessage}

        Objective: ${promptData.objective}

        User Responses:
        ${formattedAnswers}

        Additional Knowledge Base:
        ${promptData.knowledgeBase}

        Additional Details :
        ${promptData.promptTemplate}

        Based on the above information, generate a structured JSON response with multiple sections, following this format:
        Do not include any other text or comments in your response.

        {
          "title": "${promptData.heading}",
          "sections": [
            {
              "title": "<Section Title 1>",
              "content": "<Detailed content based on user responses and the knowledge base>"
            },
            {
              "title": "<Section Title 2>",
              "content": "<Another detailed content>"
            },
            ...
          ]
        }

        The number of sections should be relevant to the user responses and knowledge base. Ensure the response is valid JSON.
    `;
    return prompt;
}
