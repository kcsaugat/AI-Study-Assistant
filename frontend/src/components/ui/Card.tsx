import { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { motion, HTMLMotionProps } from 'framer-motion';
import Tilt from 'react-parallax-tilt';

interface CardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export function Card({ children, hover, padding = 'md', className, ...props }: CardProps) {
  const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };
  
  const content = (
    <motion.div
      whileHover={hover ? { scale: 1.03, y: -8 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={clsx(
        'bg-[#0a0a0f]/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-colors duration-300 h-full',
        paddings[padding],
        hover &&
          'hover:bg-[#101018]/50 hover:border-white/20 cursor-pointer hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]',
        'neon-card',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );

  if (hover) {
    return (
      <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} glareEnable={true} glareMaxOpacity={0.15} glareColor="#10b981" glarePosition="all" transitionSpeed={1500} scale={1.02} className="h-full">
        {content}
      </Tilt>
    );
  }
  return content;
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={clsx('text-base font-semibold text-gray-900 dark:text-white', className)}>
      {children}
    </h3>
  );
}
