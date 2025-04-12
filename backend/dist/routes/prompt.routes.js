"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prompt_controller_1 = __importDefault(require("../controllers/prompt.controller"));
const router = (0, express_1.Router)();
router.get("/", prompt_controller_1.default.getAllPrompts);
router.get("/:id", prompt_controller_1.default.getPromptById);
router.post("/", prompt_controller_1.default.createPrompt);
router.post("/generate", prompt_controller_1.default.generateResponseByAI);
router.patch("/:id", prompt_controller_1.default.updatePrompt);
router.delete("/:id", prompt_controller_1.default.deletePrompt);
exports.default = router;
