import { Outlet, NavLink } from 'react-router-dom';
import {
  Users,
  LayoutDashboard,
  Target,
  Settings,
  Mail,
  TrendingUp,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import OrganizationSwitcher from './OrganizationSwitcher';
import { useState, useRef, useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Candidates', href: '/candidates', icon: Users },
  { name: 'Campaigns', href: '/campaigns', icon: Target },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Layout() {
  const { user, signOut } = useAuth();
  const { userRole } = useOrganization();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/auth/login';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex w-64 flex-col">
          <div className="flex min-h-0 flex-1 flex-col bg-white border-r">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              {/* Logo */}
              <div className="flex items-center flex-shrink-0 px-4 mb-6">
                <div className="flex items-center gap-2">
                  <Mail className="h-8 w-8 text-purple-600" />
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                    Recruitment Engine
                  </span>
                </div>
              </div>

              {/* Organization Switcher */}
              <div className="px-2 mb-4">
                <OrganizationSwitcher />
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1 px-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          isActive
                            ? 'bg-purple-50 text-purple-900 border-purple-500 border-l-4'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent border-l-4',
                          'group flex items-center px-2 py-2 text-sm font-medium'
                        )
                      }
                    >
                      <Icon
                        className={cn(
                          'mr-3 h-5 w-5 flex-shrink-0',
                          'text-gray-400 group-hover:text-gray-500'
                        )}
                      />
                      {item.name}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex flex-shrink-0 border-t p-4">
              <div className="relative w-full" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-full flex items-center justify-between hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.user_metadata?.full_name || user?.email}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {userRole}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                </button>

                {userMenuOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <button
                      onClick={() => {
                        window.location.href = '/settings';
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                    >
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Settings</span>
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}