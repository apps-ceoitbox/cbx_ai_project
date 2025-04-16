import mongoose, { Schema, Document } from "mongoose";

export interface SubmissionsInterface extends Document {
  fullName: string;
  email: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  profession: string;
  generatedContent: any;
  createdAt: Date;
  updatedAt: Date;
}

const submissionsSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String },
    dateOfBirth: { type: String },
    timeOfBirth: { type: String },
    placeOfBirth: { type: String },
    profession: { type: String },
    generatedContent: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const AstroSubmissions = mongoose.model<SubmissionsInterface>(
  "astroSubmission",
  submissionsSchema
);

export default AstroSubmissions;
