import dotenv from "dotenv";
import { HttpStatusCodes } from "../utils/errorCodes";
import AiSettings, { AiSettingsInterface } from "../models/ai.model";
import { asyncHandler } from "../utils/asyncHandler";
dotenv.config();

const apiProviders = [
  {
    name: "ChatGPT (OpenAI)",
    models: ["gpt-4o", "gpt-4o-mini"],
    apiKey: "",
    temperature: 0.5,
    maxTokens: 4096,
  },
  {
    name: "Claude (Anthropic)",
    models: [
      "claude-3-opus-20240229",
      "claude-3-5-sonnet-20241022",
      "claude-3-5-sonnet-20240620",
    ],
    apiKey: "",
    temperature: 0.5,
    maxTokens: 4096,
  },
  {
    name: "Gemini (Google)",
    models: [
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash-001",
      "gemini-1.5-flash-002",
    ],
    apiKey: "",
    temperature: 0.5,
    maxTokens: 4096,
  },
  {
    name: "Grok (xAI)",
    models: [],
    apiKey: "",
    temperature: 0.5,
    maxTokens: 4096,
  },
  {
    name: "Deepseek",
    models: [],
    apiKey: "",
    temperature: 0.5,
    maxTokens: 4096,
  },
  {
    name: "Ollama (Self-hosted)",
    models: ["llama3.1-70b"],
    apiKey: "",
    temperature: 0.5,
    maxTokens: 4096,
  },
  {
    name: "Perplexity",
    models: [
      "perplexity-2024-04-09",
      "perplexity-2024-04-09-preview",
      "llama-3.1-sonar-small-128k-online",
    ],
    apiKey: "",
    temperature: 0.5,
    maxTokens: 4096,
  },
  {
    name: "Mistral",
    models: ["mistral-large-latest"],
    apiKey: "",
    temperature: 0.5,
    maxTokens: 4096,
  },
];

export default class AiSettingsController {
  static async createAiEntries() {
    try {
      const prevEntries = await AiSettings.find();
      const prevEntriesNames = prevEntries.map((entry) => entry.name);
      const uniqueEntries = apiProviders.filter(
        (entry) => !prevEntriesNames.includes(entry.name)
      );

      const aiSettings = await AiSettings.insertMany(uniqueEntries);
      return { message: "AI settings created successfully", data: aiSettings };
    } catch (error) {
      console.log(error);
      return { error: error.message };
    }
  }

  static createNewAiEntry = asyncHandler(async (req, res) => {
    const { name, models, apiKey, temperature, maxTokens } = req.body;
    const aiSettings = await AiSettings.create({
      name,
      models,
      apiKey,
      temperature,
      maxTokens,
    });
    res
      .status(HttpStatusCodes.OK)
      .json({ message: "AI settings created successfully", data: aiSettings });
  });

  static async getAiSettings(req, res) {
    const aiSettings = await AiSettings.find();
    res
      .status(HttpStatusCodes.OK)
      .json({ message: "AI settings fetched successfully", data: aiSettings });
  }

  static async updateAiSettings(req, res) {
    const id = req.params.id;
    const { apiKey, temperature, maxTokens } = req.body;
    const aiSettings = await AiSettings.findByIdAndUpdate(
      id,
      { apiKey, temperature, maxTokens },
      { new: true }
    );
    res
      .status(HttpStatusCodes.OK)
      .json({ message: "AI settings updated successfully", data: aiSettings });
  }

  static async updateManyAiSettings(req, res) {
    const data: AiSettingsInterface[] = req.body;
    const aiSettingsPromise = [];
    for (const item of data) {
      aiSettingsPromise.push(
        AiSettings.findOneAndUpdate(
          { _id: item._id },
          {
            apiKey: item.apiKey,
            model: item.model,
            temperature: item.temperature,
            maxTokens: item.maxTokens,
          },
          { new: true }
        )
      );
    }
    const aiSettings = await Promise.all(aiSettingsPromise);
    res
      .status(HttpStatusCodes.OK)
      .json({ message: "AI settings updated successfully", data: aiSettings });
  }
  
}
