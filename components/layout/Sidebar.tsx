'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  DollarSign,
  Wrench,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Properties', href: '/properties', icon: Building2 },
  { name: 'Tenants', href: '/tenants', icon: Users },
  { name: 'Payments', href: '/payments', icon: DollarSign },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'SMS', href: '/sms', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col glass border-r border-white/20 transition-all duration-300 shadow-premium-lg',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo Section */}
      <div className="flex h-20 items-center justify-between px-5 border-b border-white/20">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Home className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">
              RentFlow
            </span>
          </div>
        )}
        {collapsed && (
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg mx-auto">
            <Home className="h-6 w-6 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-white/60 hover:shadow-md'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse opacity-20" />
              )}

              {/* Icon */}
              <div className={cn(
                'relative z-10 h-5 w-5 flex-shrink-0 transition-transform duration-300',
                !isActive && 'group-hover:scale-110'
              )}>
                <item.icon className="h-5 w-5" />
              </div>

              {/* Label */}
              {!collapsed && (
                <span className="relative z-10">{item.name}</span>
              )}

              {/* Hover effect */}
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle Button */}
      <div className="p-4 border-t border-white/20">
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full bg-white/50 hover:bg-white/70 transition-all duration-300 shadow-md hover:shadow-lg",
            collapsed ? 'h-10 w-10' : ''
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
