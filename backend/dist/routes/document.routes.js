"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const document_controller_1 = __importDefault(require("../controllers/document.controller"));
const router = (0, express_1.Router)();
router.post("/process", document_controller_1.default.processDocument);
exports.default = router;
