import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Shield } from 'lucide-react';
import { gamificationApi } from '../api/gamification';
import { useAuthStore } from '../store/authStore';

export function LeaderboardPage() {
  const { user } = useAuthStore();
  const { data: leaderboardRes, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: gamificationApi.getLeaderboard
  });
  
  const { data: badgesRes } = useQuery({
    queryKey: ['badges'],
    queryFn: gamificationApi.getBadges
  });

  const leaderboard = leaderboardRes?.data?.data || [];
  const myBadges = badgesRes?.data?.data?.badges || [];

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Leaderboard & Badges
        </h1>
        <p className="text-gray-500 mt-2">Compete with other learners and collect achievement badges.</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Scholars</h2>
          {leaderboard.map((u, index) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-4 p-4 rounded-2xl border ${u.id === user?.id ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/20' : 'border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20'} backdrop-blur-md relative overflow-hidden`}
            >
              <div className="flex-shrink-0 w-8 text-center font-bold text-xl text-gray-400">
                #{index + 1}
              </div>
              
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {u.name.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-white truncate">
                  {u.id === user?.id ? 'You' : u.name}
                </h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {u.badges.map(b => (
                    <span key={b.id} title={b.name} className="text-lg">{b.icon}</span>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-purple-500">
                  {u.score}
                </div>
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">XP</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div>
          <div className="sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Badges</h2>
            <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-3xl p-6">
              {myBadges.length === 0 ? (
                <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                  <Shield className="w-12 h-12 opacity-20 mb-3" />
                  <p>No badges yet. Start studying to earn them!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {myBadges.map((badge, i) => (
                    <motion.div 
                      key={badge.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white/50 dark:bg-white/5 rounded-2xl p-4 text-center border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="text-4xl mb-2 filter drop-shadow-md">{badge.icon}</div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{badge.name}</h4>
                      <p className="text-[10px] text-gray-500 leading-tight mt-1">{badge.description}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
