import { Router } from 'express';
import { getLeaderboardHandler, getUserBadgesHandler } from '../controllers/gamificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/leaderboard', getLeaderboardHandler);
router.get('/badges', getUserBadgesHandler);

export default router;
