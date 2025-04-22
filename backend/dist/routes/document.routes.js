"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const document_controller_1 = __importDefault(require("../controllers/document.controller"));
const router = (0, express_1.Router)();
router.get("/", document_controller_1.default.getSettings);
router.post("/", document_controller_1.default.saveSettings);
router.post("/process", document_controller_1.default.processDocument);
router.get("/submissions", document_controller_1.default.getDocumentSubmission);
router.get("/user-submissions", document_controller_1.default.getDocumentUserSubmission);
exports.default = router;
