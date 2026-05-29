import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Timer, Zap, ArrowUpRight, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';

interface FocusAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hoursSaved: number;
  quizCount: number;
  summaryCount: number;
  onResetComplete?: () => void;
}

export function FocusAnalyticsModal({ isOpen, onClose, hoursSaved, quizCount, summaryCount, onResetComplete }: FocusAnalyticsModalProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  if (!isOpen) return null;

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset your progress level to zero? This won't delete your notes, but it will clear your analytics.")) return;
    
    setIsResetting(true);
    try {
      await api.post('/notes/dashboard/reset', { type: 'analytics' });
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
          initial={{ scale: 0.8, y: -100, rotateX: 30 }}
          animate={{ scale: 1, y: 0, rotateX: 0 }}
          exit={{ scale: 0.8, y: -100, rotateX: -30 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          style={{ transformStyle: 'preserve-3d', perspective: 1200 }}
          className="relative w-full max-w-3xl bg-white/90 dark:bg-[#0a0a0f]/95 backdrop-blur-[40px] border border-white/40 dark:border-white/20 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative z-10 flex items-center justify-between p-8 pb-4 border-b border-gray-200/50 dark:border-white/10">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  <Timer className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                Focus Analytics
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2 ml-1">Your weekly AI time-saving breakdown.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 rounded-full bg-white/20 dark:bg-black/20 hover:bg-white/40 dark:hover:bg-black/40 border border-white/10 transition-all hover:scale-110"
            >
              <X className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>
          </div>

          <div className="relative z-10 p-8 flex flex-col gap-6">
            
            {/* Main Stats Area */}
            <div className="w-full">
              
              <div className="flex flex-col items-center justify-center gap-2 mb-8 text-center">
                <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-orange-600 drop-shadow-lg">
                  {hoursSaved.toFixed(1)}
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">Hours Saved</div>
                  <div className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center justify-center gap-1 mt-1">
                    <ArrowUpRight className="w-4 h-4" /> +24% from last week
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/50 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">Quizzes Generated</div>
                      <div className="text-xs text-gray-500">Manual equivalent: 45 min per quiz</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{(quizCount * 0.75).toFixed(1)} hrs</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/50 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">Summaries Generated</div>
                      <div className="text-xs text-gray-500">Manual equivalent: 30 min per summary</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{(summaryCount * 0.5).toFixed(1)} hrs</div>
                </div>
              </div>

            </div>

            {/* Explanation Section */}
            <div className="mt-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 w-full">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] text-amber-600 border border-amber-500/30">i</span> 
                The Math
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed space-y-2">
                <span className="block"><strong>Assumption Model:</strong> Creating 10 Flashcards manually = ~20 mins, Writing a Quiz manually = ~45 mins, Writing a Summary manually = ~30 mins.</span>
                <span className="block"><strong>Calculations:</strong> Every time you use the AI to instantly generate these materials, we track those tasks and add the manual equivalent time to this dashboard.</span>
                <span className="block text-amber-600 dark:text-amber-400 font-medium">You are officially an efficiency machine!</span>
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
                <><Trash2 className="w-5 h-5" /> Reset Analytics</>
              )}
            </motion.button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
