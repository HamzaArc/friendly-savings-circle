
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu, X, Plus, Home, Users, BarChart3 } from 'lucide-react';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Close menu when changing routes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Groups', path: '/groups', icon: Users },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'glass-morphism py-3' : 'py-5 bg-transparent'
      )}
    >
      <div className="container px-6 mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xl font-display font-semibold tracking-tight"
        >
          <div className="rounded-lg bg-primary h-8 w-8 flex items-center justify-center">
            <span className="text-white font-bold">T</span>
          </div>
          <span>Tontine</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary',
                isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon size={16} />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/create-group">
              <Plus size={16} className="mr-1.5" />
              New Group
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 md:hidden text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed inset-x-0 top-[57px] bg-white/90 backdrop-blur-lg md:hidden transition-all duration-300 transform border-b border-gray-100',
          menuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        )}
      >
        <div className="container px-6 mx-auto py-6 flex flex-col gap-6">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 py-2 text-sm font-medium transition-colors',
                  isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            ))}
          </nav>
          <Button asChild size="sm">
            <Link to="/create-group" className="flex items-center gap-2">
              <Plus size={16} />
              Create New Group
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
