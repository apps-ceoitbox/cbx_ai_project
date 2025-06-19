import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export default class FileUploadController {
  static async uploadFile(
    base64File: string,
    userId: string = "general"
  ): Promise<string> {
    if (base64File.includes("https://res.cloudinary.com")) {
      return base64File;
    }

    const base64String = base64File.split(",")[1];
    const extension = base64File.split(",")[0].split("/")[1].split(";")[0];

    try {
      const buffer = Buffer.from(base64String, "base64");

      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uniqueName = `image_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: uniqueName,
            resource_type: "auto",
            folder: `AI_Images/${userId}`,
            overwrite: false,
          },
          (error, result) => {
            if (error) {
              reject(new Error(error.message));
            } else {
              resolve(result as UploadApiResponse);
            }
          }
        );

        uploadStream.end(buffer);
      });

      return result.secure_url;
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      throw new Error("Failed to upload image to Cloudinary.");
    }
  }

  /**
   * HTTP route for image upload via base64
   */
  static upload = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const { base64File, userId } = req.body;
      const response = await FileUploadController.uploadFile(base64File, userId);
      res.status(200).json({ success: true, url: response });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to upload image",
      });
    }
  });
}
