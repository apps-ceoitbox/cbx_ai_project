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
const sendMail_1 = require("../utils/sendMail");
const axios_1 = __importDefault(require("axios"));
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
PromptController.duplicatePrompt = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = yield prompt_model_1.default.findOne({ _id: req.body.promptId }).lean();
    const newPrompt = yield prompt_model_1.default.create(Object.assign(Object.assign({}, prompt), { heading: `Copy of ${prompt.heading}`, _id: undefined }));
    res
        .status(errorCodes_1.HttpStatusCodes.OK)
        .json({ message: "Prompt duplicated successfully", data: newPrompt });
}));
PromptController.toggleVisibility = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = yield prompt_model_1.default.findById(req.params.id);
    prompt.visibility = !prompt.visibility;
    yield prompt.save();
    res
        .status(errorCodes_1.HttpStatusCodes.OK)
        .json({ message: "Prompt visibility toggled successfully", data: prompt });
}));
PromptController.getAllPrompts = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user.access == "user") {
        const url = `https://auth.ceoitbox.com/checkauth/AI_TEMPLATE_GENERATOR/${req.user.email}/AI_TEMPLATE_GENERATOR/NA/NA`;
        const response = yield axios_1.default.get(url);
        const data = response.data;
        const prompts = yield prompt_model_1.default.find({ group: { $in: data.sheet_detail.groupNames || [] } }).sort({ createdAt: -1 });
        res
            .status(errorCodes_1.HttpStatusCodes.OK)
            .json({ message: "Prompts fetched successfully", data: prompts });
    }
    else {
        const prompts = yield prompt_model_1.default.find().sort({ createdAt: -1 });
        res
            .status(errorCodes_1.HttpStatusCodes.OK)
            .json({ message: "Prompts fetched successfully", data: prompts });
    }
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
    var _b, _c, _d, _e, _f;
    const questions = req.body.questions;
    const prompt = yield prompt_model_1.default.findOne({ _id: req.body.toolId });
    const apiProvider = yield ai_model_1.default.findOne({
        name: prompt.defaultAiProvider.name,
    });
    const genPrompt = generatePrompt(questions, prompt, req === null || req === void 0 ? void 0 : req.user, (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.type);
    // console.log(genPrompt, req.body.type)
    const ai = new AI_1.AI({
        name: apiProvider === null || apiProvider === void 0 ? void 0 : apiProvider.name,
        model: prompt.defaultAiProvider.model,
        apiKey: apiProvider.apiKey,
        temperature: apiProvider.temperature,
        maxTokens: apiProvider.maxTokens,
    });
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    let finalText = "";
    const response = yield ai.generateResponse(genPrompt, false, true, (text) => {
        finalText += text;
        res.write(text);
    });
    const estimatedTokensUsed = estimateTokens(genPrompt, finalText).totalTokens;
    console.log("Estimated Tokens Used:", estimatedTokensUsed);
    const submission = yield submission_model_1.default.create({
        name: req.user.userName,
        email: req.user.email,
        company: req.user.companyName,
        category: prompt.category,
        tool: prompt.heading,
        toolID: prompt === null || prompt === void 0 ? void 0 : prompt._id,
        date: new Date(),
        apiUsed: apiProvider.name,
        questionsAndAnswers: questions,
        generatedContent: finalText,
        type: ((_c = req.body) === null || _c === void 0 ? void 0 : _c.type) || "",
        tokensUsed: estimatedTokensUsed,
    });
    const fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
              font-family: 'Segoe UI', sans-serif;
              color: #333;
            }
            .email-container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border: 1px solid #e0e0e0;
              border-radius: 10px;
              padding: 32px;
            }
            h1 {
              color: #d32f2f;
              font-size: 24px;
              margin-bottom: 16px;
            }
            p {
              font-size: 16px;
              line-height: 1.6;
            }
            .btn-container {
              margin-top: 32px;
              text-align: center;
            }
            .view-button {
              background-color: #d32f2f;
              color: #ffffff;
              text-decoration: none;
              padding: 14px 26px;
              border-radius: 6px;
              font-weight: bold;
              font-size: 16px;
              display: inline-block;
            }
            .view-button:hover {
              background-color: #b71c1c;
            }
        
          </style>
        </head>
        <body>
          <div class="email-container">
            <h1>Your Report is Ready</h1>
            <p>Hi ${(_d = req.user) === null || _d === void 0 ? void 0 : _d.userName},</p>
            <p>We’ve prepared your ${(prompt === null || prompt === void 0 ? void 0 : prompt.heading) || 'requested'} report. You can view it by clicking the button below.</p>
            <div class="btn-container">
              <a href="https://ai.ceoitbox.com/view/${submission === null || submission === void 0 ? void 0 : submission._id}" target="_blank" class="view-button" style="color: #ffffff">
                View Your Report
              </a>
            </div>
          </div>
        
        </body>
      </html>
    `;
    if (((_e = req.body) === null || _e === void 0 ? void 0 : _e.type) == "internal") {
        (0, sendMail_1.MAIL)({
            to: "sjain@ceoitbox.in",
            subject: `Internal | ${prompt.heading}`,
            body: fullHTML,
            bcc: [
                "sjain@ceoitbox.in",
                "anurag@ceoitbox.in",
                "avishek@ceoitbox.in",
                "jeetu@ceoitbox.in",
                "kuldeep@ceoitbox.in",
                "siddharth@ceoitbox.in",
                "sujit@ceoitbox.in",
                "tejwai@ceoitbox.in",
                "vinayak@ceoitbox.in",
                "raghbir@ceoitbox.in"
            ]
        });
    }
    else if (((_f = req.body) === null || _f === void 0 ? void 0 : _f.type) == "client") {
        (0, sendMail_1.MAIL)({
            to: req.user.email,
            subject: `${prompt.heading}`,
            body: fullHTML,
            bcc: [
                "sjain@ceoitbox.in",
                "anurag@ceoitbox.in",
                "avishek@ceoitbox.in",
                "jeetu@ceoitbox.in",
                "kuldeep@ceoitbox.in",
                "siddharth@ceoitbox.in",
                "sujit@ceoitbox.in",
                "tejwai@ceoitbox.in",
                "vinayak@ceoitbox.in",
                "raghbir@ceoitbox.in"
            ]
        });
    }
    res.write(`{ID}-${submission._id}`);
    res.end();
    // res
    //   .status(HttpStatusCodes.OK)
    //   .json({ message: "Response generated successfully", data: response });
}));
exports.default = PromptController;
function generatePrompt(userAnswers, promptData, user = {}, type = "") {
    let tempPromptData = promptData.promptTemplate || "";
    if (type) {
        let temp = tempPromptData.split("CLIENT_PROMPT");
        tempPromptData = type == "internal" ? temp[0] : temp[1];
    }
    const formattedAnswers = Object.entries(userAnswers)
        .map(([question, answer]) => `Question: ${question}
         Answer: ${answer}
        `)
        .join("\n");
    const prompt = `
  ${promptData === null || promptData === void 0 ? void 0 : promptData.initialGreetingsMessage}

  User & Company Information:

    User Name: ${user === null || user === void 0 ? void 0 : user.userName}
    User Email: ${user === null || user === void 0 ? void 0 : user.email}
    ${(user === null || user === void 0 ? void 0 : user.companyName) ? `User Company: ${user === null || user === void 0 ? void 0 : user.companyName}` : ""}
    companyWebsite: ${(user === null || user === void 0 ? void 0 : user.companyWebsite) || "N/A"}
    businessDescription: ${(promptData === null || promptData === void 0 ? void 0 : promptData.businessDescription) || "N/A"}
    targetCustomer: ${(promptData === null || promptData === void 0 ? void 0 : promptData.targetCustomer) || "N/A"}
    businessType: ${(promptData === null || promptData === void 0 ? void 0 : promptData.businessType) || "N/A"}
    uniqueSellingPoint: ${(promptData === null || promptData === void 0 ? void 0 : promptData.uniqueSellingPoint) || "N/A"}
  
  
  Objective: ${promptData === null || promptData === void 0 ? void 0 : promptData.objective}
  
  User Responses:
  ${formattedAnswers}
  
  Additional Knowledge Base:
  ${promptData === null || promptData === void 0 ? void 0 : promptData.knowledgeBase}
  
  Additional Details:
  ${tempPromptData}
  
  Based on the information above, generate a clean and modern HTML layout using the following structure and rules:
  
  🔧 STRUCTURE:
  - Wrap everything inside:
  <div style="background-color: #fff; padding: 24px; color: #2c3e50; font-family: 'Segoe UI', sans-serif; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); font-size: 16px; line-height: 1.6;">
    ...content...
  </div>
  
  💡 STYLE RULES:
  - All text should use #2c3e50
  - Accent color is #c0392b (red)
  - Font: 'Segoe UI', sans-serif
  - Add spacing (20px+), clean font sizes, and soft box shadows
  - Table rows should alternate background colors (#f9f9f9, #fff)
  - Any HTML tag used (like h1, p, table, etc.) must have its CSS explicitly defined inline, including font size, font weight, colors, padding, margins, etc. — do not rely on browser defaults.

  🚫 DO NOT include:
  - Markdown
  - JavaScript
  - External styles
  - Comments
  
  🎯 GOAL:
  - Final HTML should look clean, readable, modern, and styled with inline CSS only.
  - Include a graph/chart as a chart using Svg, where needed.
  - There charts should not have extra white space around them.
  - Make sure the charts should always take 100% width, not more than that.
  - Make sure that the html you generate is long and detailed.
  - Content must begin with the <div> container as mentioned.
  `;
    // - If the chart is generated, make sure to give it scroll auto if it is too long.
    return prompt;
}
/**
 * Estimates the number of tokens that will be used for AI API calls
 * @param {string} prompt - The input prompt text
 * @param {string} generatedContent - The generated/expected output content
 * @param {Object} options - Configuration options
 * @param {number} options.charsPerToken - Average characters per token (default: 4)
 * @param {number} options.overhead - Additional tokens for API overhead (default: 10)
 * @param {boolean} options.includeSystemTokens - Whether to include system message overhead (default: true)
 * @returns {Object} Token usage breakdown
 */
function estimateTokens(prompt, generatedContent = '', options = {}) {
    const { charsPerToken = 4, overhead = 10, includeSystemTokens = true } = options;
    // Calculate input tokens (prompt)
    const inputTokens = Math.ceil(prompt.length / charsPerToken);
    // Calculate output tokens (generated content)
    const outputTokens = Math.ceil(generatedContent.length / charsPerToken);
    // System tokens (typical overhead for API calls)
    const systemTokens = includeSystemTokens ? 20 : 0;
    // Additional overhead for formatting, special tokens, etc.
    const overheadTokens = overhead;
    // Total tokens
    const totalTokens = inputTokens + outputTokens + systemTokens + overheadTokens;
    return {
        inputTokens,
        outputTokens,
        systemTokens,
        overheadTokens,
        totalTokens,
        breakdown: {
            prompt: inputTokens,
            generated: outputTokens,
            system: systemTokens,
            overhead: overheadTokens
        }
    };
}
/**
 * More accurate token estimation using word-based calculation
 * @param {string} prompt - The input prompt text
 * @param {string} generatedContent - The generated/expected output content
 * @param {Object} options - Configuration options
 * @returns {Object} Token usage breakdown
 */
// function estimateTokensWordBased(prompt, generatedContent = '', options:any = {}) {
//   const {
//     wordsPerToken = 0.75,
//     overhead = 10,
//     includeSystemTokens = true
//   } = options;
//   // Count words (more accurate for English text)
//   const countWords = (text) => {
//     return text.trim().split(/\s+/).filter(word => word.length > 0).length;
//   };
//   const promptWords = countWords(prompt);
//   const generatedWords = countWords(generatedContent);
//   // Calculate tokens based on word count
//   const inputTokens = Math.ceil(promptWords / wordsPerToken);
//   const outputTokens = Math.ceil(generatedWords / wordsPerToken);
//   // System and overhead tokens
//   const systemTokens = includeSystemTokens ? 20 : 0;
//   const overheadTokens = overhead;
//   const totalTokens = inputTokens + outputTokens + systemTokens + overheadTokens;
//   return {
//     inputTokens,
//     outputTokens,
//     systemTokens,
//     overheadTokens,
//     totalTokens,
//     breakdown: {
//       prompt: inputTokens,
//       generated: outputTokens,
//       system: systemTokens,
//       overhead: overheadTokens
//     },
//     wordCount: {
//       prompt: promptWords,
//       generated: generatedWords
//     }
//   };
// }
/**
 * Estimate cost based on token usage
 * @param {number} inputTokens - Number of input tokens
 * @param {number} outputTokens - Number of output tokens
 * @param {Object} pricing - Pricing configuration
 * @returns {Object} Cost breakdown
 */
// function estimateCost(inputTokens, outputTokens, pricing:any = {}) {
//   const {
//     inputCostPer1000 = 0.01,  // Default: $0.01 per 1000 input tokens
//     outputCostPer1000 = 0.03  // Default: $0.03 per 1000 output tokens
//   } = pricing;
//   const inputCost = (inputTokens / 1000) * inputCostPer1000;
//   const outputCost = (outputTokens / 1000) * outputCostPer1000;
//   const totalCost = inputCost + outputCost;
//   return {
//     inputCost: Number(inputCost.toFixed(6)),
//     outputCost: Number(outputCost.toFixed(6)),
//     totalCost: Number(totalCost.toFixed(6)),
//     currency: 'USD'
//   };
// }
