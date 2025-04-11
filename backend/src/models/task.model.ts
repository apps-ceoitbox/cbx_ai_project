import mongoose, { Schema, Document } from "mongoose";

export interface TaskInterface {
  title: string;
  description?: string;
  status: "pending" | "inProgress" | "completed";
  createdBy: mongoose.Types.ObjectId;
}

const taskSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, required: true, enum: ["pending", "inProgress", "completed"] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
}, { timestamps: true });

const Task = mongoose.model<TaskInterface & Document>("task", taskSchema);
export default Task;
