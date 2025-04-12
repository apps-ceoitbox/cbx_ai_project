import mongoose, { Schema, Document } from "mongoose";

export interface UserInterface {
  userName: string;
  email: string;
  companyName: string;
  mobile: string;
}

const userSchema: Schema = new Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  companyName: { type: String, default: "" },
  mobile: { type: Number, default: 0 },
}, { timestamps: true });

const User = mongoose.model<UserInterface & Document>("user", userSchema);
export default User;
