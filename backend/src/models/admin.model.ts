import mongoose, { Schema, Document } from "mongoose";

export interface AdminInterface {
  userName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema: Schema = new Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

const Admin = mongoose.model<AdminInterface & Document>("admin", adminSchema);
export default Admin;
