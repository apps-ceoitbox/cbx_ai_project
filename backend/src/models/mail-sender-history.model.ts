import mongoose, { Schema, Document } from "mongoose";

export interface MailSenderHistoryInterface {
  _id: string;
  name: string;
  email: string;
  userId: mongoose.Schema.Types.ObjectId | string;
  recipient: string;
  subject: string;
  message: string;
  response: string;
  createdAt: Date;
  updatedAt: Date;
}

const MailSenderHistorySchema: Schema = new Schema(
  {
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
    recipient: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries by user
MailSenderHistorySchema.index({ userId: 1 });

const MailSenderHistory = mongoose.model<MailSenderHistoryInterface & Document>(
  "MailSenderHistory",
  MailSenderHistorySchema
);

export default MailSenderHistory;