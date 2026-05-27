import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

import { PomodoroTimer } from '../PomodoroTimer';
import { MusicPlayer } from '../MusicPlayer';
import { ParticleBackground } from '../ParticleBackground';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/notes': 'My Notes',
  '/chat': 'AI Tutor',
  '/settings': 'Settings',
};

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on navigation
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const title = pageTitles[location.pathname] ??
    Object.entries(pageTitles).find(([key]) => location.pathname.startsWith(key))?.[1] ?? '';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 relative">
      <ParticleBackground />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15, scale: 0.98, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, scale: 0.98, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      
      <PomodoroTimer />
      <MusicPlayer />
    </div>
  );
}
