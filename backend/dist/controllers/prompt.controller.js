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
    res
        .status(errorCodes_1.HttpStatusCodes.OK)
        .json({ message: "Prompt created successfully", data: prompt });
}));
PromptController.getAllPrompts = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prompts = yield prompt_model_1.default.find().sort({ createdAt: -1 });
    res
        .status(errorCodes_1.HttpStatusCodes.OK)
        .json({ message: "Prompts fetched successfully", data: prompts });
}));
PromptController.getPromptById = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = yield prompt_model_1.default.findById(req.params.id);
    res
        .status(errorCodes_1.HttpStatusCodes.OK)
        .json({ message: "Prompt fetched successfully", data: prompt });
}));
PromptController.updatePrompt = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = yield prompt_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });
    res
        .status(errorCodes_1.HttpStatusCodes.OK)
        .json({ message: "Prompt updated successfully", data: prompt });
}));
PromptController.deletePrompt = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield prompt_model_1.default.findByIdAndDelete(req.params.id);
    res
        .status(errorCodes_1.HttpStatusCodes.OK)
        .json({ message: "Prompt deleted successfully" });
}));
PromptController.getPromptByToolId = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prompts = yield prompt_model_1.default.find({ toolId: req.params.toolId });
    res
        .status(errorCodes_1.HttpStatusCodes.OK)
        .json({ message: "Prompts fetched successfully", data: prompts });
}));
PromptController.generateResponseByAI = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const questions = req.body.questions;
    const prompt = yield prompt_model_1.default.findOne({ _id: req.body.toolId });
    const apiProvider = yield ai_model_1.default.findOne({
        name: prompt.defaultAiProvider.name,
    });
    const genPrompt = generatePrompt(questions, prompt);
    const ai = new AI_1.AI({
        name: apiProvider === null || apiProvider === void 0 ? void 0 : apiProvider.name,
        model: prompt.defaultAiProvider.model,
        apiKey: apiProvider.apiKey,
        temperature: apiProvider.temperature,
        maxTokens: apiProvider.maxTokens,
    });
    const response = yield ai.generateResponse(genPrompt);
    submission_model_1.default.create({
        name: req.user.userName,
        email: req.user.email,
        company: req.user.companyName,
        category: prompt.category,
        tool: prompt.heading,
        date: new Date(),
        apiUsed: apiProvider.name,
        questionsAndAnswers: questions,
        generatedContent: response,
    });
    res
        .status(errorCodes_1.HttpStatusCodes.OK)
        .json({ message: "Response generated successfully", data: response });
}));
exports.default = PromptController;
// function generatePrompt(userAnswers, promptData) {
//     const formattedAnswers = Object.entries(userAnswers)
//         .map(
//             ([question, answer]) =>
//                 `<div style="margin-bottom: 10px;">
//                     <strong style="color: #c0392b;">${question}:</strong>
//                     <span style="color: #2c3e50;"> ${answer}</span>
//                 </div>`
//         )
//         .join("\n");
//     const prompt = `
// ${promptData.initialGreetingsMessage}
// Objective: ${promptData.objective}
// <h3 style="color: #c0392b;">User Responses:</h3>
// <div style="margin-bottom: 20px;">
// ${formattedAnswers}
// </div>
// <h3 style="color: #c0392b;">Additional Knowledge Base:</h3>
// <div style="color: #2c3e50; margin-bottom: 20px;">${promptData.knowledgeBase}</div>
// <h3 style="color: #c0392b;">Additional Details:</h3>
// <div style="color: #2c3e50; margin-bottom: 20px;">${promptData.promptTemplate}</div>
// Based on the information above, generate a clean and modern HTML layout with the following structure and rules:
// 🔧 STRUCTURE:
// - Return a complete HTML block wrapped inside:  
//   \`<div style="background-color: #fff; padding: 24px; color: #2c3e50; font-family: 'Segoe UI', sans-serif; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">...</div>\`
// 📌 SECTIONS TO INCLUDE:
// 1. <h1>Title:</h1>  
//    Use the provided title: "${promptData.heading}" with red color (#c0392b)
// 2. Use multiple <section> elements with:
//    - <h2 style="color: #c0392b;">Section Title</h2>
//    - <p> blocks with insights, explanations, and supporting text
//    - <ul> or <ol> for bullet points
//    - <table> (with inline styles: border, padding, zebra striping) for structured data
//    - <div class="chart"> as placeholders for visualizations
// 3. Use this for charts:
// \`
// <div class="chart" style="border: 2px dashed #c0392b; padding: 20px; background: #fef4f3; border-radius: 6px; color: #c0392b; text-align: center; margin-bottom: 20px;">
//   Chart Placeholder: [Title or Label]
// </div>
// \`
// 💡 STYLE GUIDELINES:
// - Use light background (#fff), dark text (#2c3e50), red accent (#c0392b)
// - Add border-radius, spacing (20px+), clean fonts, and soft box-shadow
// - Tables should be readable, styled with alternating row colors (#f9f9f9, #fff)
// 🚫 RESTRICTIONS:
// - DO NOT include comments, markdown, or explanations
// - Return only valid, beautiful HTML content
// - The content should start with the <div> container
// 🎯 GOAL:
// - Output should look like a rich, formatted ChatGPT response with clearly separated sections, tables, lists, and chart blocks in a light-red theme.
//     `;
//     return prompt;
// }
function generatePrompt(userAnswers, promptData) {
    const formattedAnswers = Object.entries(userAnswers)
        .map(([question, answer]) => `<div style="margin-bottom: 10px;">
            <strong style="color: #c0392b; font-weight: bold;">${question}:</strong>
            <span style="color: #2c3e50;"> ${answer}</span>
          </div>`)
        .join("\n");
    const prompt = `
  ${promptData.initialGreetingsMessage}
  
  Objective: ${promptData.objective}
  
  <h3 style="color: #c0392b; font-size: 20px; font-weight: 600; margin-bottom: 10px;">User Responses:</h3>
  <div style="margin-bottom: 20px;">
  ${formattedAnswers}
  </div>
  
  <h3 style="color: #c0392b; font-size: 20px; font-weight: 600; margin-bottom: 10px;">Additional Knowledge Base:</h3>
  <div style="color: #2c3e50; margin-bottom: 20px; font-size: 16px; line-height: 1.6;">${promptData.knowledgeBase}</div>
  
  <h3 style="color: #c0392b; font-size: 20px; font-weight: 600; margin-bottom: 10px;">Additional Details:</h3>
  <div style="color: #2c3e50; margin-bottom: 20px; font-size: 16px; line-height: 1.6;">${promptData.promptTemplate}</div>
  
  Based on the information above, generate a clean and modern HTML layout using the following structure and rules:
  
  🔧 STRUCTURE:
  - Wrap everything inside:
  <div style="background-color: #fff; padding: 24px; color: #2c3e50; font-family: 'Segoe UI', sans-serif; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); font-size: 16px; line-height: 1.6;">
    ...content...
  </div>
  
  📌 SECTIONS TO INCLUDE:
  1. <h1 style="color: #c0392b; font-size: 28px; font-weight: bold; margin-bottom: 16px;">${promptData.heading}</h1>
  
  2. Use multiple <section style="margin-bottom: 30px;"> elements with:
     - <h2 style="color: #c0392b; font-size: 22px; font-weight: 600; margin-bottom: 12px;">Section Title</h2>
     - <p style="font-size: 16px; color: #2c3e50; margin-bottom: 12px;">Insight or supporting explanation</p>
     - <ul style="padding-left: 20px; margin-bottom: 16px;">
         <li style="margin-bottom: 6px;">Bullet item</li>
       </ul>
     - <ol style="padding-left: 20px; margin-bottom: 16px;">
         <li style="margin-bottom: 6px;">Ordered item</li>
       </ol>
     - <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
         <thead>
           <tr>
             <th style="border: 1px solid #ddd; padding: 8px; background: #fef4f3; color: #c0392b;">Header</th>
           </tr>
         </thead>
         <tbody>
           <tr style="background-color: #f9f9f9;">
             <td style="border: 1px solid #ddd; padding: 8px;">Cell</td>
           </tr>
           <tr style="background-color: #fff;">
             <td style="border: 1px solid #ddd; padding: 8px;">Cell</td>
           </tr>
         </tbody>
       </table>
     - <div class="chart" style="border: 2px dashed #c0392b; padding: 20px; background: #fef4f3; border-radius: 6px; color: #c0392b; text-align: center; margin-bottom: 20px;">
         Chart Placeholder: [Title or Label]
       </div>
  
  💡 STYLE RULES:
  - All text should use #2c3e50
  - Accent color is #c0392b (red)
  - Font: 'Segoe UI', sans-serif
  - Add spacing (20px+), clean font sizes, and soft box shadows
  - Table rows should alternate background colors (#f9f9f9, #fff)
  
  🚫 DO NOT include:
  - Markdown
  - JavaScript
  - External styles
  - Comments
  
  🎯 GOAL:
  - Final HTML should look clean, readable, modern, and styled with inline CSS only.
  - Content must begin with the <div> container as mentioned.
  `;
    return prompt;
}
