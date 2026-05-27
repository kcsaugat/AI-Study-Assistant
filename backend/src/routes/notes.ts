import { Router } from 'express';
import {
  createNoteHandler, getNotesHandler, getNoteHandler,
  updateNoteHandler, deleteNoteHandler, getDashboardHandler,
} from '../controllers/noteController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardHandler);
router.get('/', getNotesHandler);
router.post('/', createNoteHandler);
router.get('/:id', getNoteHandler);
router.put('/:id', updateNoteHandler);
router.delete('/:id', deleteNoteHandler);

export default router;
