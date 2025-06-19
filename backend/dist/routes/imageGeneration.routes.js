"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const imageGeneration_controller_1 = __importDefault(require("../controllers/imageGeneration.controller"));
const router = (0, express_1.Router)();
router.post("/enhance-prompt", imageGeneration_controller_1.default.generateEnhancedPrompt);
router.get("/getProvider", imageGeneration_controller_1.default.getApiProvider);
router.get("/getSubmissions", imageGeneration_controller_1.default.getSubmissions);
router.get("/getUserSubmission", imageGeneration_controller_1.default.getUserSubmissions);
router.post("/saveAiProvider", imageGeneration_controller_1.default.saveApiProvider);
router.delete("/deleteSubmission/:id", imageGeneration_controller_1.default.deleteSubmission);
router.post("/generateImage", imageGeneration_controller_1.default.generateImage);
router.get("/download-image", imageGeneration_controller_1.default.downloadImage);
exports.default = router;
