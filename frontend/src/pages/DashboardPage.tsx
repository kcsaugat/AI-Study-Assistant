import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import {
  FileText, Brain, Layers, MessageCircle, ArrowRight, Plus, Clock, Flame,
  Wand2, Activity, Timer
} from 'lucide-react';
import { notesApi } from '../api/notes';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageSpinner } from '../components/ui/Spinner';
import { formatDate } from '../utils/format';
import { StreakGraphModal } from '../components/dashboard/StreakGraphModal';
import { WeeklyGoalsModal } from '../components/dashboard/WeeklyGoalsModal';
import { MagicGeneratorModal } from '../components/dashboard/MagicGeneratorModal';
import { BrainSyncModal } from '../components/dashboard/BrainSyncModal';
import { FocusAnalyticsModal } from '../components/dashboard/FocusAnalyticsModal';
import { api } from '../api/client';

import { useNavigate } from 'react-router-dom';
import { AnimatedBot } from '../components/AnimatedBot';

function BouncyLetter({ char, charX, letterX }: { char: string, charX: any, letterX: number }) {
  const yOffset = useTransform(charX, (latestX: number) => {
    // The character wrapper is 70px wide. The exact center pivot is at latestX + 35.
    const charCenter = latestX + 35;
    const distance = Math.abs(charCenter - letterX);
    
    const maxDip = 18; // Max pixels it bends down under weight
    const radius = 60; // How wide the rope bending effect spreads
    
    if (distance > radius) return 0;
    return maxDip * Math.cos((distance / radius) * (Math.PI / 2));
  });

  return (
    <motion.span style={{ y: yOffset, display: 'inline-block', whiteSpace: 'pre' }}>
      {char}
    </motion.span>
  );
}

