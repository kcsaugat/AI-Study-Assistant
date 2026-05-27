import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  FileText,
  Brain,
  HelpCircle,
  Layers,
  MessageCircle,
  Settings,
  LogOut,
  BookOpen,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/notes', icon: FileText, label: 'My Notes' },
  { to: '/chat', icon: MessageCircle, label: 'AI Tutor' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { user, refreshToken, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch { /* ignore */ }
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className="fixed left-0 top-0 bottom-0 z-30 w-64 bg-white/40 dark:bg-gray-950/40 backdrop-blur-2xl border-r border-white/30 dark:border-white/10 flex flex-col lg:translate-x-0 lg:relative lg:z-auto shadow-2xl"
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">StudyAI</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100'
                  )
                }
              >
                <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 font-semibold text-sm shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-150"
          >
            <LogOut className="w-4.5 h-4.5" size={18} />
            Sign out
          </button>
        </div>
      </motion.aside>
    </>
  );
}
