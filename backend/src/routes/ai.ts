import { Router } from 'express';
import {
  summarize, getSummaryHandler, deleteSummaryHandler,
  generateQuizHandler, getQuizzesHandler, deleteQuizHandler,
  generateFlashcardsHandler, getFlashcardsHandler, deleteFlashcardDeckHandler, reviewFlashcardHandler,
  createSession, sendMessage, getSessionsHandler, getMessagesHandler, deleteSessionHandler,
  magicGenerateHandler,
  getAiStatus,
} from '../controllers/aiController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// AI Status
router.get('/status', getAiStatus);

// Magic Generate
router.post('/magic-generate', magicGenerateHandler);

// Summary
router.post('/notes/:noteId/summarize', summarize);
router.get('/notes/:noteId/summary', getSummaryHandler);
router.delete('/notes/:noteId/summary', deleteSummaryHandler);

// Quiz
router.post('/notes/:noteId/quiz', generateQuizHandler);
router.get('/notes/:noteId/quizzes', getQuizzesHandler);
router.delete('/notes/:noteId/quiz/:quizId', deleteQuizHandler);

// Flashcards
router.post('/notes/:noteId/flashcards', generateFlashcardsHandler);
router.get('/notes/:noteId/flashcard-decks', getFlashcardsHandler);
router.delete('/notes/:noteId/flashcard-decks/:deckId', deleteFlashcardDeckHandler);
router.post('/flashcards/:flashcardId/review', reviewFlashcardHandler);

// Chat
router.get('/chat/sessions', getSessionsHandler);
router.post('/chat/sessions', createSession);
router.get('/chat/sessions/:sessionId/messages', getMessagesHandler);
router.post('/chat/sessions/:sessionId/messages', sendMessage);
router.delete('/chat/sessions/:sessionId', deleteSessionHandler);

// Hubs
import {
  getAllQuizzesHandler,
  submitQuizAttemptHandler,
  getAllFlashcardDecksHandler,
  getPlannerEventsHandler,
  createPlannerEventHandler,
  deletePlannerEventHandler
} from '../controllers/aiController';

router.get('/quizzes/all', getAllQuizzesHandler);
router.post('/quizzes/:quizId/attempt', submitQuizAttemptHandler);
router.get('/flashcards/all', getAllFlashcardDecksHandler);
router.get('/planner/events', getPlannerEventsHandler);
router.post('/planner/events', createPlannerEventHandler);
router.delete('/planner/events/:eventId', deletePlannerEventHandler);

export default router;
