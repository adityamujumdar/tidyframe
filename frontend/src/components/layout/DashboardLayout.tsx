import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Upload,
  Activity,
  FileText,
  BarChart3,
  User,
  LogOut,
  Settings,
  Menu,
  Key,
  Shield,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { PARSE_LIMITS } from '@/config/constants';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Upload Files',
    href: '/dashboard/upload',
    icon: Upload,
  },
  {
    title: 'Processing',
    href: '/dashboard/processing',
    icon: Activity,
  },
  {
    title: 'Results',
    href: '/dashboard/results',
    icon: FileText,
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    title: 'API Keys',
    href: '/dashboard/api-keys',
    icon: Key,
  },
  {
    title: 'Billing',
    href: '/dashboard/billing',
    icon: CreditCard,
  },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          className="fixed top-4 left-4 z-modal"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-sidebar w-64 bg-primary/30 border-r transition-transform duration-slow ease-apple lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center border-b px-6">
              <Link to="/" className="flex items-center space-x-2">
                <img src="/logo-with-name.png" alt="TidyFrame" className="h-8 w-auto" />
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 px-4 py-6">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center space-x-3 rounded-md px-3 py-2 text-base font-medium transition-colors',
                      isActive
                        ? 'bg-primary/30 text-primary font-semibold border-l-4 border-primary'
                        : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
              
              {/* Admin Panel Link for Enterprise Users */}
              {user?.plan === 'enterprise' && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-3 rounded-md px-3 py-2 text-base font-medium transition-colors text-muted-foreground hover:bg-primary/10 hover:text-primary border border-dashed border-muted-foreground/50"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </nav>

            {/* User Menu */}
            <div className="border-t p-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user?.fullName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">
                        {user?.fullName || user?.email || 'User'}
                      </span>
                      <span className="text-caption text-muted-foreground capitalize">
                        {user?.plan || 'loading'} Plan
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/api-keys" className="cursor-pointer">
                      <Key className="mr-2 h-4 w-4" />
                      <span>API Keys</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-64">
          {/* Top bar */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="lg:hidden" /> {/* Spacer for mobile */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  {user?.parsesThisMonth || 0} / {user?.plan === 'enterprise' ? '∞' : PARSE_LIMITS.STANDARD.toLocaleString()} parses this month
                </span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-overlay bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}