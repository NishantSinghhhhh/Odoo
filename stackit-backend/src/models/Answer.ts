import mongoose, { Schema, Document, Types } from 'mongoose';

// Updated interface to properly handle ObjectId types
export interface IAnswer extends Document {
  content: string;
  author: Types.ObjectId; // Use Types.ObjectId instead of string
  question: Types.ObjectId; // Use Types.ObjectId instead of string
  votes: number;
  isAccepted: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema<IAnswer>({
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [10, 'Answer must be at least 10 characters'],
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  question: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  votes: {
    type: Number,
    default: 0,
  },
  isAccepted: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

answerSchema.index({ question: 1 });
answerSchema.index({ author: 1 });
answerSchema.index({ votes: -1 });

export const Answer = mongoose.model<IAnswer>('Answer', answerSchema);