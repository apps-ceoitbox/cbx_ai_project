import mongoose, { Schema, Document } from "mongoose";

export interface ReportHistoryInterface {
  _id: string;
  name: string;
  email: string;
  userId: mongoose.Schema.Types.ObjectId | string;
  fileName: string;
  fileType: string;
  report: string;
  createdAt: Date;
  updatedAt: Date;
  agents: string;
}

const reportHistorySchema: Schema = new Schema(
  {
    agents: { type: String, default: "report" },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    report: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries by user
reportHistorySchema.index({ userId: 1 });

const ReportHistory = mongoose.model<ReportHistoryInterface & Document>(
  "ReportHistory",
  reportHistorySchema
);

export default ReportHistory;