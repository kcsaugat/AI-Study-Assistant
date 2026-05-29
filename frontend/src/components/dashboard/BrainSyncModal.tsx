import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, BrainCircuit, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';

interface BrainSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncLevel: number;
  onResetComplete?: () => void;
}

export function BrainSyncModal({ isOpen, onClose, syncLevel, onResetComplete }: BrainSyncModalProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  if (!isOpen) return null;

  const circumference = 2 * Math.PI * 100;
  const strokeDashoffset = circumference - (syncLevel / 100) * circumference;

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset your progress level to zero? This won't delete your notes, but it will clear your sync level.")) return;
    
    setIsResetting(true);
    try {
      await api.post('/notes/dashboard/reset', { type: 'sync' });
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
          initial={{ scale: 0.8, y: -100, rotateY: -30 }}
          animate={{ scale: 1, y: 0, rotateY: 0 }}
          exit={{ scale: 0.8, y: -100, rotateY: 30 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          style={{ transformStyle: 'preserve-3d', perspective: 1200 }}
          className="relative w-full max-w-2xl bg-white/90 dark:bg-[#0a0a0f]/95 backdrop-blur-[40px] border border-white/40 dark:border-white/20 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative z-10 flex items-center justify-between p-8 pb-4">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                  <Activity className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                Brain Sync Status
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2 ml-1">Your knowledge retention health dashboard.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 rounded-full bg-white/20 dark:bg-black/20 hover:bg-white/40 dark:hover:bg-black/40 border border-white/10 transition-all hover:scale-110"
            >
              <X className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>
          </div>

          <div className="relative z-10 p-8 flex flex-col gap-8 items-center">
            
            {/* Gauge Section */}
            <div className="flex-1 flex flex-col items-center justify-center relative w-full">
              <div className="relative flex justify-center items-center w-64 h-64 drop-shadow-[0_0_20px_rgba(20,184,166,0.2)]">
                <svg className="absolute w-64 h-64 -rotate-90">
                  <circle cx="128" cy="128" r="100" stroke="rgba(20, 184, 166, 0.1)" strokeWidth="16" fill="transparent" />
                  <motion.circle 
                    cx="128" cy="128" r="100" 
                    stroke="url(#teal-gradient)"
                    strokeWidth="16" 
                    strokeLinecap="round" 
                    fill="transparent"
                    initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                    style={{ filter: 'drop-shadow(0 0 10px rgba(20,184,166,0.6))' }}
                  />
                  <defs>
                    <linearGradient id="teal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2dd4bf" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <BrainCircuit className="w-8 h-8 text-teal-500 mb-1 opacity-80" />
                  <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-500 drop-shadow-md">
                    {Math.round(syncLevel)}%
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mt-1">Synced</div>
                </div>
              </div>
              <p className="mt-4 text-center text-sm font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-4 py-2 rounded-full border border-teal-500/20">
                Excellent Retention Rate!
              </p>
            </div>

            {/* Explanation Section */}
            <div className="mt-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 w-full">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-teal-500/20 flex items-center justify-center text-[10px] text-teal-600 border border-teal-500/30">i</span> 
                How is this calculated?
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed space-y-2">
                <span className="block"><strong>Passive vs. Active:</strong> Simply reading notes is passive learning, which has a low retention rate. Taking quizzes forces your brain to retrieve information—this is called Active Recall.</span>
                <span className="block"><strong>The Calculation:</strong> Brain Sync is calculated by looking at the ratio of Quizzes taken to Notes created. If you have 10 notes but only 2 quizzes, your sync will be low (20%).</span>
                <span className="block text-teal-600 dark:text-teal-400 font-medium">Aim for 100% by taking a quiz for every note you create!</span>
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
                <><Trash2 className="w-5 h-5" /> Reset Sync Level</>
              )}
            </motion.button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
