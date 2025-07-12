import mongoose, { Schema, Document, Types } from 'mongoose';

// Updated interface to properly handle ObjectId types
export interface IQuestion extends Document {
  title: string;
  description: string;
  tags: string[];
  author: Types.ObjectId; // Use Types.ObjectId instead of string
  votes: number;
  answers: Types.ObjectId[]; // Array of ObjectIds
  acceptedAnswer: Types.ObjectId | null;
  views: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [20, 'Description must be at least 20 characters'],
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  votes: {
    type: Number,
    default: 0,
  },
  answers: [{
    type: Schema.Types.ObjectId,
    ref: 'Answer',
  }],
  acceptedAnswer: {
    type: Schema.Types.ObjectId,
    ref: 'Answer',
    default: null,
  },
  views: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes for better performance
questionSchema.index({ tags: 1 });
questionSchema.index({ author: 1 });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ votes: -1 });

export const Question = mongoose.model<IQuestion>('Question', questionSchema);