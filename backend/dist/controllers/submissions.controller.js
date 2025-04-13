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
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const errorCodes_1 = require("../utils/errorCodes");
const submission_model_1 = __importDefault(require("../models/submission.model"));
dotenv_1.default.config();
class SubmissionsController {
    static getSubmissions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const submissions = yield submission_model_1.default.find().sort({ createdAt: -1 });
            res.status(errorCodes_1.HttpStatusCodes.OK).json({ message: 'Submissions fetched successfully', data: submissions });
        });
    }
    static getUserSubmission(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const submission = yield submission_model_1.default.find({ email: req.user.email }).sort({ createdAt: -1 });
            res.status(errorCodes_1.HttpStatusCodes.OK).json({ message: 'Submission fetched successfully', data: submission });
        });
    }
    static updateSubmission(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const submission = yield submission_model_1.default.findByIdAndUpdate(id, req.body, { new: true });
            res.status(errorCodes_1.HttpStatusCodes.OK).json({ message: 'Submission updated successfully', data: submission });
        });
    }
    static deleteSubmission(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const submission = yield submission_model_1.default.findByIdAndDelete(id);
            res.status(errorCodes_1.HttpStatusCodes.OK).json({ message: 'Submission deleted successfully', data: submission });
        });
    }
}
exports.default = SubmissionsController;
