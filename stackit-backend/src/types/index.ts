// types/index.ts
import { Request } from 'express';
import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: 'guest' | 'user' | 'admin';
  reputation: number;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IQuestion extends Document {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  author: Types.ObjectId;
  votes: number;
  answers: Types.ObjectId[];
  acceptedAnswer?: Types.ObjectId;
  views: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnswer extends Document {
  _id: string;
  content: string;
  author: Types.ObjectId;
  question: Types.ObjectId;
  votes: number;
  isAccepted: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVote extends Document {
  _id: string;
  user: Types.ObjectId;
  target: Types.ObjectId;
  targetType: 'question' | 'answer';
  voteType: 'upvote' | 'downvote';
  createdAt: Date;
}

// Make AuthRequest generic to match Express Request interface
export interface AuthRequest<
  P = {},
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
  Locals extends Record<string, any> = Record<string, any>
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  user?: IUser;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateQuestionDto {
  title: string;
  description: string;
  tags: string[];
}

export interface CreateAnswerDto {
  content: string;
  questionId: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}