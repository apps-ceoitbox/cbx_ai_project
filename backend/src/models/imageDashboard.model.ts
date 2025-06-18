import mongoose, { Schema, Document, model } from "mongoose";

export interface IImageDashboard extends Document {
  aiProvider: string;
  modelName: string;
  extraPrompt?: string;
  createdAt?: Date;
  updatedAt?: Date;
  findKey?: number;
}

const imageDashboardSchema: Schema<IImageDashboard> = new Schema(
  {
    findKey: {
      type: Number,
      required: true,
      trim: true,
    },
    aiProvider: {
      type: String,
      required: true,
      trim: true,
    },
    modelName: {
      type: String,
      required: true,
      trim: true,
    },
    extraPrompt: {
      type: String,
      required: false,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IImageDashboard>("ImageDashboard", imageDashboardSchema);
