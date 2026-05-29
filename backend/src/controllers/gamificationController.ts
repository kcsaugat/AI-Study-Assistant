import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { sendSuccess } from '../utils/response';

export async function getLeaderboardHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Get all users with their study streak and total notes count (as proxy for XP)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        _count: {
          select: { notes: true, chatSessions: true, activityLogs: true }
        }
      }
    });

    // Mock calculation of score based on activity
    const leaderboard = users.map(user => {
      const score = (user._count.notes * 50) + (user._count.chatSessions * 10) + (user._count.activityLogs * 5);
      return {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        score,
        badges: [] // We'll fetch badges below
      };
    }).sort((a, b) => b.score - a.score).slice(0, 50); // Top 50

    // Fetch badges for these users
    const userIds = leaderboard.map(u => u.id);
    const badges = await prisma.badge.findMany({
      where: { userId: { in: userIds } }
    });

    const leaderboardWithBadges = leaderboard.map(user => ({
      ...user,
      badges: badges.filter(b => b.userId === user.id)
    }));

    return sendSuccess(res, leaderboardWithBadges);
  } catch (err) {
    return next(err);
  }
}

export async function getUserBadgesHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const badges = await prisma.badge.findMany({
      where: { userId: req.user!.userId },
      orderBy: { earnedAt: 'desc' }
    });

    // Check if we need to award new badges
    const noteCount = await prisma.note.count({ where: { userId: req.user!.userId } });
    
    let newBadges = [];
    if (noteCount >= 1 && !badges.find(b => b.name === 'First Note')) {
      const b = await prisma.badge.create({
        data: { userId: req.user!.userId, name: 'First Note', description: 'Created your very first note!', icon: '📝' }
      });
      newBadges.push(b);
      badges.push(b);
    }
    if (noteCount >= 10 && !badges.find(b => b.name === 'Scholar')) {
      const b = await prisma.badge.create({
        data: { userId: req.user!.userId, name: 'Scholar', description: 'Created 10 notes!', icon: '🎓' }
      });
      newBadges.push(b);
      badges.push(b);
    }

    return sendSuccess(res, { badges, newlyEarned: newBadges });
  } catch (err) {
    return next(err);
  }
}
