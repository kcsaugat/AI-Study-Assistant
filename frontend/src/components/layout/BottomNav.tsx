import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, MessageCircle, Layers } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/notes', icon: FileText, label: 'Notes' },
  { to: '/flashcards', icon: Layers, label: 'Cards' },
  { to: '/chat', icon: MessageCircle, label: 'AI Tutor' },
];

export function BottomNav() {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/85 dark:bg-gray-950/85 backdrop-blur-3xl border-t border-gray-200/50 dark:border-white/10 pt-2 pb-5 px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
      <nav className="flex items-center justify-around">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center w-16 py-1 gap-1 rounded-xl transition-all duration-200 relative',
                isActive
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon className={clsx("w-6 h-6", isActive && "fill-brand-500/20")} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-indicator"
                      className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-brand-500"
                    />
                  )}
                </div>
                <span className={clsx("text-[10px] font-medium mt-1", isActive && "font-bold")}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
