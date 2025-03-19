
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from './Header';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

type PageLayoutProps = {
  children: React.ReactNode;
};

const PageLayout = ({ children }: PageLayoutProps) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 ease-in-out",
        !isMobile && sidebarOpen ? 'lg:ml-[280px]' : 'ml-0'
      )}>
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 animate-in">
          <div className="container px-4 py-6 md:px-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageLayout;
