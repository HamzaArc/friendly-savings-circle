
import { ReactNode } from 'react';
import Header from './Header';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  noHeader?: boolean;
}

const AppShell = ({ 
  children, 
  className, 
  fullWidth = false,
  noHeader = false
}: AppShellProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!noHeader && <Header />}
      <main 
        className={cn(
          'flex-1 pt-24 pb-12',
          className
        )}
      >
        <div className={fullWidth ? 'w-full' : 'container px-6 mx-auto'}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppShell;
