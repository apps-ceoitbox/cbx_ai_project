import dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";
import Prompt, { PromptInterface } from "../models/prompt.model";
import { asyncHandler } from "../utils/asyncHandler";
import AiSettings from "../models/ai.model";
import { AI, ApiProvider } from "../utils/AI";
import Submission from "../models/submission.model";
import { MAIL } from "../utils/sendMail";
dotenv.config();

export default class PromptController {
  static createPrompt = asyncHandler(async (req, res) => {
    const data: PromptInterface = req.body;
    const prompt = await Prompt.create(data);
    res
      .status(HttpStatusCodes.OK)
      .json({ message: "Prompt created successfully", data: prompt });
  });

  static duplicatePrompt = asyncHandler(async (req, res) => {
    const prompt = await Prompt.findOne({ _id: req.body.promptId }).lean();
    const newPrompt = await Prompt.create({
      ...prompt,
      heading: `Copy of ${prompt.heading}`,
      _id: undefined,
    });

    res
      .status(HttpStatusCodes.OK)
      .json({ message: "Prompt duplicated successfully", data: newPrompt });
  });

  static toggleVisibility = asyncHandler(async (req, res) => {
    const prompt = await Prompt.findById(req.params.id);
    prompt.visibility = !prompt.visibility;
    await prompt.save();
    res
      .status(HttpStatusCodes.OK)
      .json({ message: "Prompt visibility toggled successfully", data: prompt });
  });

  static getAllPrompts = asyncHandler(async (req, res) => {
    const prompts = await Prompt.find().sort({ createdAt: -1 });
    res
      .status(HttpStatusCodes.OK)
      .json({ message: "Prompts fetched successfully", data: prompts });
  });

  static getPromptById = asyncHandler(async (req, res) => {
    const prompt = await Prompt.findById(req.params.id);
    res
      .status(HttpStatusCodes.OK)
      .json({ message: "Prompt fetched successfully", data: prompt });
  });

  static updatePrompt = asyncHandler(async (req, res) => {
    const prompt = await Prompt.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res
      .status(HttpStatusCodes.OK)
      .json({ message: "Prompt updated successfully", data: prompt });
  });

  static deletePrompt = asyncHandler(async (req, res) => {
    await Prompt.findByIdAndDelete(req.params.id);
    res
      .status(HttpStatusCodes.OK)
      .json({ message: "Prompt deleted successfully" });
  });

  static getPromptByToolId = asyncHandler(async (req, res) => {
    const prompts = await Prompt.find({ toolId: req.params.toolId });
    res
      .status(HttpStatusCodes.OK)
      .json({ message: "Prompts fetched successfully", data: prompts });
  });

  static generateResponseByAI = asyncHandler(async (req, res) => {
    const questions: Record<string, string> = req.body.questions;
    const prompt = await Prompt.findOne({ _id: req.body.toolId });
    const apiProvider = await AiSettings.findOne({
      name: prompt.defaultAiProvider.name,
    });

    const genPrompt = generatePrompt(questions, prompt, req?.user, req?.body?.type);
    // console.log(genPrompt, req.body.type)
    const ai = new AI({
      name: apiProvider?.name as ApiProvider["name"],
      model: prompt.defaultAiProvider.model,
      apiKey: apiProvider.apiKey,
      temperature: apiProvider.temperature,
      maxTokens: apiProvider.maxTokens,
    });


    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    let finalText = "";
    const response = await ai.generateResponse(genPrompt, false, true, (text) => {
      finalText += text;
      res.write(text);
    });
    
    const submission = await Submission.create({
      name: req.user.userName,
      email: req.user.email,
      company: req.user.companyName,
      category: prompt.category,
      tool: prompt.heading,
      toolID: prompt?._id,
      date: new Date(),
      apiUsed: apiProvider.name,
      questionsAndAnswers: questions,
      generatedContent: finalText,
      type:req.body?.type || ""
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
            <p>Hi ${req.user?.userName},</p>
            <p>We’ve prepared your ${prompt?.heading || 'requested'} report. You can view it by clicking the button below.</p>
            <div class="btn-container">
              <a href="https://ai.ceoitbox.com/view/${submission?._id}" target="_blank" class="view-button" style="color: #ffffff">
                View Your Report
              </a>
            </div>
          </div>
        
        </body>
      </html>
    `;

    if(req.body?.type == "internal") {
      MAIL({
        to: "sjain@ceoitbox.in",
        subject: `Internal | ${prompt.heading}`,
        body: fullHTML,
        cc:[
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
      })
    }
    else if(req.body?.type == "client") {
      MAIL({
        to: req.user.email,
        subject: `${prompt.heading}`,
        body: fullHTML,
        cc:[
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
      })
    }

    res.write(`{ID}-${submission._id}`);

    res.end();
    // res
    //   .status(HttpStatusCodes.OK)
    //   .json({ message: "Response generated successfully", data: response });
  });
}

function generatePrompt(userAnswers, promptData, user:any={}, type="") {
  let tempPromptData = promptData.promptTemplate || "";
  if(type) {
    let temp = tempPromptData.split("CLIENT_PROMPT");
    tempPromptData = type == "internal" ? temp[0] : temp[1]
  }
  const formattedAnswers = Object.entries(userAnswers)
    .map(
      ([question, answer]) =>
        `Question: ${question}
         Answer: ${answer}
        `
    )
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
  return prompt;
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
