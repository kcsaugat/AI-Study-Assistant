import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';

interface WeeklyGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeklyNoteCount: number;
  weeklyQuizCount: number;
  onResetComplete: () => void;
}

export function WeeklyGoalsModal({ isOpen, onClose, weeklyNoteCount, weeklyQuizCount, onResetComplete }: WeeklyGoalsModalProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  if (!isOpen) return null;

  const notesGoal = 10;
  const quizzesGoal = 10;
  
  const notesPercent = Math.min(100, (weeklyNoteCount / notesGoal) * 100);
  const quizzesPercent = Math.min(100, (weeklyQuizCount / quizzesGoal) * 100);

  const circumference1 = 2 * Math.PI * 120; // Outer ring
  const circumference2 = 2 * Math.PI * 80;  // Inner ring

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset your weekly goals to zero? This won't delete your actual notes.")) return;
    
    setIsResetting(true);
    try {
      await api.post('/notes/dashboard/reset', { type: 'goals' });
      setResetDone(true);
      setTimeout(() => {
        setResetDone(false);
        if (onResetComplete) onResetComplete(); // Will trigger dashboard data refresh
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
          initial={{ scale: 0.8, y: -100, rotateY: 30 }}
          animate={{ scale: 1, y: 0, rotateY: 0 }}
          exit={{ scale: 0.8, y: -100, rotateY: -30 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          style={{ transformStyle: 'preserve-3d', perspective: 1200 }}
          className="relative w-full max-w-2xl bg-white/90 dark:bg-[#0a0a0f]/95 backdrop-blur-[40px] border border-white/40 dark:border-white/20 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative z-10 flex items-center justify-between p-8 pb-4">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/20 flex items-center justify-center border border-brand-500/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  <Target className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                Weekly Goals HUD
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2 ml-1">Your advanced orbital progress tracker.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 rounded-full bg-white/20 dark:bg-black/20 hover:bg-white/40 dark:hover:bg-black/40 border border-white/10 transition-all hover:scale-110"
            >
              <X className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>
          </div>

          {/* Body: Orbital Rings */}
          <div className="relative z-10 p-8 flex flex-col items-center">
            
            <div className="relative flex justify-center items-center w-80 h-80 my-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              {/* Outer Ring Background (Notes) */}
              <svg className="absolute w-80 h-80 -rotate-90">
                <circle cx="160" cy="160" r="120" stroke="rgba(139, 92, 246, 0.1)" strokeWidth="20" fill="transparent" />
                <motion.circle 
                  cx="160" cy="160" r="120" 
                  stroke="#8b5cf6" /* Violet */
                  strokeWidth="20" 
                  strokeLinecap="round" 
                  fill="transparent"
                  initial={{ strokeDasharray: circumference1, strokeDashoffset: circumference1 }}
                  animate={{ strokeDashoffset: circumference1 - (notesPercent / 100) * circumference1 }}
                  transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                  style={{ filter: 'drop-shadow(0 0 10px rgba(139,92,246,0.8))' }}
                />
              </svg>

              {/* Inner Ring Background (Quizzes) */}
              <svg className="absolute w-80 h-80 -rotate-90">
                <circle cx="160" cy="160" r="80" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="20" fill="transparent" />
                <motion.circle 
                  cx="160" cy="160" r="80" 
                  stroke="#10b981" /* Emerald */
                  strokeWidth="20" 
                  strokeLinecap="round" 
                  fill="transparent"
                  initial={{ strokeDasharray: circumference2, strokeDashoffset: circumference2 }}
                  animate={{ strokeDashoffset: circumference2 - (quizzesPercent / 100) * circumference2 }}
                  transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                  style={{ filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.8))' }}
                />
              </svg>
              
              <div className="absolute text-center">
                <div className="text-3xl font-black text-brand-600 dark:text-brand-400 drop-shadow-md">{Math.round(notesPercent)}%</div>
                <div className="text-xs uppercase tracking-widest text-gray-500 font-bold">Goals Met</div>
              </div>
            </div>

            <div className="flex gap-12 mt-8 w-full justify-center">
              <div className="text-center">
                <div className="w-4 h-4 rounded-full bg-[#8b5cf6] mx-auto mb-2 shadow-[0_0_10px_#8b5cf6]"></div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{weeklyNoteCount} / {notesGoal}</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Notes</p>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 rounded-full bg-[#10b981] mx-auto mb-2 shadow-[0_0_10px_#10b981]"></div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{weeklyQuizCount} / {quizzesGoal}</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Quizzes</p>
              </div>
            </div>

            {/* Explanation Section */}
            <div className="mt-8 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 w-full">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-brand-500/20 flex items-center justify-center text-[10px] text-brand-600">i</span> 
                How is this calculated?
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Weekly Progress:</strong> The system automatically queries the database for all Notes and Quizzes you have created within the last 7 rolling days. <br />
                <strong>Orbital Rings:</strong> The percentage is calculated directly against your set maximum targets (10 Notes / 10 Quizzes).
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
                <><Trash2 className="w-5 h-5" /> Reset Goals</>
              )}
            </motion.button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
