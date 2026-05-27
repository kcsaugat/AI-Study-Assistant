import { Menu, Sun, Moon, Bell } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
}

export function TopBar({ onMenuClick, title = '' }: TopBarProps) {
  const { isDark, toggle } = useThemeStore();

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-white/80 dark:bg-slate-950/90 border-b border-gray-100/80 dark:border-gray-800/80 backdrop-blur-xl shadow-sm shadow-cyan-500/10 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-2xl text-slate-600 dark:text-slate-200 bg-white/40 dark:bg-gray-900/50 border border-white/20 dark:border-white/10 shadow-lg shadow-cyan-500/10 lg:hidden transition-all duration-300 hover:-translate-y-0.5 hover:scale-105"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && (
          <h1 className="text-lg font-semibold tracking-wide text-slate-900 dark:text-white hidden sm:block">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="p-2 rounded-2xl bg-white/30 dark:bg-slate-900/70 border border-white/20 dark:border-white/10 shadow-md shadow-sky-500/10 text-slate-700 dark:text-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
