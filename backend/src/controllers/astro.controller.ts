import dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";
import { asyncHandler } from "../utils/asyncHandler";
import AiSettings from "../models/ai.model";
import { AI, ApiProvider } from "../utils/AI";
import AstroSettings, { AstroSettingsInterface } from "../models/astroSettings.model";
dotenv.config();

export default class AstroController {
  static saveSettings = asyncHandler(async (req, res) => {
    const data: Partial<AstroSettingsInterface> = req.body;

    const result = await AstroSettings.findOneAndUpdate(
      { name: "Astro" },              // Filter to find the document
      { $set: data },   // Update fields
      { new: true, upsert: true }   // Options: create if not found
    );

    res
      .status(HttpStatusCodes.OK)
      .json({ message: "Astro Settings created successfully", data: result });
  });

  static getSettings = asyncHandler(async (req, res) => {
    const data = await AstroSettings.findOne({ name: "Astro" })
    res
      .status(HttpStatusCodes.OK)
      .json({ message: "Astro Settings fetched successfully", data: data });
  });

  static generateResponseByAI = asyncHandler(async (req, res) => {
    const questions: Record<string, string> = req.body.questions;
    const userData: Record<string, any> = req.body.userData;
    userData.timeOfBirth = `${userData.timeOfBirth.hour}:${userData.timeOfBirth.minute}`
    const data = await AstroSettings.findOne({ name: "Astro" })
    const apiProvider = await AiSettings.findOne({
      name: data.aiProvider.name,
    });

    const genPrompt = generatePrompt(questions, userData, data.promptContent);

    const ai = new AI({
      name: apiProvider?.name as ApiProvider["name"],
      model: data.aiProvider.model,
      apiKey: apiProvider.apiKey,
      temperature: apiProvider.temperature,
      maxTokens: apiProvider.maxTokens,
    });

    const response = await ai.generateResponse(genPrompt, true);

    // Submission.create({
    //   name: req.user.userName,
    //   email: req.user.email,
    //   company: req.user.companyName,
    //   category: prompt.category,
    //   tool: prompt.heading,
    //   date: new Date(),
    //   apiUsed: apiProvider.name,
    //   questionsAndAnswers: questions,
    //   generatedContent: response,
    // });

    res
      .status(HttpStatusCodes.OK)
      .json({ message: "Response generated successfully", data: response });
  });
}


function generatePrompt(answers = {}, userInfo: Record<string, string> = {}, promptText = "") {
  const formattedAnswers = Object.entries(answers)
    .map(([q, a]) => `${q}: ${a}`)
    .join("\n");

  const formattedUserInfo = Object.entries(userInfo)
    .filter(([_, val]) => (val || "")?.trim() !== "")
    .map(([key, val]) => `${key}: ${val || ""}`)
    .join("\n");

  return `
${promptText}

Using the information below, generate a JavaScript object named DiscResult with the following structure:

DiscResult = {
  chartData: [
    { name: "Dominance", value: number (0-100) },
    { name: "Influence", value: number (0-100) },
    { name: "Steadiness", value: number (0-100) },
    { name: "Conscientiousness", value: number (0-100) }
  ],
  // Add individual keys for easy access
  d: number (same as Dominance value),
  i: number (same as Influence value),
  s: number (same as Steadiness value),
  c: number (same as Conscientiousness value),

  personalityDetails: {
    title: string (e.g. "The Strategist"),
    primaryType: string ("D", "I", "S", or "C" — based on the highest score in chartData),
    keywords: array of 4–6 adjectives (e.g. ["Confident", "Analytical", ...]),
    workStyle: array of 3–5 personalized statements about the user's work approach,
    careers: array of 3–6 recommended career paths
  },

  astrologicalInsights: array of 2–4 insights based on date, time, and place of birth, as well as gender or profession
}

### User Responses:
${formattedAnswers}

### User Information:
${formattedUserInfo}

Output ONLY the JSON object named DiscResult — no explanations, markdown, or extra comments.
`;
}
