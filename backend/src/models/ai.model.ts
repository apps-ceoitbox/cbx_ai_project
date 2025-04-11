import mongoose, { Schema, Document } from "mongoose";



export interface AiSettingsInterface {
  _id: string;
  name: string;
  models: string[];
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const aiSettingsSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  models: { type: Array, required: true },
  model: { type: String, default: "" },
  apiKey: { type: String, default: "" },
  temperature: { type: Number, default: 0.5 },
  maxTokens: { type: Number, default: 4096 },
}, { timestamps: true });

const AiSettings = mongoose.model<AiSettingsInterface & Document>("aiSettings", aiSettingsSchema);
export default AiSettings;
