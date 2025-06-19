import dotenv from "dotenv";
import { asyncHandler } from "../utils/asyncHandler";
import imageDashboardModel from "../models/imageDashboard.model";
import imageGenerationModel from "../models/imageGeneration.model";
import AiSettings from "../models/ai.model";
import axios from "axios";
import { FilterQuery } from "mongoose";

dotenv.config();

import FileUploadController from "../utils/cloudinary";

const generateSingleImageAPI = async (prompt, apiKey, modelName) => {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  try {
    const response = await axios.post(
      apiUrl,
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const result = response.data;
    if (result.error) {
      throw new Error(
        `Gemini API Error: ${
          result.error.message || "An unknown error occurred."
        }`
      );
    }

    const imagePart = result.candidates?.[0]?.content?.parts?.find(
      (p) => p.inlineData
    );

    if (imagePart && imagePart.inlineData?.data) {
      return `data:image/png;base64,${imagePart.inlineData.data}`;
    } else {
      console.warn(
        "No image data found in the successful API response.",
        result
      );
      throw new Error("No image data found in the Gemini API response.");
    }
  } catch (error) {
    if (error.response) {
      console.error("Error Data:", error.response.data);
    } else if (error.request) {
      console.error("Error Request:", error.request);
    } else {
      console.error("Error Message:", error.message);
    }
    throw new Error("Failed to generate image. Check console for details.");
  }
};

export default class generateImageController {
  static generateImage = asyncHandler(async (req, res) => {
    const email = req.user?.email;
    const name = req.user?.userName;
    const userId = req.user?._id;

    if (!email || !name || !userId) {
      res.status(401);
      throw new Error(
        "User authentication information (email, name, or ID) missing."
      );
    }

    try {
      const { prompt, style, orientation, size, numImages, negativePrompt } =
        req.body;

      const geminiSetting = await AiSettings.findOne({ name: /^Gemini/i });
      if (!geminiSetting || !geminiSetting.apiKey) {
        res.status(500);
        throw new Error("Gemini AI settings or API key is missing.");
      }

      const settings = await imageDashboardModel.findOneAndUpdate(
        { findKey: 1 },
        {},
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      const modelName =
        settings?.modelName || "gemini-2.0-flash-preview-image-generation";
      const extraPrompt = settings?.extraPrompt || "";

      let basePrompt = prompt;
      if (extraPrompt) basePrompt += `, ${extraPrompt}`;
      if (style) basePrompt += `, in ${style} style`;
      if (orientation) basePrompt += `, ${orientation} orientation`;
      if (size) basePrompt += `, ${size} size`;
      if (negativePrompt) basePrompt += `, but avoid: ${negativePrompt}`;

      const desiredNumImages = parseInt(String(numImages || 1));
      const uploadedImageDetails: { url: string }[] = [];
      const cloudinaryUrls: string[] = [];
      const errorsEncountered: string[] = [];

      const descriptors = [
        "cinematic",
        "vivid",
        "dreamlike",
        "high detail",
        "surreal lighting",
        "photo-realistic",
        "soft focus",
        "dynamic perspective",
        "abstract",
        "hyperrealistic",
        "illustration",
        "concept art",
        "digital painting",
      ];

      const generationTasks = Array.from({ length: desiredNumImages }).map(
        async (_, i) => {
          const variation =
            descriptors[Math.floor(Math.random() * descriptors.length)];
          const currentPrompt = `${basePrompt}, ${variation}`;

          try {
            const base64Image = await generateSingleImageAPI(
              currentPrompt,
              geminiSetting.apiKey,
              modelName
            );


            const imageUrl = await FileUploadController.uploadFile(
              base64Image,
              userId
            );

            return { success: true, url: imageUrl };
          } catch (err: any) {
            return { success: false, error: `Image ${i + 1}: ${err.message}` };
          }
        }
      );

      const results = await Promise.all(generationTasks);

      results.forEach((result) => {
        if (result.success) {
          uploadedImageDetails.push({ url: result.url });
          cloudinaryUrls.push(result.url);
        } else {
          errorsEncountered.push(result.error);
        }
      });

      if (uploadedImageDetails.length > 0) {
        await new imageGenerationModel({
          name,
          email,
          prompt,
          images: uploadedImageDetails,
        }).save();

        res.status(200).json({
          success: true,
          imageUrls: cloudinaryUrls,
          message: `${
            uploadedImageDetails.length
          } image(s) generated successfully.${
            errorsEncountered.length > 0
              ? ` Some errors: ${errorsEncountered.join("; ")}`
              : ""
          }`,
        });
      } else {
        res.status(500).json({
          success: false,
          message: `No images generated. ${errorsEncountered.join("; ")}`,
          errors: errorsEncountered,
        });
      }
    } catch (error: any) {
      console.error("Image generation error:", error);
      res.status(res.statusCode || 500).json({
        success: false,
        message:
          error.message || "Unexpected error occurred during image generation.",
        error: error.message,
      });
    }
  });

  static generateEnhancedPrompt = asyncHandler(async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400);
      throw new Error("Prompt is required.");
    }

    const geminiSetting = await AiSettings.findOne({ name: /^Gemini/i });
    if (!geminiSetting) {
      res.status(404);
      throw new Error("Gemini AI settings not found in the database.");
    }

    const { apiKey } = geminiSetting;
    if (!apiKey) {
      res.status(500);
      throw new Error("API key or model name is missing in your AI settings.");
    }

    const sendingPrompt = `You are an expert AI prompt engineer specializing in image generation. Your task is to rewrite a simple user prompt into a rich, descriptive, and detailed prompt optimized for an AI image generation model like Midjourney or DALL-E.

The enhanced prompt must be a single, continuous string of keywords and descriptive phrases, separated by commas. It should vividly describe the subject, the environment, the artistic style, the lighting, and the composition.

**Example:**
- **User's prompt:** "a dragon"
- **Your enhanced prompt output:** A majestic, fire-breathing dragon with iridescent emerald scales, perched atop a craggy mountain peak at sunset, stormy clouds in the background, dramatic fantasy art style, cinematic lighting, epic scale, masterpiece.

---

Do NOT write a story or explain your reasoning. Only output the single, comma-separated enhanced prompt.

**User's original prompt: "${prompt}"**`;

    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: sendingPrompt,
              },
            ],
          },
        ],
      };

      const headers = {
        "Content-Type": "application/json",
      };

      const apiResponse = await axios.post(apiUrl, requestBody, { headers });

      const enhancedPromptText =
        apiResponse.data.candidates[0].content.parts[0].text;

      if (!enhancedPromptText) {
        throw new Error("AI response was empty or in an unexpected format.");
      }
      console.log(enhancedPromptText);

      res.status(200).json({
        success: true,
        enhancedPrompt: enhancedPromptText,
      });
    } catch (error) {
      console.error(
        "Error calling Google AI REST API:",
        error.response ? error.response.data : error.message
      );
      res.status(500);
      throw new Error(
        "Failed to get a response from the AI model via REST API."
      );
    }
  });

  static getSubmissions = asyncHandler(async (req, res) => {
    try {
      const {
        page = 1,
        limit = 6,
        search = "",
      } = req.query as { page?: string; limit?: string; search?: string };

      const numericPage = Number(page);
      const numericLimit = Number(limit);
      const skip = (numericPage - 1) * numericLimit;

      // Type definition for searchQuery for TypeScript
      let searchQuery: FilterQuery<any> = {};

      if (search) {
        searchQuery = {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { prompt: { $regex: search, $options: "i" } },
          ],
        };
      }

      const total = await imageGenerationModel.countDocuments(searchQuery);
      const submissions = await imageGenerationModel
        .find(searchQuery)
        .skip(skip)
        .limit(numericLimit)
        .sort({ createdAt: -1 })
        .allowDiskUse(true);

      const totalPages = Math.ceil(total / numericLimit);

      res.status(200).json({
        success: true,
        submissions,
        pagination: {
          currentPage: numericPage,
          totalPages,
          total,
          limit: numericLimit,
          hasNext: numericPage < totalPages,
          hasPrev: numericPage > 1,
        },
      });
    } catch (error) {
      console.error("Error fetching all submissions:", error); // Specific log

      if (error.codeName === "QueryExceededMemoryLimitNoDiskUseAllowed") {
        res.status(500).json({
          success: false,
          message:
            "Failed to fetch all submissions: Data volume too large for sorting. This has been logged and is being addressed.",
        });
      } else if (error.code === "ECONNRESET") {
        res.status(500).json({
          success: false,
          message:
            "Failed to fetch all submissions: Network connection reset. Please check your internet or try again.",
        });
      } else {
        res.status(500).json({
          success: false,
          message:
            "Failed to fetch all submissions due to an unexpected error. Please try again later.",
        });
      }
    }
  });

  static getUserSubmissions = asyncHandler(async (req, res) => {
    const email = req.user?.email;

    if (!email) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User email not found in token.",
      });
      return;
    }

    try {
      const {
        page = 1,
        limit = 6,
        search = "",
      } = req.query as { page?: string; limit?: string; search?: string };

      const numericPage = Number(page);
      const numericLimit = Number(limit);
      const skip = (numericPage - 1) * numericLimit;
      let combinedQuery: FilterQuery<any> = { email: email };

      if (search) {
        combinedQuery = {
          $and: [
            { email: email },
            {
              $or: [{ prompt: { $regex: search, $options: "i" } }],
            },
          ],
        };
      }

      const total = await imageGenerationModel.countDocuments(combinedQuery);

      const submissions = await imageGenerationModel
        .find(combinedQuery)
        .skip(skip)
        .limit(numericLimit)
        .sort({ createdAt: -1 })
        .allowDiskUse(true);

      const totalPages = Math.ceil(total / numericLimit);

      res.status(200).json({
        success: true,
        submissions,
        pagination: {
          currentPage: numericPage,
          totalPages,
          total,
          limit: numericLimit,
          hasNext: numericPage < totalPages,
          hasPrev: numericPage > 1,
        },
      });
    } catch (error) {
      console.error("Error fetching user-specific submissions:", error);

      if (error.codeName === "QueryExceededMemoryLimitNoDiskUseAllowed") {
        res.status(500).json({
          success: false,
          message:
            "Failed to fetch user submissions: Data volume too large for sorting. This has been logged and is being addressed.",
        });
      } else if (error.code === "ECONNRESET") {
        res.status(500).json({
          success: false,
          message:
            "Failed to fetch user submissions: Network connection reset. Please check your internet or try again.",
        });
      } else {
        res.status(500).json({
          success: false,
          message:
            "Failed to fetch user submissions due to an unexpected error. Please try again later.",
        });
      }
    }
  });

  static deleteSubmission = asyncHandler(async (req, res) => {
    try {
      const submission = await imageGenerationModel.findById(req.params.id);

      if (submission) {
        await submission.deleteOne();
        res.status(200).json({
          success: true,
          message: "Submission removed successfully",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Submission not found",
        });
      }
    } catch (error) {
      console.error("Error deleting submission:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete submission",
      });
    }
  });

  static getApiProvider = asyncHandler(async (req, res) => {
    try {
      const settings = await imageDashboardModel.findOneAndUpdate(
        { findKey: 1 },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      res.status(200).json({
        success: true,
        message: "Fetched AI provider settings successfully.",
        aiProvider: settings.aiProvider,
        modelName: settings.modelName,
        extraPrompt: settings.extraPrompt,
      });
    } catch (error) {
      console.error(
        "Error fetching or initializing AI provider settings:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Failed to fetch or initialize AI provider settings.",
        error: error.message,
      });
    }
  });

  static saveApiProvider = asyncHandler(async (req, res) => {
    try {
      const { provider, model, extraPrompt } = req.body;

      if (!provider || !model) {
        res.status(400).json({
          success: false,
          message: "Provider and model are required fields.",
        });
        return;
      }

      const updatedSettings = await imageDashboardModel.findOneAndUpdate(
        { findKey: 1 },
        {
          aiProvider: provider,
          modelName: model,
          extraPrompt: extraPrompt,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      res.status(200).json({
        success: true,
        message: "API provider settings saved successfully.",
        data: {
          aiProvider: updatedSettings.aiProvider,
          modelName: updatedSettings.modelName,
          extraPrompt: updatedSettings.extraPrompt,
        },
      });
    } catch (error) {
      console.error("Error saving API provider settings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save API provider settings.",
        error: error.message,
      });
    }
  });

  static downloadImage = asyncHandler(async (req, res) => {
    const { url } = req.query as { url?: string };

    if (!url) {
      res.status(400).send("No URL provided.");
      return;
    }

    try {
      const response = await axios.get(url, {
        responseType: "stream",
      });

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=generated-image.png"
      );
      response.data.pipe(res);
    } catch (err) {
      console.error("Download error:", err);
      res.status(500).send("Failed to download image.");
    }
  });
}
