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
  Home,
  TrendingUp,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCompany } from '@/lib/contexts/CompanyContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, badge: null },
  { name: 'Properties', href: '/properties', icon: Building2, badge: null },
  { name: 'Tenants', href: '/tenants', icon: Users, badge: null },
  { name: 'Payments', href: '/payments', icon: DollarSign, badge: '3' },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench, badge: '2' },
  { name: 'SMS', href: '/sms', icon: MessageSquare, badge: null },
  { name: 'Settings', href: '/settings', icon: Settings, badge: null },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { selectedCompany } = useCompany();

  return (
    <aside
      className={cn(
        'flex flex-col bg-white/95 backdrop-blur-xl border-r border-slate-200/60 transition-all duration-300 shadow-modern-lg',
        collapsed ? 'w-20' : 'w-80'
      )}
    >
      {/* Logo Section with Modern Brand */}
      <div className="flex h-20 items-center justify-between px-6 border-b border-slate-200/60 bg-gradient-to-br from-white to-indigo-50/30">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center shadow-modern-lg ring-2 ring-indigo-100">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-cyan-400 rounded-full border-2 border-white shadow-md"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text-primary leading-none tracking-tight">
                RentFlow
              </h1>
              <p className="text-xs text-slate-600 mt-1 font-medium">Property Management</p>
            </div>
          </div>
        ) : (
          <div className="relative mx-auto">
            <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center shadow-modern-lg ring-2 ring-indigo-100">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-cyan-400 rounded-full border-2 border-white shadow-md"></div>
          </div>
        )}
      </div>

      {/* Company/User Info Bar */}
      {!collapsed && selectedCompany && (
        <div className="px-4 py-5 border-b border-slate-200/60 bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-cyan-50/40">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-indigo-100/50 shadow-modern-md hover:shadow-modern-lg transition-all duration-300">
            <div className="h-11 w-11 rounded-xl gradient-cyan flex items-center justify-center flex-shrink-0 shadow-md">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{selectedCompany.name}</p>
              <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="truncate">{selectedCompany.phone || 'No phone'}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-300 relative overflow-hidden',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-modern-lg scale-[1.02]'
                  : 'text-slate-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-900 hover:scale-[1.01]'
              )}
            >
              {/* Active indicator glow */}
              {isActive && !collapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-cyan-400 rounded-r-full shadow-lg shadow-cyan-400/50" />
              )}

              {/* Icon with animation */}
              <div className={cn(
                'relative flex-shrink-0 transition-transform duration-300',
                isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-3'
              )}>
                <item.icon className={cn(
                  "h-5 w-5",
                  isActive ? "drop-shadow-sm" : ""
                )} />
                {item.badge && collapsed && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold shadow-md"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>

              {/* Label */}
              {!collapsed && (
                <span className="flex-1 truncate">{item.name}</span>
              )}

              {/* Badge for non-collapsed view */}
              {!collapsed && item.badge && (
                <Badge
                  variant="destructive"
                  className="ml-auto font-bold shadow-sm px-2 py-0.5"
                >
                  {item.badge}
                </Badge>
              )}

              {/* Animated gradient overlay on hover */}
              {!isActive && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-cyan-500/0 group-hover:from-indigo-500/10 group-hover:via-purple-500/10 group-hover:to-cyan-500/10 transition-all duration-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section - Collapse Toggle */}
      <div className="p-4 border-t border-slate-200/60 bg-gradient-to-br from-slate-50/80 to-indigo-50/30">
        <Button
          variant="outline"
          size={collapsed ? "icon" : "default"}
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full transition-all duration-300 border-indigo-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 hover:text-indigo-900 font-semibold shadow-modern rounded-xl",
            collapsed ? 'h-11 w-11' : ''
          )}
        >
          {collapsed ? (
            <ChevronLeft className="h-5 w-5 rotate-180" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 mr-2" />
              <span>Collapse Menu</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
