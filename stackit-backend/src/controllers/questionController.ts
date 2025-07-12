import { Request, Response } from 'express';
import { Question } from '../models/Question';
import { User } from '../models/User';
import { Answer } from '../models/Answer';
import { AuthRequest, ApiResponse, CreateQuestionDto, PaginatedResponse } from '../types';

export const createQuestion = async (
  req: AuthRequest<{}, ApiResponse, CreateQuestionDto>,
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

    const { title, description, tags } = req.body;

    const question = new Question({
      title,
      description,
      tags: tags.map(tag => tag.toLowerCase().trim()),
      author: req.user._id
    });

    await question.save();
    await question.populate('author', 'username email reputation avatar');

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: question
    });
  } catch (error: any) {
    console.error('Create question error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating question'
    });
  }
};

export const createQuestionTest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log('='.repeat(50));
    console.log('🧪 CREATE QUESTION TEST STARTED');
    console.log('='.repeat(50));
    
    // Log request details
    console.log('📡 REQUEST DETAILS:');
    console.log('  Method:', req.method);
    console.log('  URL:', req.url);
    console.log('  Path:', req.path);
    console.log('  Original URL:', req.originalUrl);
    console.log('  Headers:', JSON.stringify(req.headers, null, 2));
    console.log('  Query params:', JSON.stringify(req.query, null, 2));
    console.log('  Params:', JSON.stringify(req.params, null, 2));
    
    // Log raw body
    console.log('📦 RAW REQUEST BODY:');
    console.log('  Body type:', typeof req.body);
    console.log('  Body content:', JSON.stringify(req.body, null, 2));
    
    // Extract and validate data
    const { title, description, tags } = req.body;
    
    console.log('🔍 EXTRACTED DATA:');
    console.log('  Title:', title);
    console.log('  Title type:', typeof title);
    console.log('  Title length:', title ? title.length : 'null/undefined');
    console.log('  Description:', description);
    console.log('  Description type:', typeof description);
    console.log('  Description length:', description ? description.length : 'null/undefined');
    console.log('  Tags:', tags);
    console.log('  Tags type:', typeof tags);
    console.log('  Tags is array:', Array.isArray(tags));
    console.log('  Tags length:', tags ? tags.length : 'null/undefined');
    
    // Validation with detailed logging
    console.log('✅ VALIDATION CHECKS:');
    
    // Title validation
    console.log('📝 Title validation:');
    if (!title) {
      console.log('  ❌ Title is missing or falsy');
      res.status(400).json({
        success: false,
        error: 'Title is required'
      });
      return;
    }
    console.log('  ✅ Title exists');
    
    const trimmedTitle = title.trim();
    console.log('  Trimmed title:', trimmedTitle);
    console.log('  Trimmed title length:', trimmedTitle.length);
    
    if (trimmedTitle.length < 10) {
      console.log('  ❌ Title too short');
      res.status(400).json({
        success: false,
        error: 'Title must be at least 10 characters'
      });
      return;
    }
    console.log('  ✅ Title length is valid');
    
    // Description validation
    console.log('📄 Description validation:');
    if (!description) {
      console.log('  ❌ Description is missing or falsy');
      res.status(400).json({
        success: false,
        error: 'Description is required'
      });
      return;
    }
    console.log('  ✅ Description exists');
    
    const trimmedDescription = description.trim();
    console.log('  Trimmed description:', trimmedDescription);
    console.log('  Trimmed description length:', trimmedDescription.length);
    
    if (trimmedDescription.length < 20) {
      console.log('  ❌ Description too short');
      res.status(400).json({
        success: false,
        error: 'Description must be at least 20 characters'
      });
      return;
    }
    console.log('  ✅ Description length is valid');
    
    // Tags validation
    console.log('🏷️ Tags validation:');
    if (!tags) {
      console.log('  ❌ Tags is missing or falsy');
      res.status(400).json({
        success: false,
        error: 'Tags are required'
      });
      return;
    }
    console.log('  ✅ Tags exists');
    
    if (!Array.isArray(tags)) {
      console.log('  ❌ Tags is not an array');
      res.status(400).json({
        success: false,
        error: 'Tags must be an array'
      });
      return;
    }
    console.log('  ✅ Tags is an array');
    
    if (tags.length === 0) {
      console.log('  ❌ Tags array is empty');
      res.status(400).json({
        success: false,
        error: 'At least one tag is required'
      });
      return;
    }
    console.log('  ✅ Tags array has items:', tags.length);
    
    // Process tags
    const processedTags = tags.map((tag: string, index: number) => {
      console.log(`  Processing tag ${index}:`, tag);
      const processed = tag.toLowerCase().trim();
      console.log(`  Processed to:`, processed);
      return processed;
    });
    console.log('  Final processed tags:', processedTags);
    
    // Author setup
    const testAuthorId = "6871fbe454c3066471845835";
    console.log('👤 AUTHOR SETUP:');
    console.log('  Using test author ID:', testAuthorId);
    
    // Create question data
    const questionData = {
      title: trimmedTitle,
      description: trimmedDescription,
      tags: processedTags,
      author: testAuthorId,
      votes: 0,
      answers: [],
      views: 0,
      isActive: true
    };
    
    console.log('📋 FINAL QUESTION DATA:');
    console.log(JSON.stringify(questionData, null, 2));
    
    // Database operations
    console.log('💾 DATABASE OPERATIONS:');
    console.log('  Creating new Question instance...');
    
    const question = new Question(questionData);
    console.log('  Question instance created:', {
      id: question._id,
      title: question.title,
      author: question.author
    });
    
    console.log('  Saving to database...');
    await question.save();
    console.log('  ✅ Question saved successfully');
    console.log('  Generated ID:', question._id);
    
    console.log('  Populating author data...');
    await question.populate('author', 'username email reputation avatar');
    console.log('  ✅ Author data populated');
  
    // Prepare response
    const responseData = {
      success: true,
      message: 'Question created successfully (test mode)',
      data: question
    };
    
    console.log('📤 SENDING RESPONSE:');
    console.log('  Status: 201');
    console.log('  Response data keys:', Object.keys(responseData));
    console.log('  Question ID in response:', responseData.data._id);
    
    res.status(201).json(responseData);
    
    console.log('✅ CREATE QUESTION TEST COMPLETED SUCCESSFULLY');
    console.log('='.repeat(50));
    
  } catch (error: any) {
    console.log('💥 ERROR OCCURRED:');
    console.log('='.repeat(50));
    console.error('❌ Test create question error:', error);
    console.log('Error details:');
    console.log('  Name:', error.name);
    console.log('  Message:', error.message);
    console.log('  Stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      console.log('🚫 MONGOOSE VALIDATION ERROR:');
      console.log('  Validation errors:', error.errors);
      Object.keys(error.errors).forEach(key => {
        console.log(`  Field "${key}":`, error.errors[key].message);
      });
      
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        error: `Validation error: ${validationErrors.join(', ')}`
      });
      return;
    }
    
    if (error.code === 11000) {
      console.log('🚫 DUPLICATE KEY ERROR:');
      console.log('  Duplicate field:', error.keyPattern);
      console.log('  Duplicate value:', error.keyValue);
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error creating question',
      details: error.message
    });
    
    console.log('❌ CREATE QUESTION TEST FAILED');
    console.log('='.repeat(50));
  }
};
export const getQuestionsByAuthor = async (
  req: AuthRequest,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { author } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = req.query.sort as string || 'newest';

    // Build filter
    const filter: any = { isActive: true };
    
    if (author) {
      filter.author = author;
    }

    // Build sort
    let sortOption: any = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'votes':
        sortOption = { votes: -1 };
        break;
      case 'views':
        sortOption = { views: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .populate('author', 'username email reputation avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Question.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        data: questions,
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error: any) {
    console.error('Get questions by author error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting questions'
    });
  }
};

export const getQuestions = async (
  req: Request,
  res: Response<ApiResponse<PaginatedResponse<any>>>
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = req.query.sort as string || 'newest';
    const search = req.query.search as string;
    const tags = req.query.tags as string;

    // Build filter
    const filter: any = { isActive: true };
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      filter.tags = { $in: tagArray };
    }

    // Build sort
    let sortOption: any = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'votes':
        sortOption = { votes: -1 };
        break;
      case 'views':
        sortOption = { views: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .populate('author', 'username email reputation avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Question.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        data: questions,
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error: any) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting questions'
    });
  }
};

export const getQuestionById = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id)
      .populate('author', 'username email reputation avatar')
      .populate({
        path: 'answers',
        populate: {
          path: 'author',
          select: 'username email reputation avatar'
        }
      });

    if (!question || !question.isActive) {
      res.status(404).json({
        success: false,
        error: 'Question not found'
      });
      return;
    }

    // Increment views
    await Question.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: question
    });
  } catch (error: any) {
    console.error('Get question error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting question'
    });
  }
};
