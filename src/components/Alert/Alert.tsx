import React from 'react';
import { cn } from '@/lib/utils';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  title?: React.ReactNode;
  description?: React.ReactNode;
  onClose?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ 
    className, 
    variant = 'default', 
    title, 
    description, 
    onClose,
    children,
    ...props 
  }, ref) => {
    const variants = {
      default: 'bg-gray-50 border-gray-200 text-gray-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border p-4',
          variants[variant],
          className
        )}
        {...props}
      >
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            {title && <h3 className="font-semibold mb-1">{title}</h3>}
            {description && <p className="text-sm opacity-90">{description}</p>}
            {children}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Close alert"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';

export { Alert };
