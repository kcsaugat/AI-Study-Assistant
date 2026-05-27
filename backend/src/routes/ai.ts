import { Router } from 'express';
import {
  summarize, getSummaryHandler,
  generateQuizHandler, getQuizzesHandler,
  generateFlashcardsHandler, getFlashcardsHandler,
  createSession, sendMessage, getSessionsHandler, getMessagesHandler,
} from '../controllers/aiController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Summary
router.post('/notes/:noteId/summarize', summarize);
router.get('/notes/:noteId/summary', getSummaryHandler);

// Quiz
router.post('/notes/:noteId/quiz', generateQuizHandler);
router.get('/notes/:noteId/quizzes', getQuizzesHandler);

// Flashcards
router.post('/notes/:noteId/flashcards', generateFlashcardsHandler);
router.get('/notes/:noteId/flashcard-decks', getFlashcardsHandler);

// Chat
router.get('/chat/sessions', getSessionsHandler);
router.post('/chat/sessions', createSession);
router.get('/chat/sessions/:sessionId/messages', getMessagesHandler);
router.post('/chat/sessions/:sessionId/messages', sendMessage);

export default router;
