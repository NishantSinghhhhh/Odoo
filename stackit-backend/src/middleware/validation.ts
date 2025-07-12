import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export const validateRegister = (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  const { username, email, password } = req.body;
  const errors: string[] = [];

  if (!username || username.trim().length < 3) {
    errors.push('Username must be at least 3 characters');
  }

  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: errors.join(', ')
    });
    return;
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  const { email, password } = req.body;
  const errors: string[] = [];

  if (!email) {
    errors.push('Email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: errors.join(', ')
    });
    return;
  }

  next();
};

export const validateQuestion = (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  const { title, description, tags } = req.body;
  const errors: string[] = [];

  if (!title || title.trim().length < 10) {
    errors.push('Title must be at least 10 characters');
  }

  if (!description || description.trim().length < 20) {
    errors.push('Description must be at least 20 characters');
  }

  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    errors.push('At least one tag is required');
  }

  if (tags && tags.length > 5) {
    errors.push('Maximum 5 tags allowed');
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: errors.join(', ')
    });
    return;
  }

  next();
};
