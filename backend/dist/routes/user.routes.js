"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const router = (0, express_1.Router)();
router.get("/getUser", user_controller_1.default.getUserDataWithToken);
router.post("/email", user_controller_1.default.sendEmail);
router.post("/profile", user_controller_1.default.updateProfile);
router.delete("/:id", user_controller_1.default.deleteUser);
exports.default = router;
