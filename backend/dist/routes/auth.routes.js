"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const router = (0, express_1.Router)();
router.get("/user/google", auth_controller_1.default.initiateGoogleLogin);
router.get("/user/google/callback", auth_controller_1.default.processGoogleLogin);
router.post("/user/login", auth_controller_1.default.userLogin);
router.post("/audit/login", auth_controller_1.default.auditLogin);
router.post("/admin/register", auth_controller_1.default.adminRegister);
router.post("/admin/login", auth_controller_1.default.adminLogin);
exports.default = router;
