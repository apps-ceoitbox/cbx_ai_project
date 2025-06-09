import mongoose, { Schema, Document } from "mongoose";

export interface AstroSettingsInterface {
  _id: string;
  name: string;
  aiProvider: {
    name: string;
    model: string;
  };
  apikey: string;
}

const AiAgentSettingsSchema: Schema = new Schema(
  {
    name: { type: String, default: "AI agents" },
    aiProvider: { type: { name: String, model: String } },
    apikey: { type: String },
  },
  { timestamps: true }
);

const AiAgentSettingsModel = mongoose.model<AstroSettingsInterface & Document>(
  "AiAgentSettings",
  AiAgentSettingsSchema
);
export default AiAgentSettingsModel;
