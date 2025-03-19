
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  FileText,
  Video,
  Headphones,
  Folder,
  Tag,
  Settings,
  HelpCircle,
  X,
  GraduationCap,
  Upload,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

type SidebarProps = {
  isOpen: boolean;
  closeSidebar: () => void;
};

type NavItemProps = {
  to: string;
  icon: React.ElementType;
  label: string;
};

const NavItem = ({ to, icon: Icon, label }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 group',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )
      }
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium transition-all">{label}</span>
    </NavLink>
  );
};

const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
  const isMobile = useIsMobile();

  return (
    <>
      {/* Overlay when mobile sidebar is open */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 z-50 w-[280px] bg-card border-r transition-transform duration-300 ease-in-out',
          isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0',
          'lg:left-0 lg:z-30'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-primary flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">Learning Hub</span>
          </div>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={closeSidebar}
              className="lg:hidden"
              aria-label="Close Sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)] px-3 py-2 subtle-scroll">
          <div className="space-y-6">
            <nav className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground px-3 py-1 font-medium">Dashboard</p>
              <NavItem to="/" icon={Home} label="Home" />
              <NavItem to="/recently-viewed" icon={FileText} label="Recently Viewed" />
              <NavItem to="/upload" icon={Upload} label="Upload Content" />
            </nav>

            <nav className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground px-3 py-1 font-medium">Content Library</p>
              <NavItem to="/videos" icon={Video} label="Videos" />
              <NavItem to="/audio" icon={Headphones} label="Audio" />
              <NavItem to="/documents" icon={FileText} label="Documents" />
              <NavItem to="/collections" icon={Folder} label="Collections" />
              <NavItem to="/tags" icon={Tag} label="Tags" />
            </nav>

            <nav className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground px-3 py-1 font-medium">Integration</p>
              <NavItem to="/lti-configuration" icon={Share2} label="LTI Configuration" />
            </nav>

            <nav className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground px-3 py-1 font-medium">System</p>
              <NavItem to="/settings" icon={Settings} label="Settings" />
              <NavItem to="/help" icon={HelpCircle} label="Help & Support" />
            </nav>
          </div>
        </ScrollArea>
      </aside>
    </>
  );
};

export default Sidebar;
