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
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
cloudinary_1.v2.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});
class FileUploadController {
    static uploadFile(base64File_1) {
        return __awaiter(this, arguments, void 0, function* (base64File, userId = "general") {
            if (base64File.includes("https://res.cloudinary.com")) {
                return base64File;
            }
            const base64String = base64File.split(",")[1];
            const extension = base64File.split(",")[0].split("/")[1].split(";")[0];
            try {
                const buffer = Buffer.from(base64String, "base64");
                const result = yield new Promise((resolve, reject) => {
                    const uniqueName = `image_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
                    const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                        public_id: uniqueName,
                        resource_type: "auto",
                        folder: `AI_Images/${userId}`,
                        overwrite: false,
                    }, (error, result) => {
                        if (error) {
                            reject(new Error(error.message));
                        }
                        else {
                            resolve(result);
                        }
                    });
                    uploadStream.end(buffer);
                });
                return result.secure_url;
            }
            catch (error) {
                console.error("Cloudinary Upload Error:", error);
                throw new Error("Failed to upload image to Cloudinary.");
            }
        });
    }
}
_a = FileUploadController;
/**
 * HTTP route for image upload via base64
 */
FileUploadController.upload = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { base64File, userId } = req.body;
        const response = yield _a.uploadFile(base64File, userId);
        res.status(200).json({ success: true, url: response });
    }
    catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to upload image",
        });
    }
}));
exports.default = FileUploadController;
