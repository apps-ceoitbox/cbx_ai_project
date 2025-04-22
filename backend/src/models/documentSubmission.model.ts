import mongoose, { Schema, Document } from "mongoose";

export interface DocumentSubmissionInterface {
  processingOption: string;
  files: string[];
  documentType: string;
  goal: string;
  promptContent: string;
  aiProvider: string;
  model: string;
  email: string;
  name: string;
  result: string;
}
const documentSubmissionSchema: Schema = new Schema({
  processingOption: { type: String, required: true },
  files: { type: [String], required: true },
  documentType: { type: String, default: "NA" },
  goal: { type: String, default: "NA" },
  promptContent: { type: String, required: true, default: "" },
  aiProvider: { type: String, required: true, default: "" },
  model: { type: String, required: true, default: "" },
  email: { type: String, required: true, default: "" },
  name: { type: String, required: true, default: "" },
  result: { type: String, required: true, default: "" },
}, { timestamps: true });

const DocumentSubmission = mongoose.model<DocumentSubmissionInterface & Document>(
  "documentSubmission",
  documentSubmissionSchema
);
export default DocumentSubmission;
