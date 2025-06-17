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
const zoomary_history_model_1 = __importDefault(require("../models/zoomary-history.model"));
const company_profile_history_model_1 = __importDefault(require("../models/company-profile-history.model"));
dotenv_1.default.config();
class ViewController {
    static getUserSubmissionById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const submission = yield submission_model_1.default.findOne({ _id: req.params.id });
            res
                .status(errorCodes_1.HttpStatusCodes.OK)
                .json({ message: "Submission fetched successfully", data: submission });
        });
    }
    static getZoomAgentSubmissionById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const submission = yield zoomary_history_model_1.default.findOne({ _id: req.params.id });
            res
                .status(errorCodes_1.HttpStatusCodes.OK)
                .json({ message: "Submission fetched successfully", data: submission });
        });
    }
    static getCompanyProfileAgentSubmissionById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const submission = yield company_profile_history_model_1.default.findOne({
                _id: req.params.id,
            });
            res
                .status(errorCodes_1.HttpStatusCodes.OK)
                .json({ message: "Submission fetched successfully", data: submission });
        });
    }
}
exports.default = ViewController;
