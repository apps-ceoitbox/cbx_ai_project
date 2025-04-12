"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const promptSchema = new mongoose_1.Schema({
    heading: { type: String, required: true, unique: true },
    objective: { type: String, required: true, default: "" },
    initialGreetingsMessage: { type: String, required: true, default: "" },
    questions: { type: Array, required: true, default: [] },
    knowledgeBase: { type: String, required: true, default: "" },
    promptTemplate: { type: String, required: true, default: "" },
    defaultAiProvider: {
        type: {
            name: { type: String, required: true },
            model: { type: String, required: true },
        },
        required: true
    },
    // createdBy: { type: mongoose.Types.ObjectId, required: true },
}, { timestamps: true });
const Prompt = mongoose_1.default.model("prompt", promptSchema);
exports.default = Prompt;
