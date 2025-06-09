"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiSettings_controller_1 = __importDefault(require("../controllers/aiSettings.controller"));
const router = (0, express_1.Router)();
router.get("/", aiSettings_controller_1.default.getAiSettings);
router.post("/", aiSettings_controller_1.default.createNewAiEntry);
router.patch("/:id", aiSettings_controller_1.default.updateAiSettings);
router.patch("/", aiSettings_controller_1.default.updateManyAiSettings);
exports.default = router;