function BouncyRopeText({ text, charX }: { text: string; charX: any }) {
  const letters = text.split('');
  const containerRef = useRef<HTMLSpanElement>(null);
  
  // Default fallback positions before measurement
  const [letterPositions, setLetterPositions] = useState<number[]>(letters.map((_, i) => i * 20));

  useEffect(() => {
    if (!containerRef.current) return;
    
    const measurePositions = () => {
      if (!containerRef.current) return;
      const spans = containerRef.current.children;
      const positions: number[] = [];
      const containerLeft = containerRef.current.getBoundingClientRect().left;
      
      for (let i = 0; i < spans.length; i++) {
        const span = spans[i] as HTMLElement;
        const spanLeft = span.getBoundingClientRect().left;
        const spanWidth = span.getBoundingClientRect().width;
        // Pinpoint the exact physical center of the letter in local coordinates
        positions.push(spanLeft - containerLeft + spanWidth / 2);
      }
      setLetterPositions(positions);
    };

    // Initial measurement
    measurePositions();

    // Bulletproof ResizeObserver: If font loads late or screen resizes, it re-measures perfectly!
    const resizeObserver = new ResizeObserver(() => {
      measurePositions();
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, [text]);

  return (
    <span className="flex" ref={containerRef}>
      {letters.map((char, i) => (
        <BouncyLetter 
          key={i} 
          char={char} 
          charX={charX} 
          letterX={letterPositions[i]} 
        />
      ))}
    </span>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.3 } }),
};

export function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const charX = useMotionValue(0);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isMagicModalOpen, setIsMagicModalOpen] = useState(false);
  const [isBrainSyncModalOpen, setIsBrainSyncModalOpen] = useState(false);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);

  const { data: allNotes = [] } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const response = await api.get('/notes');
      return response.data.data;
    }
  });

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/notes/dashboard');
      return response.data.data;
    }
  });

  const handleResetComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
  };

  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleCardClick = (e: any, path: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { x, y, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    // Delay navigation slightly so they see the ripple
    setTimeout(() => navigate(path), 300);
  };

  if (isLoading) return <PageSpinner />;

  const stats = [
    { label: 'Notes', value: data?.noteCount ?? 0, icon: FileText, color: 'text-[#8b5cf6] bg-[#8b5cf6]/10 shadow-[0_0_15px_rgba(139,92,246,0.2)]', path: '/notes' },
    { label: 'Summaries', value: data?.summaryCount ?? 0, icon: Brain, color: 'text-[#10b981] bg-[#10b981]/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]', path: '/notes' },
    { label: 'Quizzes', value: data?.quizCount ?? 0, icon: Layers, color: 'text-[#a78bfa] bg-[#a78bfa]/10 shadow-[0_0_15px_rgba(167,139,250,0.2)]', path: '/notes' },
    { label: 'Flashcard Decks', value: data?.flashcardDeckCount ?? 0, icon: Layers, color: 'text-[#6d28d9] bg-[#6d28d9]/10 shadow-[0_0_15px_rgba(109,40,217,0.2)]', path: '/notes' },
    { label: 'Chat Sessions', value: data?.chatCount ?? 0, icon: MessageCircle, color: 'text-[#34d399] bg-[#34d399]/10 shadow-[0_0_15px_rgba(52,211,153,0.2)]', path: '/chat' },
  ];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculations for Advanced Features
  const syncLevel = data?.syncNotes ? Math.min(100, Math.round((data.syncQuizzes / data.syncNotes) * 100)) : 0;
  
  // Assuming: 1 Quiz = 0.75h, 1 Summary = 0.5h, 1 Flashcard Deck = 0.33h
  const hoursSaved = data ? ((data.focusQuizzes ?? 0) * 0.75) + ((data.focusSummaries ?? 0) * 0.5) + ((data.focusFlashcards ?? 0) * 0.33) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, rotateX: 10 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="p-6 lg:p-10 w-full"
      style={{ perspective: 1200 }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }}
        className="mb-12 relative isolate z-50 pt-8" // Extra padding to avoid top border overlap
      >
        <div className="relative inline-flex items-end mt-4">
          {/* 3D Greeting Text acting as a localized flexible rope */}
            <h1 
              className="relative z-20 text-2xl sm:text-5xl font-black text-3d-bridge select-none flex items-center whitespace-nowrap"
              style={{ transformStyle: 'preserve-3d', transformOrigin: 'center' }}
            >
            <BouncyRopeText text={`${greeting()}, ${user?.name?.split(' ')[0] || 'Friend'}`} charX={charX} />
            <motion.span 
              className="inline-block ml-3" 
              style={{ textShadow: 'none', WebkitTextStroke: '0' }}
              animate={{ rotate: [0, 25, -15, 25, 0], y: [0, -5, 0, -5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
            >
              👋
            </motion.span>
            
            {/* Ninja Hattori walking precisely on top edge of the text */}
            <div className="absolute bottom-[100%] left-[10px] w-full h-[120px] z-[1] pointer-events-none">
              <AnimatedBot charX={charX} />
            </div>
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mt-6 font-medium">Here's what's happening with your studies.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="relative overflow-hidden rounded-[2rem] bg-white/40 dark:bg-black/10 backdrop-blur-[32px] p-6 sm:p-8 mb-8 neon-card group cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/0 to-transparent group-hover:via-blue-500/40 transition-all duration-700 pointer-events-none z-0" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(241,245,249,0.1),_transparent_20%),radial-gradient(circle_at_bottom_left,_rgba(226,232,240,0.1),_transparent_18%)]" />
        <motion.div
          className="pointer-events-none absolute -left-10 top-24 h-28 w-28 rounded-full bg-slate-300/30 dark:bg-slate-700/20 blur-3xl"
          animate={{ scale: [1, 1.18, 1], x: [0, -12, 0], y: [0, 8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute right-6 bottom-10 h-20 w-20 rounded-full bg-brand-200/30 dark:bg-brand-800/20 blur-3xl"
          animate={{ scale: [1, 1.12, 1], x: [0, 10, 0], y: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_280px] items-center">
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-[0.32em] text-slate-600 dark:text-slate-400 font-bold">AI Study Command Center</p>
            <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Study smarter with instant notes, summaries, and AI tutoring.</h2>
            <p className="mt-4 text-sm text-slate-800 dark:text-slate-200 max-w-2xl leading-7 font-semibold">
              Easily manage your study material, generate quizzes and flashcards, and keep everything mobile-friendly on laptop or phone.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/20 bg-white/20 dark:bg-black/20 p-4 text-center shadow-2xl backdrop-blur-md">
              <div className="text-xs uppercase tracking-[0.28em] text-slate-600 dark:text-slate-300">Notes</div>
              <div className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white drop-shadow-md">{data?.noteCount ?? 0}</div>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/20 dark:bg-black/20 p-4 text-center shadow-2xl backdrop-blur-md">
              <div className="text-xs uppercase tracking-[0.28em] text-slate-600 dark:text-slate-300">Chat Sessions</div>
              <div className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white drop-shadow-md">{data?.chatCount ?? 0}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 mb-8 relative z-10 pb-4 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:overflow-visible sm:pb-0">
        {stats.map((s, i) => (
          <div key={s.label} className="min-w-[140px] sm:min-w-0 snap-start flex-shrink-0">
            <motion.div 
              custom={i} 
              variants={cardVariants} 
              initial="hidden" 
              animate="visible" 
              className="cursor-pointer"
            >
              <motion.div
                onClick={(e) => handleCardClick(e, s.path)}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/50 dark:bg-black/10 text-center neon-card relative overflow-hidden group rounded-2xl p-6 h-full flex flex-col justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/0 to-transparent group-hover:via-emerald-500/40 transition-all duration-700 pointer-events-none z-0" />
                {/* Removed Water Droplets, replacing with Sci-Fi Glass Slab in CSS */}
                {/* Ripples */}
                {ripples.map((ripple) => (
                  <motion.span
                    key={ripple.id}
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute rounded-full bg-brand-500/10 dark:bg-white/5 pointer-events-none z-0"
                    style={{
                      left: ripple.x,
                      top: ripple.y,
                      width: 100,
                      height: 100,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                ))}
                {/* Glass reflection */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 dark:from-white/5 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none rounded-2xl z-0" />
                <div className="absolute inset-0 bg-gradient-to-br from-brand-100/30 to-transparent dark:from-brand-500/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                
                <div className={`relative z-10 w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-3 pointer-events-none`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="relative z-10 text-2xl font-bold text-gray-900 dark:text-white pointer-events-none drop-shadow-md">{s.value}</div>
                <div className="relative z-10 text-xs text-gray-500 dark:text-gray-400 mt-0.5 pointer-events-none">{s.label}</div>
              </motion.div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Study Progress and Achievements */}
      <div className="grid md:grid-cols-2 gap-6 mb-8 relative z-10">
        <div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.2 }} 
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="relative h-full"
          >
            <Card className="neon-card relative overflow-hidden h-full group bg-white/50 dark:bg-black/10">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/0 to-transparent group-hover:via-amber-500/40 transition-all duration-700 pointer-events-none z-0" />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-100/30 to-transparent dark:from-aurora-purple/10 dark:to-aurora-cyan/10 opacity-30 pointer-events-none" />
              
              <div 
                className="absolute inset-0 z-20 cursor-pointer" 
                onClick={() => setIsStreakModalOpen(true)}
              ></div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:bg-white/0 dark:group-hover:bg-white/5 transition-colors z-10 pointer-events-none" />

              <div className="relative flex items-center justify-between pointer-events-none z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center shadow-sm dark:shadow-[0_0_15px_rgba(100,116,139,0.2)]">
                    <Flame className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">Study Streak</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">You're on a roll! Keep it up.</p>
                  </div>
                </div>
                <div className="text-right pointer-events-none transform translate-z-10">
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-slate-800 dark:from-brand-300 dark:to-white drop-shadow-sm">
                    {data?.studyStreak ?? 0} Days
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-widest mt-1">Current Streak</p>
                  <p className="text-[10px] text-brand-500 font-bold mt-1">
                    {data?.noteCount ?? 0} Total Notes
                  </p>
                </div>
              </div>
              
              <div className="mt-6 relative pointer-events-none z-10">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                  <span>Goal: 21 Days</span>
                  <span>{Math.min(100, Math.round(((data?.studyStreak ?? 0) / 21) * 100))}% Completed</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner">
                  <motion.div 
                    className="bg-gradient-to-r from-brand-400 to-brand-600 h-full rounded-full relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((data?.studyStreak ?? 0) / 21) * 100)}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  >
                    <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Study Goals Widget */}
        <div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.25 }} 
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="relative h-full"
          >
            <Card className="neon-card relative overflow-hidden h-full group bg-white/50 dark:bg-black/10">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-400/0 to-transparent group-hover:via-rose-500/40 transition-all duration-700 pointer-events-none z-0" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-100/50 to-transparent dark:from-aurora-blue/10 dark:to-aurora-pink/10 opacity-30 pointer-events-none" />
              
              <div 
                className="absolute inset-0 z-20 cursor-pointer"
                onClick={() => setIsGoalsModalOpen(true)}
              ></div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:bg-white/0 dark:group-hover:bg-white/5 transition-colors z-10 pointer-events-none" />

              <div className="relative pointer-events-none z-10">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4 flex items-center gap-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-brand-500 shadow-sm dark:shadow-[0_0_8px_#64748b]"></span> Weekly Goals
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Create 10 Notes</span>
                      <span>{Math.min(10, data?.weeklyNoteCount ?? 0)}/10</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                      <div className="bg-brand-500 h-full rounded-full" style={{ width: `${Math.min(100, ((data?.weeklyNoteCount ?? 0) / 10) * 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Generate 10 Summaries</span>
                      <span>{Math.min(10, data?.summaryCount ?? 0)}/10</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                      <div className="bg-slate-500 dark:bg-slate-400 h-full rounded-full" style={{ width: `${Math.min(100, ((data?.summaryCount ?? 0) / 10) * 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Take 10 Quizzes</span>
                      <span>{Math.min(10, data?.weeklyQuizCount ?? 0)}/10</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                      <div className="bg-purple-500 dark:bg-purple-400 h-full rounded-full" style={{ width: `${Math.min(100, ((data?.weeklyQuizCount ?? 0) / 10) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Advanced AI Tools (New Features) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
        
        {/* 1. Magic AI Generator */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="h-full"
            style={{ perspective: 1200 }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="h-full"
            >
              <motion.div
                onClick={() => setIsMagicModalOpen(true)}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="neon-card relative overflow-hidden h-full group bg-white/50 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 cursor-pointer"
              >
                {/* Glowing Gradient Border on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/0 to-transparent group-hover:via-purple-500/40 transition-all duration-700 pointer-events-none z-0" />


                <div className="relative z-10 flex flex-col h-full pointer-events-none">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                    <motion.div
                      whileHover={{ rotate: 180, scale: 1.2 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    >
                      <Wand2 className="w-6 h-6 text-purple-600 dark:text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                    </motion.div>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Magic Generator</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex-grow">
                    Instantly create quizzes or flashcards from any topic without typing notes.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4 pointer-events-auto bg-white/50 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-800 transition-colors w-full">
                    Generate Now
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* 2. Brain Sync Status */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="h-full"
            style={{ perspective: 1200 }}
          >
            <motion.div
              onClick={() => setIsBrainSyncModalOpen(true)}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="neon-card relative overflow-hidden h-full group bg-white/50 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/0 to-transparent group-hover:via-cyan-500/40 transition-all duration-700 pointer-events-none z-0" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-white/10 transition-colors duration-500 pointer-events-none z-0" />


              {/* Neural Pulse Background */}
              <div className="absolute bottom-0 left-0 w-full h-1/2 overflow-hidden pointer-events-none opacity-20 group-hover:opacity-60 transition-opacity duration-500 z-0">
                <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-full">
                  <motion.path
                    d="M 0,50 C 100,100 200,0 300,50 C 400,100 500,50 500,50 L 500,150 L 0,150 Z"
                    fill="url(#brain-gradient)"
                    animate={{ x: [-500, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                  <defs>
                    <linearGradient id="brain-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="relative z-10 flex flex-col h-full pointer-events-none">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-teal-600 dark:text-teal-400 group-hover:animate-pulse" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Brain Sync</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Knowledge retention health based on active recall.
                </p>
                <div className="text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-3 py-2 rounded-lg mb-4">
                  You've taken <b>{data?.quizCount ?? 0} quizzes</b> and generated <b>{data?.flashcardDeckCount ?? 0} flashcard decks</b>!
                </div>
                <div className="mt-auto">
                  <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    <span>Sync Level</span>
                    <span className="text-teal-600 dark:text-teal-400">{syncLevel}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                    <motion.div 
                      className="bg-gradient-to-r from-teal-400 to-blue-500 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${syncLevel}%` }}
                      transition={{ duration: 2, delay: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* 3. Deep Focus Analytics */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="h-full"
            style={{ perspective: 1200 }}
          >
            <motion.div
              onClick={() => setIsFocusModalOpen(true)}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="neon-card relative overflow-hidden h-full group bg-white/50 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-fuchsia-400/0 to-transparent group-hover:via-fuchsia-500/40 transition-all duration-700 pointer-events-none z-0" />


              <div className="relative z-10 flex flex-col h-full pointer-events-none">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="group-hover:animate-none"
                    >
                      <Timer className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </motion.div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Time Saved</p>
                    <motion.div 
                      className="text-2xl font-black text-amber-600 dark:text-amber-400 drop-shadow-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {hoursSaved.toFixed(1)}<span className="text-sm">hrs</span>
                    </motion.div>
                  </div>
                </div>
                
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Focus Analytics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Total manual study hours bypassed using AI automation.
                </p>
                <div className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg mb-2">
                  <b>{data?.summaryCount ?? 0} Summaries</b> successfully generated!
                </div>
                <div className="mt-auto pt-3 border-t border-white/20 dark:border-white/10">
                  <p className="text-xs text-center font-semibold text-gray-700 dark:text-gray-300">
                    You are <span className="text-amber-600 dark:text-amber-400">2x</span> more efficient!
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

      </div>

      {/* Quick actions + Recent notes */}
      <div className="grid lg:grid-cols-2 gap-6 relative z-10">
        {/* Quick actions */}
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -16 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.3 }} 
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="h-full"
          >
            <Card className="neon-card bg-white/50 dark:bg-black/10 relative overflow-hidden group h-[320px] flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/0 to-transparent group-hover:via-indigo-500/40 transition-all duration-700 pointer-events-none z-0" />
              
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 pointer-events-none relative z-10 shrink-0">Quick Actions</h2>
              <div className="space-y-2 relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-2">
                <Link to="/flashcards">
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Review Flashcards</p>
                      <p className="text-xs text-gray-500 truncate">Practice spaced repetition</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors shrink-0" />
                  </div>
                </Link>
                <Link to="/chat">
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer">
                    <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Ask AI Tutor</p>
                      <p className="text-xs text-gray-500 truncate">Chat about any topic</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors shrink-0" />
                  </div>
                </Link>
                <Link to="/notes">
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">View All Notes</p>
                      <p className="text-xs text-gray-500 truncate">Browse your study library</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors shrink-0" />
                  </div>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Recent notes */}
        <div>
          <motion.div 
            initial={{ opacity: 0, x: 16 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.35 }} 
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="h-full"
          >
            <Card className="neon-card bg-white/50 dark:bg-black/10 relative overflow-hidden group h-[320px] flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400/0 to-transparent group-hover:via-teal-500/40 transition-all duration-700 pointer-events-none z-0" />

              <div className="flex items-center justify-between mb-4 relative z-20 shrink-0 pointer-events-auto">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white pointer-events-none">Recent Notes</h2>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowAllNotes(!showAllNotes);
                  }} 
                  className="text-xs text-brand-600 hover:text-brand-500 hover:underline font-bold px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/20 cursor-pointer z-50 pointer-events-auto active:scale-95 transition-all"
                >
                  {showAllNotes ? 'Show less' : 'View all'}
                </button>
              </div>
              {!data?.recentNotes?.length ? (
                <div className="text-center py-8 pointer-events-none flex-1">
                  <FileText className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No notes yet.</p>
                  <Link to="/notes/new" className="mt-2 inline-block pointer-events-auto">
                    <Button size="sm" variant="secondary">Create your first note</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar pointer-events-auto relative z-10">
                  {(showAllNotes ? allNotes : data.recentNotes).map((note: any) => (
                    <Link key={note.id} to={`/notes/${note.id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group mb-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{note.title}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(note.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Advanced Modals */}
      <StreakGraphModal 
        isOpen={isStreakModalOpen} 
        onClose={() => setIsStreakModalOpen(false)} 
        activityByDay={data?.activityByDay || []}
        studyStreak={data?.studyStreak ?? 0}
        onResetComplete={handleResetComplete}
      />
      <WeeklyGoalsModal 
        isOpen={isGoalsModalOpen} 
        onClose={() => setIsGoalsModalOpen(false)}
        weeklyNoteCount={data?.weeklyNoteCount ?? 0}
        weeklyQuizCount={data?.weeklyQuizCount ?? 0}
        onResetComplete={handleResetComplete}
      />
      <MagicGeneratorModal 
        isOpen={isMagicModalOpen}
        onClose={() => setIsMagicModalOpen(false)}
      />
      <BrainSyncModal 
        isOpen={isBrainSyncModalOpen}
        onClose={() => setIsBrainSyncModalOpen(false)}
        syncLevel={syncLevel}
        onResetComplete={handleResetComplete}
      />
      <FocusAnalyticsModal 
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        hoursSaved={hoursSaved}
        quizCount={data?.quizCount ?? 0}
        summaryCount={data?.summaryCount ?? 0}
        onResetComplete={handleResetComplete}
      />
    </motion.div>
  );
}
