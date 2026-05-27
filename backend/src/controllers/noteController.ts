import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  createNote, getUserNotes, getNoteById,
  updateNote, deleteNote, getDashboardStats,
} from '../services/noteService';
import { sendSuccess, sendError } from '../utils/response';

export async function createNoteHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { title, content } = req.body;
    if (!title || !content) return sendError(res, 'Title and content are required', 400);
    const note = await createNote(req.user!.userId, title, content);
    return sendSuccess(res, note, 'Note created', 201);
  } catch (err) {
    return next(err);
  }
}

export async function getNotesHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const notes = await getUserNotes(req.user!.userId);
    return sendSuccess(res, notes);
  } catch (err) {
    return next(err);
  }
}

export async function getNoteHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const note = await getNoteById(req.params.id, req.user!.userId);
    return sendSuccess(res, note);
  } catch (err) {
    return next(err);
  }
}

export async function updateNoteHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { title, content } = req.body;
    const note = await updateNote(req.params.id, req.user!.userId, title, content);
    return sendSuccess(res, note, 'Note updated');
  } catch (err) {
    return next(err);
  }
}

export async function deleteNoteHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await deleteNote(req.params.id, req.user!.userId);
    return sendSuccess(res, null, 'Note deleted');
  } catch (err) {
    return next(err);
  }
}

export async function getDashboardHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stats = await getDashboardStats(req.user!.userId);
    return sendSuccess(res, stats);
  } catch (err) {
    return next(err);
  }
}
