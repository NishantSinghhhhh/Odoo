import { Request, Response } from 'express';
import { Answer } from '../models/Answer';
import { AuthRequest } from '../types';

export const getAnswersByAuthor = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { author } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Build filter
    const filter: any = { isActive: true };
    
    if (author) {
      filter.author = author;
    }

    const skip = (page - 1) * limit;

    const [answers, total] = await Promise.all([
      Answer.find(filter)
        .populate('author', 'username email reputation avatar')
        .populate('question', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Answer.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: answers
    });
  } catch (error: any) {
    console.error('Get answers by author error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting answers'
    });
  }
};

export const createAnswer = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const { content, questionId } = req.body;

    const answer = new Answer({
      content,
      question: questionId,
      author: req.user._id
    });

    await answer.save();
    await answer.populate('author', 'username email reputation avatar');
    await answer.populate('question', 'title');

    res.status(201).json({
      success: true,
      message: 'Answer created successfully',
      data: answer
    });
  } catch (error: any) {
    console.error('Create answer error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating answer'
    });
  }
};
export const createAnswerTest = async (
    req: Request,  // Changed from AuthRequest to Request
    res: Response<ApiResponse>
  ): Promise<void> => {
    try {
      // Extract all fields from request body
      const { 
        content, 
        questionId, 
        question,  // Allow both questionId and question
        author, 
        votes = 0, 
        isAccepted = false,
        isActive = true 
      } = req.body;
  
      // Use questionId or question field (flexible)
      const questionRef = questionId || question;
      
      if (!content) {
        res.status(400).json({
          success: false,
          error: 'Content is required'
        });
        return;
      }
  
      if (!questionRef) {
        res.status(400).json({
          success: false,
          error: 'Question ID is required'
        });
        return;
      }
  
      if (!author) {
        res.status(400).json({
          success: false,
          error: 'Author ID is required'
        });
        return;
      }
  
      const answer = new Answer({
        content,
        question: questionRef,
        author,
        votes,
        isAccepted,
        isActive
      });
  
      await answer.save();
      
      // Optional: Populate author and question details
      await answer.populate('author', 'username email reputation avatar');
      await answer.populate('question', 'title');
  
      res.status(201).json({
        success: true,
        message: 'Answer created successfully',
        data: answer
      });
    } catch (error: any) {
      console.error('Create answer error:', error);
      
      // Handle validation errors specifically
      if (error.name === 'ValidationError') {
        res.status(400).json({
          success: false,
          error: error.message
        });
        return;
      }
  
      res.status(500).json({
        success: false,
        error: 'Server error creating answer'
      });
    }
  };

  export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }
  
  // Or create a specific interface for paginated responses
  export interface PaginatedApiResponse<T = any> extends ApiResponse<T> {
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }
  
export const getAnswersByQuestion = async (
    req: Request,
    res: Response<ApiResponse>
  ): Promise<void> => {
    try {
      const { questionId } = req.params;
      const { 
        sort = 'votes', // Default sort by votes (highest first)
        page = 1, 
        limit = 20 
      } = req.query;
  
      if (!questionId) {
        res.status(400).json({
          success: false,
          error: 'Question ID is required'
        });
        return;
      }
  
      // Build sort object
      let sortObject: any = {};
      switch (sort) {
        case 'newest':
          sortObject = { createdAt: -1 };
          break;
        case 'oldest':
          sortObject = { createdAt: 1 };
          break;
        case 'votes':
        default:
          sortObject = { votes: -1, createdAt: -1 }; // Sort by votes desc, then by newest
          break;
      }
  
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 20;
      const skip = (pageNum - 1) * limitNum;
  
      // Fetch answers with author details populated
      const answers = await Answer.find({ 
        question: questionId,
        isActive: true 
      })
      .populate('author', 'username email reputation avatar')
      .sort(sortObject)
      .skip(skip)
      .limit(limitNum);
  
      // Get total count for pagination
      const total = await Answer.countDocuments({ 
        question: questionId,
        isActive: true 
      });
  
      const totalPages = Math.ceil(total / limitNum);
  
      res.status(200).json({
        success: true,
        data: answers,
        message: `Found ${answers.length} answers`,
        // Additional pagination info if needed
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages
        }
      });
    } catch (error: any) {
      console.error('Get answers by question error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error fetching answers'
      });
    }
  };

  
  export const voteAnswer = async (req: Request, res: Response) => {
    const { answerId } = req.params
    const { vote } = req.body
  
    if (typeof vote !== 'number' || ![1, -1].includes(vote)) {
      return res.status(400).json({ success: false, error: 'Invalid vote value' })
    }
  
    try {
      const answer = await Answer.findById(answerId)
      if (!answer) {
        return res.status(404).json({ success: false, error: 'Answer not found' })
      }
  
      answer.votes += vote
      await answer.save()
  
      return res.status(200).json({ success: true, data: answer })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ success: false, error: 'Server error while voting' })
    }
  }
  