import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    success: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
