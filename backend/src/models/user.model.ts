import mongoose, { Schema, Document } from "mongoose";

export interface UserInterface {
  userName: string;
  email: string;
  companyName: string;
  mobile: string;
  googleRefreshToken: string;
  photo: string;
  companyWebsite: string;
  businessDescription: string;
  targetCustomer: string;
  businessType: 'b2b' | 'b2c' | 'both';
  uniqueSellingPoint: string;
  socialLinks: {
    linkedin: string;
    facebook: string;
    instagram: string;
    twitter: string;
  };
}

const userSchema: Schema = new Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  companyName: { type: String, default: "" },
  mobile: { type: Number, default: 0 },
  photo: { type: String, default: "" },
  googleRefreshToken: { type: String, default: "" },
  companyWebsite: { type: String, default: "" },
  businessDescription: { type: String, default: "" },
  targetCustomer: { type: String, default: "" },
  businessType: {
    type: String,
    enum: ['b2b', 'b2c', 'both'],
    default: 'b2b'
  },
  uniqueSellingPoint: { type: String, default: "" },
  socialLinks: {
    type: {
      linkedin: { type: String, default: "" },
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" }
    },
    required: true,
    default: {
      linkedin: "",
      facebook: "",
      instagram: "",
      twitter: ""
    }
  }
}, { timestamps: true });

const User = mongoose.model<UserInterface & Document>("user", userSchema);
export default User;
