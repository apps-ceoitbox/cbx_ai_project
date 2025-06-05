"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const submissions_controller_1 = __importDefault(require("../controllers/submissions.controller"));
const router = (0, express_1.Router)();
router.get("/", submissions_controller_1.default.getSubmissions);
router.get("/user", submissions_controller_1.default.getUserSubmission);
router.get("/fieldValues", submissions_controller_1.default.getSubmissionFieldValues);
router.patch("/:id", submissions_controller_1.default.updateSubmission);
router.delete("/:id", submissions_controller_1.default.deleteSubmission);
exports.default = router;
