import mongoose, { Schema, Document } from "mongoose";

export interface PromptInterface {
  _id: string;
  heading: string;
  group: string[];
  category: string;
  visibility: boolean;
  objective: string;
  initialGreetingsMessage: string;
  questions: string[];
  knowledgeBase: string[];
  promptTemplate: string;
  defaultAiProvider: DefaultAiProvider;
  createdAt: Date;
  updatedAt: Date;
}

interface DefaultAiProvider {
  name: string;
  model: string;
}

const promptSchema: Schema = new Schema(
  {
    heading: { type: String, required: true },
    group: { type: [String], required: true, default: [] },
    category: { type: String, },
    visibility: { type: Boolean, default: true },
    objective: { type: String, default: "" },
    initialGreetingsMessage: { type: String, default: "" },
    questions: { type: Array, default: [] },
    knowledgeBase: { type: String, default: "" },
    promptTemplate: { type: String, default: "" },
    defaultAiProvider: {
      type: {
        name: { type: String },
        model: { type: String },
      },
      required: true,
    },
    // createdBy: { type: mongoose.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

const Prompt = mongoose.model<PromptInterface & Document>(
  "prompt",
  promptSchema
);

export default Prompt;
