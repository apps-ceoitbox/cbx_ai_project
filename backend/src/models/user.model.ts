import mongoose, { Schema, Document } from "mongoose";

export interface UserInterface {
  userName: string;
  email: string;
  password: string;
  // posts: mongoose.Types.ObjectId[];
}

const userSchema: Schema = new Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'task' }],
}, { timestamps: true });

const User = mongoose.model<UserInterface & Document>("user", userSchema);
export default User;
