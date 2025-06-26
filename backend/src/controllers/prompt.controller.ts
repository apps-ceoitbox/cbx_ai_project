import dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";
import Prompt, { PromptInterface } from "../models/prompt.model";
import { asyncHandler } from "../utils/asyncHandler";
import AiSettings from "../models/ai.model";
import { AI, ApiProvider } from "../utils/AI";
import Submission from "../models/submission.model";
import { MAIL } from "../utils/sendMail";
import axios from "axios";
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
    if(req.user.access == "user") {
      const url = `https://auth.ceoitbox.com/checkauth/AI_TEMPLATE_GENERATOR/${req.user.email}/AI_TEMPLATE_GENERATOR/NA/NA`;

      const response = await axios.get(url);
      const data = response.data;

      const prompts = await Prompt.find({group: { $in: data.sheet_detail.groupNames || [] }}).sort({ createdAt: -1 });
      res
        .status(HttpStatusCodes.OK)
        .json({ message: "Prompts fetched successfully", data: prompts });
    }
    else {
      const prompts = await Prompt.find().sort({ createdAt: -1 });
      res
        .status(HttpStatusCodes.OK)
        .json({ message: "Prompts fetched successfully", data: prompts });
    }
    
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

    const estimatedTokensUsed = estimateTokens(genPrompt, finalText).totalTokens;

    console.log("Estimated Tokens Used:", estimatedTokensUsed);
    
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
      type:req.body?.type || "",
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
            <p>Hi ${req.user?.userName},</p>
            <p>We've prepared your ${prompt?.heading || 'requested'} report. You can view it by clicking the button below.</p>
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
        bcc:[
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
        bcc:[
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

  static generateResponseByAIWithContext = asyncHandler(async (req, res) => {
    const { context, toolId, questions } = req.body;
    const prompt = await Prompt.findOne({ _id: toolId });
    const apiProvider = await AiSettings.findOne({
      name: prompt.defaultAiProvider.name,
    });

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
    await ai.generateResponseWithContext(
      context,
      false,
      true,
      (text) => {
        finalText += text;
        res.write(text);
      }
    );

    // Optionally, save the follow-up in Submission (append to results or similar)
    const submission = await Submission.findOneAndUpdate(
      { toolID: toolId, email: req.user.email },
      {
        $push: {
          results: [
            ...(context ? context.slice(-2) : []), // last user and assistant message
            { role: 'assistant', response: finalText }
          ]
        }
      },
      { new: true, sort: { date: -1 } }
    );

    res.end();
  });

  static enhancePromptWithContext = asyncHandler(async (req, res) => {
    const { initialResponse, userPrompt } = req.body;
    if (!initialResponse || !userPrompt) {
      res.status(400).json({ success: false, message: "Both initialResponse and userPrompt are required." });
      return;
    }

    // Find Gemini AI settings
    const geminiSettings = await AiSettings.findOne({ name: /^Gemini/i });
    if (!geminiSettings) {
      res.status(500).json({ success: false, message: "Gemini AI settings not found." });
      return;
    }

    // Prepare context for Gemini
    const context = [
      { role: "assistant", content: initialResponse },
      { role: "user", content: userPrompt }
    ];

    // Prompt Gemini to enhance the user's prompt based on the previous result
    const enhanceInstruction = `Rewrite the user's follow-up question to be more detailed, clear, and specific, using the context of the previous AI response. Only output the improved version of the user's question, as plain text. Do not include any explanations or formatting, just the improved question.`;
    context.unshift({ role: "system", content: enhanceInstruction });

    try {
      const ai = new AI({
        name: "Gemini (Google)",
        model: geminiSettings.model || "gemini-1.5-flash-latest",
        apiKey: geminiSettings.apiKey,
        temperature: geminiSettings.temperature,
        maxTokens: geminiSettings.maxTokens,
      });
      const enhancedPrompt = await ai.generateResponseWithContext(context, false, false);
      res.status(200).json({ success: true, enhancedPrompt });
    } catch (error) {
      console.error("Error enhancing prompt with Gemini:", error);
      res.status(500).json({ success: false, message: "Failed to enhance prompt.", error: error?.message || error });
    }
  });

  static enhancePrompt = asyncHandler(async (req, res) => {
    const { userPrompt } = req.body;
    if (!userPrompt) {
      res.status(400).send("userPrompt is required.");
      return;
    }

    // Find Gemini AI settings
    const geminiSettings = await AiSettings.findOne({ name: /^Gemini/i });
    if (!geminiSettings) {
      res.status(500).send("Gemini AI settings not found.");
      return;
    }

    // System instruction for Gemini
    const enhanceInstruction = `Rewrite the user's question to be more detailed, clear, and specific. Only output the improved version of the user's question, as plain text. Do not include any explanations or formatting, just the improved question.`;
    const prompt = `${enhanceInstruction}\n\nUser's question:\n${userPrompt}`;

    try {
      const ai = new AI({
        name: "Gemini (Google)",
        model: geminiSettings.model || "gemini-1.5-flash-latest",
        apiKey: geminiSettings.apiKey,
        temperature: geminiSettings.temperature,
        maxTokens: geminiSettings.maxTokens,
      });
      const enhancedPrompt = await ai.generateResponse(prompt, false, false);
      res.status(200).type("text/plain").send(enhancedPrompt);
    } catch (error) {
      console.error("Error enhancing prompt with Gemini:", error);
      res.status(500).type("text/plain").send("Failed to enhance prompt.");
    }
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
  ${promptData?.initialGreetingsMessage}

  User & Company Information:

    User Name: ${user?.userName}
    User Email: ${user?.email}
    ${user?.companyName ? `User Company: ${user?.companyName}` : ""}
    companyWebsite: ${user?.companyWebsite || "N/A"}
    businessDescription: ${promptData?.businessDescription || "N/A"}
    targetCustomer: ${promptData?.targetCustomer || "N/A"}
    businessType: ${promptData?.businessType || "N/A"}
    uniqueSellingPoint: ${promptData?.uniqueSellingPoint || "N/A"}
  
  
  Objective: ${promptData?.objective}
  
  User Responses:
  ${formattedAnswers}
  
  Additional Knowledge Base:
  ${promptData?.knowledgeBase}
  
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
function estimateTokens(prompt, generatedContent = '', options:any = {}) {
  const {
    charsPerToken = 4,
    overhead = 10,
    includeSystemTokens = true
  } = options;

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
