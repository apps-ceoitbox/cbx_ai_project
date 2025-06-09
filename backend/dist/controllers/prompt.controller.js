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
        type: ((_c = req.body) === null || _c === void 0 ? void 0 : _c.type) || ""
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
  ${promptData.initialGreetingsMessage}

  User Name: ${user.userName}
  User Email: ${user.email}
  ${user.companyName ? `User Company: ${user.companyName}` : ""}
  
  Objective: ${promptData.objective}
  
  User Responses:
  ${formattedAnswers}
  
  Additional Knowledge Base:
  ${promptData.knowledgeBase}
  
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
// function generatePrompt(userAnswers, promptData) {
//   const formattedAnswers = Object.entries(userAnswers)
//     .map(
//       ([question, answer]) =>
//         `<div style="margin-bottom: 10px;">
//             <strong style="color: #c0392b; font-weight: bold;">${question}:</strong>
//             <span style="color: #2c3e50;"> ${answer}</span>
//           </div>`
//     )
//     .join("\n");
//   const prompt = `
//   ${promptData.initialGreetingsMessage}
//   Objective: ${promptData.objective}
//   <h3 style="color: #c0392b; font-size: 20px; font-weight: 600; margin-bottom: 10px;">User Responses:</h3>
//   <div style="margin-bottom: 20px;">
//   ${formattedAnswers}
//   </div>
//   <h3 style="color: #c0392b; font-size: 20px; font-weight: 600; margin-bottom: 10px;">Additional Knowledge Base:</h3>
//   <div style="color: #2c3e50; margin-bottom: 20px; font-size: 16px; line-height: 1.6;">${promptData.knowledgeBase}</div>
//   <h3 style="color: #c0392b; font-size: 20px; font-weight: 600; margin-bottom: 10px;">Additional Details:</h3>
//   <div style="color: #2c3e50; margin-bottom: 20px; font-size: 16px; line-height: 1.6;">${promptData.promptTemplate}</div>
//   Based on the information above, generate a clean and modern HTML layout using the following structure and rules:
//   🔧 STRUCTURE:
//   - Wrap everything inside:
//   <div style="background-color: #fff; padding: 24px; color: #2c3e50; font-family: 'Segoe UI', sans-serif; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); font-size: 16px; line-height: 1.6;">
//     ...content...
//   </div>
//   📌 SECTIONS TO INCLUDE:
//   1. <h1 style="color: #c0392b; font-size: 28px; font-weight: bold; margin-bottom: 16px;">${promptData.heading}</h1>
//   2. Use multiple <section style="margin-bottom: 30px;"> elements with:
//      - <h2 style="color: #c0392b; font-size: 22px; font-weight: 600; margin-bottom: 12px;">Section Title</h2>
//      - <p style="font-size: 16px; color: #2c3e50; margin-bottom: 12px;">Insight or supporting explanation</p>
//      - <ul style="padding-left: 20px; margin-bottom: 16px;">
//          <li style="margin-bottom: 6px;">Bullet item</li>
//        </ul>
//      - <ol style="padding-left: 20px; margin-bottom: 16px;">
//          <li style="margin-bottom: 6px;">Ordered item</li>
//        </ol>
//      - <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
//          <thead>
//            <tr>
//              <th style="border: 1px solid #ddd; padding: 8px; background: #fef4f3; color: #c0392b;">Header</th>
//            </tr>
//          </thead>
//          <tbody>
//            <tr style="background-color: #f9f9f9;">
//              <td style="border: 1px solid #ddd; padding: 8px;">Cell</td>
//            </tr>
//            <tr style="background-color: #fff;">
//              <td style="border: 1px solid #ddd; padding: 8px;">Cell</td>
//            </tr>
//          </tbody>
//        </table>
//      - <div class="chart" style="border: 2px dashed #c0392b; padding: 20px; background: #fef4f3; border-radius: 6px; color: #c0392b; text-align: center; margin-bottom: 20px;">
//          Chart Placeholder: [Title or Label]
//        </div>
//      - Charts should be generated using Svg.
//   💡 STYLE RULES:
//   - All text should use #2c3e50
//   - Accent color is #c0392b (red)
//   - Font: 'Segoe UI', sans-serif
//   - Add spacing (20px+), clean font sizes, and soft box shadows
//   - Table rows should alternate background colors (#f9f9f9, #fff)
//   🚫 DO NOT include:
//   - Markdown
//   - JavaScript
//   - External styles
//   - Comments
//   🎯 GOAL:
//   - Final HTML should look clean, readable, modern, and styled with inline CSS only.
//   - Include a graph/chart as a chart using Svg, where needed.
//   - Make sure that the html you generate is long and detailed.
//   - Content must begin with the <div> container as mentioned.
//   `;
//   return prompt;
// }
