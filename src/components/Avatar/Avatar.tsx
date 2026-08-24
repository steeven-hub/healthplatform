import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: 'sm' | 'md' | 'lg';
  fallback?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ 
    className, 
    size = 'md',
    fallback = '?',
    src,
    alt,
    ...props 
  }, ref) => {
    const [imageError, setImageError] = React.useState(!src);

    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 font-semibold text-gray-600',
          sizes[size],
          className
        )}
      >
        {!imageError && src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            {...props}
          />
        ) : (
          <span>{fallback}</span>
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

export { Avatar };
