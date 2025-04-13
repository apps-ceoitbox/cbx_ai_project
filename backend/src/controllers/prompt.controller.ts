import dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";
import Prompt, { PromptInterface } from "../models/prompt.model";
import { asyncHandler } from "../utils/asyncHandler";
import AiSettings from "../models/ai.model";
import { AI, ApiProvider } from "../utils/AI";
import Submission from "../models/submission.model";
dotenv.config();

export default class PromptController {
    static createPrompt = asyncHandler(async (req, res) => {
        const data: PromptInterface = req.body;
        const prompt = await Prompt.create(data);
        res.status(HttpStatusCodes.OK).json({ message: 'Prompt created successfully', data: prompt });
    })

    static getAllPrompts = asyncHandler(async (req, res) => {
        const prompts = await Prompt.find().sort({ createdAt: -1 });
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


        const genPrompt = generatePrompt(questions, prompt);

        const ai = new AI({
            name: apiProvider?.name as ApiProvider["name"],
            model: prompt.defaultAiProvider.model,
            apiKey: apiProvider.apiKey,
            temperature: apiProvider.temperature,
            maxTokens: apiProvider.maxTokens
        });


        const response = await ai.generateResponse(genPrompt);

        Submission.create({
            name: req.user.userName,
            email: req.user.email,
            company: req.user.companyName,
            tool: prompt.heading,
            date: new Date(),
            apiUsed: apiProvider.name,
            questionsAndAnswers: questions,
            generatedContent: response,
        });

        res.status(HttpStatusCodes.OK).json({ message: 'Response generated successfully', data: response });

    })
}


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
