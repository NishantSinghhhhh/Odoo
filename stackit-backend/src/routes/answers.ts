// routes/answerRoutes.ts
import { Router } from 'express';
import { 
  getAnswersByAuthor, 
  createAnswer, 
  createAnswerTest,
  getAnswersByQuestion,
  voteAnswer
  // New function
} from '../controllers/answerController';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { requireUser } from '../middleware/roleAuth';

const router = Router();

// Existing routes
router.get('/', optionalAuth, getAnswersByAuthor);
router.post('/', authenticateToken, requireUser, createAnswer);
router.post('/test', createAnswerTest);
router.patch('/:answerId/vote', voteAnswer)
// New route to get answers by question ID
router.get('/question/:questionId', getAnswersByQuestion);

export { router as answerRoutes };