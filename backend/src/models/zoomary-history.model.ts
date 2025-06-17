import mongoose, { Schema, Document } from "mongoose";

export interface ZoomaryHistoryInterface {
  _id: string;
  name: string;
  email: string;
  title: string;
  summary: string;
  meetingDate: Date;
  createdAt: Date;
  updatedAt: Date;
  agents: string;
}

const zoomaryHistorySchema: Schema = new Schema(
  {
    name: String,
    email: String,
    agents: { type: String, default: "Zoom" },
    title: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    meetingDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for efficient queries by user
zoomaryHistorySchema.index({ userId: 1 });

const ZoomaryHistory = mongoose.model<ZoomaryHistoryInterface & Document>(
  "ZoomaryHistory",
  zoomaryHistorySchema
);

export default ZoomaryHistory;
