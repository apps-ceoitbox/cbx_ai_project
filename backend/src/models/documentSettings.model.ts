import mongoose, { Schema, Document } from "mongoose";

export interface DocumentSettingsInterface {
  _id: string;
  name: string;
  aiProvider: {
    name: string;
    model: string;
  };
  promptContent: string;
}

const documentSettingsSchema: Schema = new Schema({
  name: { type: String, default: "Document" },
  aiProvider: { type: { name: String, model: String } },
  promptContent: { type: String },
}, { timestamps: true });

const DocumentSettings = mongoose.model<DocumentSettingsInterface & Document>("documentSetting", documentSettingsSchema);
export default DocumentSettings;
