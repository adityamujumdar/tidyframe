import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    // Initialize from localStorage or system preference
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    // Apply dark mode class to document root
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <nav className="sticky top-0 z-sticky border-b border-border bg-background/98 backdrop-blur-lg supports-[backdrop-filter]:bg-background/95 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo-with-name.png" alt="TidyFrame" className="h-50 md:h-54" />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="px-3 py-2 text-base font-semibold transition-colors hover:text-primary">
              Home
            </Link>
            <Link to="/pricing" className="px-3 py-2 text-base font-semibold transition-colors hover:text-primary">
              Pricing
            </Link>
            <Link to="/docs" className="px-3 py-2 text-base font-semibold transition-colors hover:text-primary">
              API Docs
            </Link>
            <Link to="/contact" className="px-3 py-2 text-base font-semibold transition-colors hover:text-primary">
              Contact
            </Link>
          </div>

          {/* Theme Toggle & Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button 
                  variant="ghost" 
                  onClick={logout}
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/auth/register">
                  <Button variant="prominent">Subscribe Now</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}