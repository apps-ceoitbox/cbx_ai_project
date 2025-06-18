import mongoose, { Document, Schema, model } from "mongoose";

// Interface for a single generated image (now only contains the URL)
export interface IGeneratedImage {
  url: string;
}

// Interface for the main document
export interface IImageGeneration extends Document {
  name: string;
  email: string;
  prompt: string;
  images: IGeneratedImage[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Sub-schema for a single generated image
const GeneratedImageSchema = new Schema<IGeneratedImage>(
  {
    url: {
      type: String,
      required: false,
      trim: true,
    },
  },
  { _id: false }
);

const ImageGenerationSchema = new Schema<IImageGeneration>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [GeneratedImageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// ImageGenerationSchema.index({ createdAt: -1 });

export default mongoose.model<IImageGeneration>(
  "ImageGeneration",
  ImageGenerationSchema
);
