import { Router } from 'express';
import {
  createNoteHandler, getNotesHandler, getNoteHandler,
  updateNoteHandler, deleteNoteHandler, getDashboardHandler, resetDashboardHandler
} from '../controllers/noteController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardHandler);
router.post('/dashboard/reset', resetDashboardHandler);
router.get('/', getNotesHandler);
router.post('/', createNoteHandler);
router.get('/:id', getNoteHandler);
router.put('/:id', updateNoteHandler);
router.delete('/:id', deleteNoteHandler);

export default router;
