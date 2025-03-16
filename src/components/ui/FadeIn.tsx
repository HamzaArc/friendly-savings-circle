
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

const FadeIn: React.FC<FadeInProps> = ({
  children,
  className,
  delay = 0,
  duration = 400,
  direction = 'up',
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getDirectionClass = () => {
    switch (direction) {
      case 'up':
        return 'translate-y-4';
      case 'down':
        return '-translate-y-4';
      case 'left':
        return 'translate-x-4';
      case 'right':
        return '-translate-x-4';
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(
        'transition-all',
        isVisible ? 'opacity-100 transform-none' : `opacity-0 ${getDirectionClass()}`,
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

export default FadeIn;
