"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const astro_controller_1 = __importDefault(require("../controllers/astro.controller"));
const router = (0, express_1.Router)();
router.get("/", astro_controller_1.default.getSettings);
router.get("/submissions", astro_controller_1.default.getAllSubmissions);
router.post("/", astro_controller_1.default.saveSettings);
router.post("/generate", astro_controller_1.default.generateResponseByAI);
exports.default = router;
