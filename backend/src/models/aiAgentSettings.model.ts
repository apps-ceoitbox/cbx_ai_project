import mongoose, { Schema, Document } from "mongoose";

export interface AstroSettingsInterface {
  _id: string;
  name: string;
  aiProvider: {
    name: string;
    model: string;
  };
  apikey: string;
  promptContent: string;
  visibility: boolean;
}

const AiAgentSettingsSchema: Schema = new Schema(
  {
    name: { type: String, default: "AI agents" },
    aiProvider: { type: { name: String, model: String } },
    apikey: { type: String },
    promptContent: { type: String },
    visibility: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AiAgentSettingsModel = mongoose.model<AstroSettingsInterface & Document>(
  "AiAgentSettings",
  AiAgentSettingsSchema
);
export default AiAgentSettingsModel;
