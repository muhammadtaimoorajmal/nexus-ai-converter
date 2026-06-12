import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  openAiKey?: string;
  aiProvider?: string;
  avatarUrl?: string;
  bio?: string;
  company?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    openAiKey: { type: String, default: "" },
    aiProvider: { type: String, default: "openai", enum: ["openai", "groq"] },
    avatarUrl: { type: String, default: "" },
    bio: { type: String, default: "" },
    company: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
