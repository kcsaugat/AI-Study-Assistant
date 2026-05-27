import { forwardRef, TextareaHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={clsx(
            'w-full px-4 py-3 rounded-xl border bg-white/40 dark:bg-gray-900/40 backdrop-blur-md text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none transition-all duration-300',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent hover:bg-white/50 dark:hover:bg-gray-800/50',
            error
              ? 'border-red-400/60 focus:ring-red-500 bg-red-50/30 dark:bg-red-900/20'
              : 'border-white/30 dark:border-white/10 hover:border-white/40 dark:hover:border-white/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
