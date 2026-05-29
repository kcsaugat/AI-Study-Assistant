import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';

interface StreakGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityByDay: { date: string; count: number }[];
  studyStreak: number;
  onResetComplete?: () => void;
}

export function StreakGraphModal({ isOpen, onClose, activityByDay, studyStreak, onResetComplete }: StreakGraphModalProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  if (!isOpen) return null;

  const maxActivity = Math.max(...activityByDay.map(d => d.count), 1); // Avoid division by 0

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset your progress level to zero? This won't delete your notes, but it will clear your streak and goals.")) return;
    
    setIsResetting(true);
    try {
      await api.post('/notes/dashboard/reset', { type: 'streak' });
      setResetDone(true);
      setTimeout(() => {
        setResetDone(false);
        if (onResetComplete) onResetComplete();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Failed to reset dashboard data:", error);
      alert("Failed to reset data");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, y: 100, rotateX: 20 }}
          animate={{ scale: 1, y: 0, rotateX: 0 }}
          exit={{ scale: 0.8, y: 100, rotateX: -20 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          style={{ transformStyle: 'preserve-3d', perspective: 1200 }}
          className="relative w-full max-w-4xl bg-white/90 dark:bg-[#0a0a0f]/95 backdrop-blur-[40px] border border-white/40 dark:border-white/20 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glass Reflections */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-white/10 pointer-events-none z-0" />
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between p-8 pb-4">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/20 flex items-center justify-center border border-brand-500/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  <TrendingUp className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                Study Activity Graph
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2 ml-1">Your detailed activity over the last 14 days.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 rounded-full bg-white/20 dark:bg-black/20 hover:bg-white/40 dark:hover:bg-black/40 border border-white/10 transition-all hover:scale-110"
            >
              <X className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>
          </div>

          {/* Body: Custom 3D Graph */}
          <div className="relative z-10 p-8 pt-4">
            
            {/* Stats Summary */}
            <div className="flex gap-12 mb-10 ml-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Current Streak</p>
                <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500 drop-shadow-sm mt-1">{studyStreak} Days</p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Total 14-Day Actions</p>
                <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500 drop-shadow-sm mt-1">
                  {activityByDay.reduce((sum, d) => sum + d.count, 0)}
                </p>
              </div>
            </div>

            {/* The Bar Chart */}
            <div className="relative h-64 mt-12 flex items-end justify-between gap-2 sm:gap-4 px-4 pb-8 border-b-2 border-gray-300/30 dark:border-white/10">
              
              {/* Y-Axis Lines (Background) */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 opacity-20">
                <div className="border-t border-gray-400 dark:border-white w-full h-0"></div>
                <div className="border-t border-gray-400 dark:border-white w-full h-0"></div>
                <div className="border-t border-gray-400 dark:border-white w-full h-0"></div>
              </div>

              {activityByDay.map((day, idx) => {
                const heightPercentage = (day.count / maxActivity) * 100;
                // Parse date for label
                const dateObj = new Date(day.date);
                const isToday = idx === activityByDay.length - 1;

                return (
                  <div key={day.date} className="relative flex flex-col items-center flex-1 h-full justify-end group z-10">
                    
                    {/* Tooltip */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 dark:bg-white/90 text-white dark:text-black text-xs font-bold px-3 py-2 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-20">
                      {day.count} Actions<br/>
                      <span className="text-[10px] font-normal opacity-80">{dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>

                    {/* 3D Bar */}
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: `${heightPercentage}%`, opacity: 1 }}
                      transition={{ delay: idx * 0.05, type: "spring", stiffness: 50 }}
                      className={`w-full max-w-[40px] rounded-t-xl relative overflow-hidden shadow-[0_-5px_15px_rgba(0,0,0,0.2)] ${
                        isToday 
                          ? 'bg-gradient-to-t from-rose-600 to-orange-400 shadow-[0_0_20px_rgba(244,63,94,0.4)]' 
                          : 'bg-gradient-to-t from-blue-600 to-cyan-400 hover:from-blue-500 hover:to-cyan-300'
                      } cursor-crosshair transition-colors`}
                    >
                      {/* Bar Inner Highlight */}
                      <div className="absolute top-0 left-0 right-0 h-2 bg-white/40 rounded-t-xl" />
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] w-[200%] animate-shimmer pointer-events-none" />
                    </motion.div>

                    {/* X-Axis Label */}
                    <div className={`absolute -bottom-8 text-xs font-bold ${isToday ? 'text-rose-500 dark:text-rose-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {isToday ? 'Today' : dateObj.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanation Section */}
            <div className="mt-8 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-brand-500/20 flex items-center justify-center text-[10px] text-brand-600">i</span> 
                How is this calculated?
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Study Streak:</strong> Your streak increases for every consecutive day you create at least one note. If you miss a day, the streak resets to 0. <br />
                <strong>14-Day Activity:</strong> We extract the exact timestamp of every note you've created over the last 14 days directly from the database to plot this graph.
              </p>
            </div>

          </div>
          
          {/* Footer Reset Area */}
          <div className="relative z-10 bg-red-500/5 dark:bg-red-500/10 border-t border-red-500/20 p-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-red-600 dark:text-red-400">Reset Progress</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Erase your streak and progress data to zero (keeps original notes).</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              disabled={isResetting || resetDone}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-colors ${
                resetDone 
                  ? 'bg-green-500 text-white shadow-green-500/30' 
                  : 'bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white shadow-red-500/30'
              }`}
            >
              {resetDone ? (
                <><CheckCircle2 className="w-5 h-5" /> Progress Erased!</>
              ) : isResetting ? (
                <span className="animate-pulse">Erasing...</span>
              ) : (
                <><Trash2 className="w-5 h-5" /> Reset Streak</>
              )}
            </motion.button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
