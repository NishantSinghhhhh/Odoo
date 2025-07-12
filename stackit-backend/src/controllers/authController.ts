import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';
import { ApiResponse, RegisterDto, LoginDto, AuthRequest } from '../types';
import { config } from '../config/config';

const generateToken = (userId: string): string => {
  // Ensure JWT secret exists and is a string
  const secret = config.jwtSecret;
  const expiresIn = config.jwtExpire;
  
  if (!secret || typeof secret !== 'string') {
    throw new Error('JWT secret must be a non-empty string. Check your environment variables.');
  }
  
  if (!expiresIn) {
    throw new Error('JWT expiration time must be specified');
  }
  
  return jwt.sign(
    { userId }, 
    secret, 
    { expiresIn } as SignOptions
  );
};

export const register = async (
  req: Request<{}, ApiResponse, RegisterDto>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'User with this email or username already exists'
      });
      return;
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: 'user'
    });

    await user.save();

    // Generate token - convert ObjectId to string
    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
          reputation: user.reputation
        },
        token
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        error: validationErrors.join(', ')
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
};

export const login = async (
  req: Request<{}, ApiResponse, LoginDto>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    // Generate token - convert ObjectId to string
    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
          reputation: user.reputation
        },
        token
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id.toString(),
          username: req.user.username,
          email: req.user.email,
          role: req.user.role,
          reputation: req.user.reputation,
          avatar: req.user.avatar,
          createdAt: req.user.createdAt
        }
      }
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting profile'
    });
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  // In a JWT implementation, logout is typically handled client-side
  // by removing the token from storage
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Additional utility function for token verification (you might need this for middleware)
export const verifyToken = (token: string): { userId: string } => {
  if (!config.jwtSecret) {
    throw new Error('JWT secret is not configured');
  }
  
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};