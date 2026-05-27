import { forwardRef, InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full px-4 py-2.5 rounded-xl border bg-white/40 dark:bg-gray-900/40 backdrop-blur-md text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-all duration-300',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent hover:bg-white/50 dark:hover:bg-gray-800/50',
            error
              ? 'border-red-400/60 focus:ring-red-500 bg-red-50/30 dark:bg-red-900/20'
              : 'border-white/30 dark:border-white/10 hover:border-white/40 dark:hover:border-white/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
