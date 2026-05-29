import { Menu, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../../store/themeStore';
import { useAppStore } from '../../store/appStore';
import { useEffect, useState } from 'react';

interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
}

export function TopBar({ onMenuClick, title = '' }: TopBarProps) {
  const { isDark, toggle } = useThemeStore();
  const { zenMode, toggleZenMode } = useAppStore();
  const [escapeX, setEscapeX] = useState<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!title) return;
      
      // If mouse is below 120px, it's not near the top bar
      if (e.clientY > 120) {
        setEscapeX(null);
        return;
      }
      
      const windowCenter = window.innerWidth / 2;
      const distanceToCenter = e.clientX - windowCenter;
      
      // If mouse is within 300px of the center
      if (Math.abs(distanceToCenter) < 300) {
        // Push it away to the opposite side
        setEscapeX(distanceToCenter < 0 ? 200 : -200);
      } else {
        setEscapeX(null);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [title]);

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 shrink-0 relative z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-2xl text-slate-600 dark:text-slate-200 bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-white/10 shadow-lg shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 z-10"
        >
          <Menu className="w-5 h-5" strokeWidth={3} />
        </button>
      </div>

      {title && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none pl-14 pr-24 sm:mx-20 lg:mx-32">
          <motion.div
            animate={escapeX !== null ? { x: escapeX } : { x: [-180, 180] }}
            transition={escapeX !== null 
              ? { type: 'spring', stiffness: 300, damping: 20 }
              : { repeat: Infinity, repeatType: "reverse", duration: 5, ease: "easeInOut" }
            }
            className="relative pointer-events-none"
          >
            <div className="glass-bottle">
              {/* Transparent Water Droplets on Bottle */}
              <div className="dark:hidden">
                <div className="water-droplet" style={{ top: '10%', left: '10%', width: '35px', height: '35px', animationDelay: '0s' }}></div>
                <div className="water-droplet" style={{ top: '60%', right: '8%', width: '45px', height: '45px', animationDelay: '0.2s' }}></div>
                <div className="water-droplet" style={{ bottom: '15%', left: '40%', width: '25px', height: '25px', animationDelay: '0.4s' }}></div>
              </div>
              {/* Running Water Stream */}
              <div className="running-water dark:hidden"></div>

              <h1 className="relative z-10 text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-widest text-3d-scifi truncate">
                {title}
              </h1>
            </div>
          </motion.div>
        </div>
      )}

      <div className="flex items-center gap-2 relative z-50 pointer-events-auto">
        <button
          onClick={toggleZenMode}
          className={`p-2 rounded-2xl transition-all duration-150 ${zenMode ? 'text-cyan-600 dark:text-cyan-400 bg-white/40 dark:bg-gray-900/50' : 'text-slate-700 dark:text-slate-200 bg-white/30 dark:bg-slate-900/70'} border border-white/20 dark:border-white/10 shadow-md shadow-sky-500/10 hover:-translate-y-0.5 hover:scale-105`}
          title="Toggle Zen Mode"
        >
          {zenMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
        <button
          onClick={toggle}
          className="p-2 rounded-2xl bg-white/30 dark:bg-slate-900/70 border border-white/20 dark:border-white/10 shadow-md shadow-sky-500/10 text-slate-700 dark:text-slate-200 transition-all duration-150 hover:-translate-y-0.5 hover:scale-105"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5" strokeWidth={3} /> : <Moon className="w-5 h-5" strokeWidth={3} />}
        </button>
      </div>
    </header>
  );
}
