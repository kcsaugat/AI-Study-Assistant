import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef, useState } from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, onClick, ...props }, ref) => {
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

    const handleClick = (e: any) => {
      if (disabled || loading) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newRipple = { x, y, id: Date.now() };
      setRipples((prev) => [...prev, newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);

      if (onClick) onClick(e);
    };

    const base =
      'relative overflow-hidden inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary:
        'bg-gradient-to-r from-[#8b5cf6] to-[#10b981] hover:from-[#7c3aed] hover:to-[#059669] text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.8)] active:shadow-inner shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-white/20',
      secondary:
        'bg-white/10 dark:bg-white/5 backdrop-blur-xl text-brand-700 dark:text-white hover:bg-white/20 dark:hover:bg-white/15 border border-white/40 dark:border-[#10b981]/30 shadow-[0_0_15px_rgba(139,92,246,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]',
      ghost:
        'text-gray-600 hover:bg-gray-100/50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white dark:hover:shadow-[0_0_10px_rgba(139,92,246,0.2)]',
      danger:
        'bg-red-600/80 backdrop-blur-lg border border-red-500/50 text-white hover:bg-red-700 active:bg-red-800 hover:shadow-[0_0_20px_rgba(220,38,38,0.6)]',
      outline:
        'border border-brand-500/50 dark:border-[#8b5cf6]/50 bg-white/5 dark:bg-[#0a0a0f]/50 text-brand-600 hover:bg-brand-500/10 dark:text-[#a78bfa] dark:hover:bg-[#8b5cf6]/20 backdrop-blur-md hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <motion.button
        ref={ref}
        className={clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        disabled={disabled || loading}
        onClick={handleClick}
        whileHover={{ scale: 1.05, y: -4, rotateX: 5 }}
        whileTap={{ scale: 0.92, y: 0, rotateX: 15 }}
        style={{ transformStyle: 'preserve-3d' }}
        {...props}
      >
        {/* Glossy Reflection */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50 pointer-events-none rounded-xl" />
        
        {/* Ripple Effects */}
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute rounded-full bg-white/40 pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 60,
              height: 60,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}

        <span className="relative z-10 flex items-center justify-center gap-2 w-full h-full">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {children as React.ReactNode}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
