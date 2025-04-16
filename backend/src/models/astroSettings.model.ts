import mongoose, { Schema, Document } from "mongoose";

export interface AstroSettingsInterface {
  _id: string;
  name: string;
  aiProvider: {
    name: string;
    model: string;
  };
  promptContent: string;
  questions: {
    question: string;
    options: string[];
  }
}

const astroSettingsSchema: Schema = new Schema({
  name: { type: String, default: "Astro" },
  aiProvider: { type: { name: String, model: String } },
  promptContent: { type: String },
  questions: {
    type: [{
      question: String, options: [String]
    }]
  }
}, { timestamps: true });

const AstroSettings = mongoose.model<AstroSettingsInterface & Document>("astroSettings", astroSettingsSchema);
export default AstroSettings;
