import { api } from './client';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  score: number;
  badges: Badge[];
}

export const gamificationApi = {
  getLeaderboard: () => api.get<{ data: LeaderboardUser[] }>('/gamification/leaderboard'),
  getBadges: () => api.get<{ data: { badges: Badge[]; newlyEarned: Badge[] } }>('/gamification/badges'),
};
