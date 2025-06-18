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
const asyncHandler_1 = require("../utils/asyncHandler");
const imageDashboard_model_1 = __importDefault(require("../models/imageDashboard.model"));
const imageGeneration_model_1 = __importDefault(require("../models/imageGeneration.model"));
const ai_model_1 = __importDefault(require("../models/ai.model"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
class generateImageController {
}
_a = generateImageController;
generateImageController.generateImage = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d;
    const email = (_b = req.user) === null || _b === void 0 ? void 0 : _b.email;
    const name = (_c = req.user) === null || _c === void 0 ? void 0 : _c.userName;
    const userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d._id;
    if (!email || !name || !userId) {
        res.status(401);
        throw new Error("User authentication information (email, name, or ID) missing.");
    }
    try {
        const { prompt, style, orientation, size, numImages, negativePrompt } = req.body;
        const geminiSetting = yield ai_model_1.default.findOne({ name: /^Gemini/i });
        if (!geminiSetting) {
            res.status(404);
            throw new Error("Gemini AI settings not found in the database.");
        }
        const { apiKey } = geminiSetting;
        if (!apiKey) {
            res.status(500);
            throw new Error("API key is missing in your AI settings.");
        }
        const settings = yield imageDashboard_model_1.default.findOneAndUpdate({ findKey: 1 }, {}, { new: true, upsert: true, setDefaultsOnInsert: true });
        const modelName = (settings === null || settings === void 0 ? void 0 : settings.modelName) || "gemini-1.5-flash-latest";
        const extraPrompt = (settings === null || settings === void 0 ? void 0 : settings.extraPrompt) || "";
        let basePrompt = prompt;
        if (extraPrompt) {
            basePrompt += `, ${extraPrompt}`;
        }
        if (style) {
            basePrompt += `, in ${style} style`;
        }
        if (orientation) {
            basePrompt += `, ${orientation} orientation`;
        }
        if (size) {
            basePrompt += `, ${size} size`;
        }
        if (negativePrompt) {
            basePrompt += `, but avoid: ${negativePrompt}`;
        }
        const desiredNumImages = parseInt(String(numImages)) || 1;
        const generationPromises = [];
        for (let i = 0; i < desiredNumImages; i++) {
            const currentPrompt = `${basePrompt} ${desiredNumImages > 1 ? `(Variation ${i + 1})` : ""}`;
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
            const payload = {
                contents: [
                    {
                        parts: [
                            {
                                text: currentPrompt,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    responseModalities: ["TEXT", "IMAGE"],
                },
            };
            generationPromises.push(fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }).then((response) => __awaiter(void 0, void 0, void 0, function* () {
                var _b;
                if (!response.ok) {
                    const errorData = yield response.json();
                    throw new Error(`Gemini API HTTP Error ${response.status}: ${((_b = errorData.error) === null || _b === void 0 ? void 0 : _b.message) || "Unknown API error"}`);
                }
                return response.json();
            })));
        }
        const results = yield Promise.all(generationPromises);
        const uploadedImageDetails = [];
        const clientImageUrls = [];
        const errorsEncountered = [];
        for (const [index, result] of results.entries()) {
            if (result.candidates && result.candidates.length > 0) {
                let foundImageInCandidate = false;
                for (const candidate of result.candidates) {
                    if (candidate.content && candidate.content.parts) {
                        for (const part of candidate.content.parts) {
                            if (part.inlineData &&
                                part.inlineData.mimeType.startsWith("image/")) {
                                const base64ImageFullString = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                                try {
                                    const publicImageUrl = yield cloudinary_1.default.uploadFile(base64ImageFullString, userId);
                                    uploadedImageDetails.push({ url: publicImageUrl });
                                    clientImageUrls.push(publicImageUrl);
                                    foundImageInCandidate = true;
                                    break;
                                }
                                catch (uploadError) {
                                    errorsEncountered.push(`Image ${index + 1}: Failed to upload to Cloudinary: ${uploadError.message || "Unknown upload error"}`);
                                    foundImageInCandidate = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (foundImageInCandidate)
                        break;
                }
                if (!foundImageInCandidate) {
                    errorsEncountered.push(`Image ${index + 1}: No image data found in Gemini response candidate.`);
                }
            }
            else if (result.error) {
                errorsEncountered.push(`Image ${index + 1}: Gemini API Error: ${result.error.message || "An unknown error occurred."}`);
            }
            else {
                errorsEncountered.push(`Image ${index + 1}: Unexpected API response structure or no candidates.`);
            }
        }
        if (uploadedImageDetails.length > 0) {
            const newImageGenerationEntry = new imageGeneration_model_1.default({
                name: name,
                email: email,
                prompt: prompt,
                images: uploadedImageDetails,
            });
            yield newImageGenerationEntry.save();
            res.status(200).json({
                success: true,
                imageUrls: clientImageUrls,
                message: `${uploadedImageDetails.length} image(s) generated and saved successfully.${errorsEncountered.length > 0
                    ? ` Some images failed or encountered issues: ${errorsEncountered.join("; ")}`
                    : ""}`,
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: `Failed to generate any images. ${errorsEncountered.join("; ")}. Please try again with a different prompt.`,
                errors: errorsEncountered,
            });
        }
    }
    catch (error) {
        console.error("Error during image generation process:", error);
        res.status(500).json({
            success: false,
            message: error.message ||
                "An unexpected error occurred during image generation.",
            error: error.message,
        });
    }
}));
generateImageController.generateEnhancedPrompt = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { prompt } = req.body;
    if (!prompt) {
        res.status(400);
        throw new Error("Prompt is required.");
    }
    const geminiSetting = yield ai_model_1.default.findOne({ name: /^Gemini/i });
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
        const apiResponse = yield axios_1.default.post(apiUrl, requestBody, { headers });
        const enhancedPromptText = apiResponse.data.candidates[0].content.parts[0].text;
        if (!enhancedPromptText) {
            throw new Error("AI response was empty or in an unexpected format.");
        }
        console.log(enhancedPromptText);
        res.status(200).json({
            success: true,
            enhancedPrompt: enhancedPromptText,
        });
    }
    catch (error) {
        console.error("Error calling Google AI REST API:", error.response ? error.response.data : error.message);
        res.status(500);
        throw new Error("Failed to get a response from the AI model via REST API.");
    }
}));
generateImageController.getSubmissions = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 6, search = "", } = req.query;
        const numericPage = Number(page);
        const numericLimit = Number(limit);
        const skip = (numericPage - 1) * numericLimit;
        // Type definition for searchQuery for TypeScript
        let searchQuery = {};
        if (search) {
            searchQuery = {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { prompt: { $regex: search, $options: "i" } },
                ],
            };
        }
        const total = yield imageGeneration_model_1.default.countDocuments(searchQuery);
        const submissions = yield imageGeneration_model_1.default
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
    }
    catch (error) {
        console.error("Error fetching all submissions:", error); // Specific log
        if (error.codeName === "QueryExceededMemoryLimitNoDiskUseAllowed") {
            res.status(500).json({
                success: false,
                message: "Failed to fetch all submissions: Data volume too large for sorting. This has been logged and is being addressed.",
            });
        }
        else if (error.code === "ECONNRESET") {
            res.status(500).json({
                success: false,
                message: "Failed to fetch all submissions: Network connection reset. Please check your internet or try again.",
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: "Failed to fetch all submissions due to an unexpected error. Please try again later.",
            });
        }
    }
}));
generateImageController.getUserSubmissions = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const email = (_b = req.user) === null || _b === void 0 ? void 0 : _b.email;
    if (!email) {
        res.status(401).json({
            success: false,
            message: "Unauthorized: User email not found in token.",
        });
        return;
    }
    try {
        const { page = 1, limit = 6, search = "", } = req.query;
        const numericPage = Number(page);
        const numericLimit = Number(limit);
        const skip = (numericPage - 1) * numericLimit;
        let combinedQuery = { email: email };
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
        const total = yield imageGeneration_model_1.default.countDocuments(combinedQuery);
        const submissions = yield imageGeneration_model_1.default
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
    }
    catch (error) {
        console.error("Error fetching user-specific submissions:", error);
        if (error.codeName === "QueryExceededMemoryLimitNoDiskUseAllowed") {
            res.status(500).json({
                success: false,
                message: "Failed to fetch user submissions: Data volume too large for sorting. This has been logged and is being addressed.",
            });
        }
        else if (error.code === "ECONNRESET") {
            res.status(500).json({
                success: false,
                message: "Failed to fetch user submissions: Network connection reset. Please check your internet or try again.",
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: "Failed to fetch user submissions due to an unexpected error. Please try again later.",
            });
        }
    }
}));
generateImageController.deleteSubmission = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const submission = yield imageGeneration_model_1.default.findById(req.params.id);
        if (submission) {
            yield submission.deleteOne();
            res.status(200).json({
                success: true,
                message: "Submission removed successfully",
            });
        }
        else {
            res.status(404).json({
                success: false,
                message: "Submission not found",
            });
        }
    }
    catch (error) {
        console.error("Error deleting submission:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete submission",
        });
    }
}));
generateImageController.getApiProvider = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield imageDashboard_model_1.default.findOneAndUpdate({ findKey: 1 }, {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
        });
        res.status(200).json({
            success: true,
            message: "Fetched AI provider settings successfully.",
            aiProvider: settings.aiProvider,
            modelName: settings.modelName,
            extraPrompt: settings.extraPrompt,
        });
    }
    catch (error) {
        console.error("Error fetching or initializing AI provider settings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch or initialize AI provider settings.",
            error: error.message,
        });
    }
}));
generateImageController.saveApiProvider = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { provider, model, extraPrompt } = req.body;
        if (!provider || !model) {
            res.status(400).json({
                success: false,
                message: "Provider and model are required fields.",
            });
            return;
        }
        const updatedSettings = yield imageDashboard_model_1.default.findOneAndUpdate({ findKey: 1 }, {
            aiProvider: provider,
            modelName: model,
            extraPrompt: extraPrompt,
        }, {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
        });
        res.status(200).json({
            success: true,
            message: "API provider settings saved successfully.",
            data: {
                aiProvider: updatedSettings.aiProvider,
                modelName: updatedSettings.modelName,
                extraPrompt: updatedSettings.extraPrompt,
            },
        });
    }
    catch (error) {
        console.error("Error saving API provider settings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to save API provider settings.",
            error: error.message,
        });
    }
}));
generateImageController.downloadImage = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = req.query;
    if (!url) {
        res.status(400).send("No URL provided.");
        return;
    }
    try {
        const response = yield axios_1.default.get(url, {
            responseType: "stream",
        });
        res.setHeader("Content-Disposition", "attachment; filename=generated-image.png");
        response.data.pipe(res);
    }
    catch (err) {
        console.error("Download error:", err);
        res.status(500).send("Failed to download image.");
    }
}));
exports.default = generateImageController;
