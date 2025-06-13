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
const userSchema = new mongoose_1.Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    companyName: { type: String, default: "" },
    mobile: { type: Number, default: 0 },
    photo: { type: String, default: "" },
    googleRefreshToken: { type: String, default: "" },
    companyWebsite: { type: String, default: "" },
    businessDescription: { type: String, default: "" },
    targetCustomer: { type: String, default: "" },
    businessType: {
        type: String,
        enum: ['b2b', 'b2c', 'both'],
        default: 'b2b'
    },
    uniqueSellingPoint: { type: String, default: "" },
    socialLinks: {
        type: {
            linkedin: { type: String, default: "" },
            facebook: { type: String, default: "" },
            instagram: { type: String, default: "" },
            twitter: { type: String, default: "" }
        },
        required: true,
        default: {
            linkedin: "",
            facebook: "",
            instagram: "",
            twitter: ""
        }
    }
}, { timestamps: true });
const User = mongoose_1.default.model("user", userSchema);
exports.default = User;
