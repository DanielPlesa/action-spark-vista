
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Menu, X, LogOut } from 'lucide-react';
import { useAnimation } from '@/utils/animations';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onNewTask: () => void;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onNewTask, toggleSidebar, isSidebarOpen }) => {
  const animated = useAnimation(100);
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const { signOut, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`w-full py-4 px-6 flex items-center justify-between fixed top-0 left-0 right-0 z-10 transition-all duration-300 ${
        scrolled ? 'bg-white bg-opacity-80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="mr-2"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
        <h1 
          className={`text-xl font-medium transition-opacity duration-300 ${
            animated ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Tasks
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          onClick={onNewTask} 
          className={`transition-all duration-300 hover:shadow-md ${
            animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {!isMobile && 'New Task'}
        </Button>
        
        <Button 
          variant="outline"
          onClick={signOut}
          className={`transition-all duration-300 ${
            animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!isMobile && 'Sign Out'}
        </Button>
      </div>
    </header>
  );
};

export default Header;
