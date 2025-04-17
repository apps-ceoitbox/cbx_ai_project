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
const asyncHandler_1 = require("../utils/asyncHandler");
const ai_model_1 = __importDefault(require("../models/ai.model"));
const AI_1 = require("../utils/AI");
const astroSettings_model_1 = __importDefault(require("../models/astroSettings.model"));
const astroSubmission_model_1 = __importDefault(require("../models/astroSubmission.model"));
dotenv_1.default.config();
class AstroController {
    static getUserSubmission(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const submission = yield astroSubmission_model_1.default.find({
                email: req.user.email,
            }).sort({ createdAt: -1 });
            res
                .status(errorCodes_1.HttpStatusCodes.OK)
                .json({ message: "Submission fetched successfully", data: submission });
        });
    }
}
_a = AstroController;
AstroController.saveSettings = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const result = yield astroSettings_model_1.default.findOneAndUpdate({ name: "Astro" }, // Filter to find the document
    { $set: data }, // Update fields
    { new: true, upsert: true } // Options: create if not found
    );
    res
        .status(errorCodes_1.HttpStatusCodes.OK)
        .json({ message: "Astro Settings created successfully", data: result });
}));
AstroController.getSettings = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield astroSettings_model_1.default.findOne({ name: "Astro" });
    res
        .status(errorCodes_1.HttpStatusCodes.OK)
        .json({ message: "Astro Settings fetched successfully", data: data });
}));
AstroController.getAllSubmissions = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const submissions = yield astroSubmission_model_1.default.find().sort({ createdAt: -1 });
    const totalSubmissions = submissions.length;
    // Count Type D and Type I dominant
    let typeD = 0;
    let typeI = 0;
    submissions.forEach((sub) => {
        var _b, _c;
        const primary = (_c = (_b = sub.generatedContent) === null || _b === void 0 ? void 0 : _b.personalityDetails) === null || _c === void 0 ? void 0 : _c.primaryType;
        if (primary === "D")
            typeD++;
        if (primary === "I")
            typeI++;
    });
    const lastSubmission = ((_b = submissions[0]) === null || _b === void 0 ? void 0 : _b.createdAt) || null;
    res.status(errorCodes_1.HttpStatusCodes.OK).json({
        message: "Submissions fetched successfully",
        totalSubmissions,
        typeDDominant: typeD,
        typeIDominant: typeI,
        lastSubmission,
        data: submissions,
    });
}));
AstroController.generateResponseByAI = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const questions = req.body.questions;
    const userData = req.body.userData;
    userData.timeOfBirth = `${userData.timeOfBirth.hour}:${userData.timeOfBirth.minute}`;
    const data = yield astroSettings_model_1.default.findOne({ name: "Astro" });
    const apiProvider = yield ai_model_1.default.findOne({
        name: data.aiProvider.name,
    });
    const genPrompt = generatePrompt(questions, userData, data.promptContent);
    const ai = new AI_1.AI({
        name: apiProvider === null || apiProvider === void 0 ? void 0 : apiProvider.name,
        model: data.aiProvider.model,
        apiKey: apiProvider.apiKey,
        temperature: apiProvider.temperature,
        maxTokens: apiProvider.maxTokens,
    });
    const response = yield ai.generateResponse(genPrompt, true);
    console.log(response);
    astroSubmission_model_1.default.create({
        fullName: req.user.userName,
        email: req.user.email,
        dateOfBirth: userData.dateOfBirth,
        timeOfBirth: userData.timeOfBirth,
        placeOfBirth: userData.placeOfBirth,
        profession: userData.profession,
        generatedContent: response,
    });
    res
        .status(errorCodes_1.HttpStatusCodes.OK)
        .json({ message: "Response generated successfully", data: response });
}));
exports.default = AstroController;
function generatePrompt(answers = {}, userInfo = {}, promptText = "") {
    const formattedAnswers = Object.entries(answers)
        .map(([q, a]) => `${q}: ${a}`)
        .join("\n");
    const formattedUserInfo = Object.entries(userInfo)
        .filter(([_, val]) => { var _b; return ((_b = (val || "")) === null || _b === void 0 ? void 0 : _b.trim()) !== ""; })
        .map(([key, val]) => `${key}: ${val || ""}`)
        .join("\n");
    return `
${promptText}

Using the information below, generate a JavaScript object with the following structure:

{
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
    secondaryType: string ("D", "I", "S", or "C" — based on the second highest score in chartData),
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

Output ONLY the JSON object — no explanations, variable name, markdown, or extra comments.
`;
}
