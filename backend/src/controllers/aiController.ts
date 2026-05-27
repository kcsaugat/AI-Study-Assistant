import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  summarizeNote, getSummary,
  generateQuiz, getQuizzesForNote,
  generateFlashcards, getFlashcardsForNote,
  createChatSession, sendChatMessage,
  getChatSessions, getChatMessages,
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
