import { HTMLAttributes, ReactNode, useState, MouseEvent } from 'react';
import { clsx } from 'clsx';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export function GlassButton({ children, variant = 'primary', size = 'md', className, onClick, ...props }: GlassButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { x, y, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    if (onClick) onClick(e);
  };

  const variants = {
    primary: 'bg-gradient-to-r from-[#10b981]/80 to-[#0ea5e9]/80 border-white/20 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(14,165,233,0.6)]',
    secondary: 'bg-[#1e1e2d]/60 border-white/10 text-white hover:bg-[#2a2a3c]/80 shadow-[0_0_10px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]',
    danger: 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 hover:border-red-500/50',
    ghost: 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
    icon: 'p-2',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.92, y: 0, rotateX: 10 }}
      onClick={handleClick}
      className={clsx(
        'relative overflow-hidden backdrop-blur-xl border rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        className
      )}
      style={{ transformStyle: 'preserve-3d' }}
      {...props}
    >
      {/* Ripple Container */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute rounded-full bg-white/40 pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 50,
            height: 50,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      
      {/* Glossy reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none rounded-xl" />
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
