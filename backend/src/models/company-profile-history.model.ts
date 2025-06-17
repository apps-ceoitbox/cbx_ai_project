import mongoose, { Schema, Document } from "mongoose";

export interface CompanyProfileHistoryInterface {
  _id: string;
  name: string;
  email: string;
  companyName: string;
  report: string;
  sourcedFrom: string;
  createdAt: Date;
  updatedAt: Date;
}

const companyProfileHistorySchema: Schema = new Schema(
  {
    name: String,
    email: String,
    agents: { type: String, default: "company" },
    companyName: {
      type: String,
      required: true,
    },
    report: {
      type: String,
      required: true,
    },
    sourcedFrom: {
      type: String,
      default: "Gmail",
    },
  },
  { timestamps: true }
);

// Index for efficient queries by user
companyProfileHistorySchema.index({ userId: 1 });

const CompanyProfileHistory = mongoose.model<
  CompanyProfileHistoryInterface & Document
>("CompanyProfileHistory", companyProfileHistorySchema);

export default CompanyProfileHistory;
