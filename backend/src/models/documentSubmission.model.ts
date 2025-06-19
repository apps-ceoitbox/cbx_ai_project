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
  results:object[];
}
const documentSubmissionSchema: Schema = new Schema({
  processingOption: { type: String },
  files: { type: [String] },
  documentType: { type: String, default: "NA" },
  goal: { type: String, default: "NA" },
  promptContent: { type: String, default: "" },
  aiProvider: { type: String, required: true, default: "" },
  model: { type: String, required: true, default: "" },
  email: { type: String, required: true, default: "" },
  name: { type: String, required: true, default: "" },
  result: { type: String, default: "" },
  results: {
    type:[
        {
          role:{type:String, enum:['user', 'system']},
          response:{type:String}
        }
      ]
  }
}, { timestamps: true });

const DocumentSubmission = mongoose.model<DocumentSubmissionInterface & Document>(
  "documentSubmission",
  documentSubmissionSchema
);
export default DocumentSubmission;
