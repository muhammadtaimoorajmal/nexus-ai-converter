import mongoose, { Schema, Document } from 'mongoose';

export interface IMeeting extends Document {
  title: string;
  userId: mongoose.Types.ObjectId;
  status: 'processing' | 'completed' | 'error';
  sourceType: 'audio' | 'video' | 'text';
  fileUrl?: string;
  transcript?: string;
  summary?: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['processing', 'completed', 'error'], default: 'processing' },
    sourceType: { type: String, enum: ['audio', 'video', 'text'], required: true },
    language: { type: String, default: 'en-US' },
    fileUrl: { type: String },
    transcript: { type: String },
    summary: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IMeeting>('Meeting', MeetingSchema);
