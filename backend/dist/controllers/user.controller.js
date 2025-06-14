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
const asyncHandler_1 = require("../utils/asyncHandler");
const errorCodes_1 = require("../utils/errorCodes");
const user_model_1 = __importDefault(require("../models/user.model"));
const ai_model_1 = __importDefault(require("../models/ai.model"));
const sendMail_1 = require("../utils/sendMail");
class UserController {
}
_a = UserController;
// Method to get user data with jwt token
UserController.getUserDataWithToken = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(errorCodes_1.HttpStatusCodes.OK).send(req.user);
}));
UserController.updateProfile = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const profileData = req.body;
    const profile = yield user_model_1.default.findOneAndUpdate({ _id: userId }, Object.assign({}, profileData), { new: true });
    res.status(200).json({
        success: true,
        data: profile
    });
}));
UserController.sendEmail = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { to, subject, body, attachment } = req.body;
    (0, sendMail_1.MAIL)({
        to, subject, body, attachment
    });
    res.json({
        status: true,
        message: "Email sent Successfully"
    });
}));
// Method to delete user
UserController.deleteUser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield user_model_1.default.findByIdAndDelete(req.params.id);
        yield ai_model_1.default.deleteMany({ createdBy: req.user._id });
        res.status(errorCodes_1.HttpStatusCodes.OK).send({ message: "User and its all Tasks Deleted Successfully" });
    }
    catch (err) {
        res.status(errorCodes_1.HttpStatusCodes.INTERNAL_SERVER_ERROR).send(err);
    }
}));
exports.default = UserController;
