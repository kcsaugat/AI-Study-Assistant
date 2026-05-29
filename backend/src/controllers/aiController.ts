import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  summarizeNote, getSummary, deleteSummary,
  generateQuiz, getQuizzesForNote, deleteQuiz,
  generateFlashcards, getFlashcardsForNote, deleteFlashcardDeck, reviewFlashcard,
  createChatSession, sendChatMessage,
  getChatSessions, getChatMessages, deleteChatSession,
  magicGenerate,
} from '../services/aiService';
import { sendSuccess, sendError } from '../utils/response';

// ── Summary ────────────────────────────────────────────────────────────────

export async function summarize(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const summary = await summarizeNote(req.params.noteId, req.user!.userId);
    return sendSuccess(res, { summary }, 'Summary generated');
  } catch (err) {
    return next(err);
  }
}

export async function getSummaryHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const summary = await getSummary(req.params.noteId, req.user!.userId);
    return sendSuccess(res, { summary });
  } catch (err) {
    return next(err);
  }
}

export async function deleteSummaryHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await deleteSummary(req.params.noteId, req.user!.userId);
    return sendSuccess(res, null, 'Summary deleted');
  } catch (err) {
    return next(err);
  }
}

// ── Quiz ───────────────────────────────────────────────────────────────────

export async function generateQuizHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const count = Number(req.body.questionCount) || 5;
    const result = await generateQuiz(req.params.noteId, req.user!.userId, count);
    return sendSuccess(res, result, 'Quiz generated', 201);
  } catch (err) {
    return next(err);
  }
}

export async function getQuizzesHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const quizzes = await getQuizzesForNote(req.params.noteId, req.user!.userId);
    return sendSuccess(res, quizzes);
  } catch (err) {
    return next(err);
  }
}

export async function deleteQuizHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await deleteQuiz(req.params.quizId, req.user!.userId);
    return sendSuccess(res, null, 'Quiz deleted');
  } catch (err) {
    return next(err);
  }
}

// ── Flashcards ─────────────────────────────────────────────────────────────

export async function generateFlashcardsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const count = Number(req.body.cardCount) || 10;
    const result = await generateFlashcards(req.params.noteId, req.user!.userId, count);
    return sendSuccess(res, result, 'Flashcards generated', 201);
  } catch (err) {
    return next(err);
  }
}

export async function getFlashcardsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const decks = await getFlashcardsForNote(req.params.noteId, req.user!.userId);
    return sendSuccess(res, decks);
  } catch (err) {
    return next(err);
  }
}

export async function deleteFlashcardDeckHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await deleteFlashcardDeck(req.params.deckId, req.user!.userId);
    return sendSuccess(res, null, 'Flashcard deck deleted');
  } catch (err) {
    return next(err);
  }
}

export async function reviewFlashcardHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { quality } = req.body;
    if (quality === undefined || quality < 0 || quality > 4) {
      return res.status(400).json({ status: 'error', message: 'Quality must be between 0 and 4' });
    }
    const updatedCard = await reviewFlashcard(req.params.flashcardId, req.user!.userId, quality);
    return sendSuccess(res, updatedCard, 'Flashcard reviewed');
  } catch (err) {
    return next(err);
  }
}

// ── Chat ───────────────────────────────────────────────────────────────────

export async function createSession(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { noteId } = req.body;
    const { session } = await createChatSession(req.user!.userId, noteId);
    return sendSuccess(res, session, 'Chat session created', 201);
  } catch (err) {
    return next(err);
  }
}

export async function sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { message } = req.body;
    if (!message?.trim()) return sendError(res, 'Message is required', 400);
    const reply = await sendChatMessage(req.params.sessionId, req.user!.userId, message);
    return sendSuccess(res, { reply }, 'Message sent');
  } catch (err) {
    return next(err);
  }
}

export async function getSessionsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const sessions = await getChatSessions(req.user!.userId);
    return sendSuccess(res, sessions);
  } catch (err) {
    return next(err);
  }
}

export async function getMessagesHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const messages = await getChatMessages(req.params.sessionId, req.user!.userId);
    return sendSuccess(res, messages);
  } catch (err) {
    return next(err);
  }
}

export async function deleteSessionHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await deleteChatSession(req.params.sessionId, req.user!.userId);
    return sendSuccess(res, null, 'Chat session deleted');
  } catch (err) {
    return next(err);
  }
}

// ── Magic Generate ───────────────────────────────────────────────────────────

export async function magicGenerateHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { topic, type } = req.body;
    if (!topic || !type) {
      return sendError(res, 'Topic and type are required', 400);
    }
    const result = await magicGenerate(req.user!.userId, topic, type);
    return sendSuccess(res, result, 'Magic generation complete', 201);
  } catch (err) {
    return next(err);
  }
}

// ── Hubs ───────────────────────────────────────────────────────────────────

import { getAllQuizzes, submitQuizAttempt, getAllFlashcardDecks, getPlannerEvents, createPlannerEvent, deletePlannerEvent } from '../services/aiService';

export async function getAllQuizzesHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const quizzes = await getAllQuizzes(req.user!.userId);
    return sendSuccess(res, quizzes);
  } catch (err) {
    return next(err);
  }
}

export async function submitQuizAttemptHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { score, totalQuestions } = req.body;
    const attempt = await submitQuizAttempt(req.user!.userId, req.params.quizId, score, totalQuestions);
    return sendSuccess(res, attempt, 'Quiz attempt saved');
  } catch (err) {
    return next(err);
  }
}

export async function getAllFlashcardDecksHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const decks = await getAllFlashcardDecks(req.user!.userId);
    return sendSuccess(res, decks);
  } catch (err) {
    return next(err);
  }
}

export async function getPlannerEventsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const events = await getPlannerEvents(req.user!.userId);
    return sendSuccess(res, events);
  } catch (err) {
    return next(err);
  }
}

export async function createPlannerEventHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { title, date, type, color } = req.body;
    const event = await createPlannerEvent(req.user!.userId, title, new Date(date), type, color);
    return sendSuccess(res, event, 'Planner event created');
  } catch (err) {
    return next(err);
  }
}

export async function deletePlannerEventHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await deletePlannerEvent(req.user!.userId, req.params.eventId);
    return sendSuccess(res, null, 'Planner event deleted');
  } catch (err) {
    return next(err);
  }
}
