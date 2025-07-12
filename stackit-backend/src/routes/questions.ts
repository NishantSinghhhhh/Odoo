// routes/questionRoutes.ts
import { Router } from 'express';
import { 
  createQuestion,
  createQuestionTest,  // Add this import
  getQuestions,
  getQuestionById,
  getQuestionsByAuthor
} from '../controllers/questionController';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { requireUser } from '../middleware/roleAuth';
import { validateQuestion } from '../middleware/validation';

const router = Router();

// GET routes
router.get('/', optionalAuth, getQuestions);
router.get('/:id', optionalAuth, getQuestionById);

// POST routes
router.post('/', authenticateToken, requireUser, validateQuestion, createQuestion);

// Test route without authentication (for development)
router.post('/test', createQuestionTest);

// Add logging middleware for debugging
router.use('/', (req, res, next) => {
  console.log(`🌐 Question route: ${req.method} ${req.path}`);
  console.log('📊 Request body:', req.body);
  next();
});

export { router as questionRoutes };