import dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";
import Prompt, { PromptInterface } from "../models/prompt.model";
import { asyncHandler } from "../utils/asyncHandler";
dotenv.config();

export default class PromptController {
    static createPrompt = asyncHandler(async (req, res) => {
        const data:PromptInterface = req.body;
        const prompt = await Prompt.create(data);
        res.status(HttpStatusCodes.OK).json({ message: 'Prompt created successfully', data: prompt });
    })

    static getAllPrompts = asyncHandler(async (req, res) => {
        const prompts = await Prompt.find();
        res.status(HttpStatusCodes.OK).json({ message: 'Prompts fetched successfully', data: prompts });
    })

    static updatePrompt = asyncHandler(async (req, res) => {
        const prompt = await Prompt.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(HttpStatusCodes.OK).json({ message: 'Prompt updated successfully', data: prompt });
    })

    static deletePrompt = asyncHandler(async (req, res) => {
        await Prompt.findByIdAndDelete(req.params.id);
        res.status(HttpStatusCodes.OK).json({ message: 'Prompt deleted successfully' });
    })
}