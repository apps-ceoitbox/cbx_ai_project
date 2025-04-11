import mongoose, { Schema, Document } from "mongoose";
import { AiSettingsInterface } from "./ai.model";



export interface PromptInterface {
  _id: string;
  heading: string;
  objective: string;
  initialGreetingsMessage: string;
  questions: string[];
  knowledgeBase: string[];
  promptTemplate: string;
  defaultAiProvider: DefaultAiProvider;
  // createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface DefaultAiProvider {
  name: string;
  model: string;
}

const promptSchema: Schema = new Schema({
  heading: { type: String, required: true, unique: true },
  objective: { type: String, required: true, default: "" },
  initialGreetingsMessage: { type: String, required: true, default: "" },
  questions: { type: Array, required: true, default: [] },
  knowledgeBase: { type: String, required: true, default: "" },
  promptTemplate: { type: String, required: true, default: "" },
  defaultAiProvider: {
    type: {
      name: { type: String, required: true },
      model: { type: String, required: true },
    },
    required: true
  },
  // createdBy: { type: mongoose.Types.ObjectId, required: true },
}, { timestamps: true });

const Prompt = mongoose.model<PromptInterface & Document>("prompt", promptSchema);
export default Prompt;
