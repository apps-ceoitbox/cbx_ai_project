import mongoose, { Schema, Document } from "mongoose";

export interface SubmissionInterface {
  _id: string;
  name: string;
  email: string;
  company: string;
  category: string;
  tool: string;
  date: string;
  status: string;
  apiUsed: string;
  questionsAndAnswers: Record<string, string>;
  generatedContent: {
    title: string;
    sections: {
      title: string;
      content: string;
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}
const submissionSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    company: { type: String, required: true },
    category: { type: String, required: true },
    tool: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, required: true, default: "Completed" },
    apiUsed: { type: String, required: true, default: "" },
    questionsAndAnswers: { type: Object, required: true, default: {} },
    generatedContent: { type: Object, required: true },
  },
  { timestamps: true }
);

const Submission = mongoose.model<SubmissionInterface & Document>(
  "submission",
  submissionSchema
);
export default Submission;
