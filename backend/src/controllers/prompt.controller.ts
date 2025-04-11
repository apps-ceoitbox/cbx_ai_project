import dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";
import Prompt, { PromptInterface } from "../models/prompt.model";
import { asyncHandler } from "../utils/asyncHandler";
import AiSettings from "../models/ai.model";
import { AI, ApiProvider } from "../utils/AI";
dotenv.config();

export default class PromptController {
    static createPrompt = asyncHandler(async (req, res) => {
        const data: PromptInterface = req.body;
        const prompt = await Prompt.create(data);
        res.status(HttpStatusCodes.OK).json({ message: 'Prompt created successfully', data: prompt });
    })

    static getAllPrompts = asyncHandler(async (req, res) => {
        const prompts = await Prompt.find();
        res.status(HttpStatusCodes.OK).json({ message: 'Prompts fetched successfully', data: prompts });
    })

    static getPromptById = asyncHandler(async (req, res) => {
        const prompt = await Prompt.findById(req.params.id);
        res.status(HttpStatusCodes.OK).json({ message: 'Prompt fetched successfully', data: prompt });
    })

    static updatePrompt = asyncHandler(async (req, res) => {
        const prompt = await Prompt.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(HttpStatusCodes.OK).json({ message: 'Prompt updated successfully', data: prompt });
    })

    static deletePrompt = asyncHandler(async (req, res) => {
        await Prompt.findByIdAndDelete(req.params.id);
        res.status(HttpStatusCodes.OK).json({ message: 'Prompt deleted successfully' });
    })

    static getPromptByToolId = asyncHandler(async (req, res) => {
        const prompts = await Prompt.find({ toolId: req.params.toolId });
        res.status(HttpStatusCodes.OK).json({ message: 'Prompts fetched successfully', data: prompts });
    })

    static generateResponseByAI = asyncHandler(async (req, res) => {
        const questions: Record<string, string> = req.body.questions;
        const prompt = await Prompt.findOne({ _id: req.body.toolId });
        const apiProvider = await AiSettings.findOne({ name: prompt.defaultAiProvider.name });

        const ai = new AI({
            name: apiProvider.name as ApiProvider["name"],
            model: prompt.defaultAiProvider.model,
            apiKey: apiProvider.apiKey,
            temperature: apiProvider.temperature,
            maxTokens: apiProvider.maxTokens
        });
        const response = await ai.generateResponse("hi how are you");



    })
}