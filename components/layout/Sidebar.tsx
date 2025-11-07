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
        'flex flex-col bg-white border-r border-slate-200 transition-all duration-300 shadow-financial',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Logo Section with Premium Brand */}
      <div className="flex h-20 items-center justify-between px-6 border-b border-slate-200 bg-slate-50/50">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-11 w-11 rounded-xl gradient-navy flex items-center justify-center shadow-financial-lg">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text-navy leading-none">
                RentFlow
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">Property Management</p>
            </div>
          </div>
        ) : (
          <div className="relative mx-auto">
            <div className="h-11 w-11 rounded-xl gradient-navy flex items-center justify-center shadow-financial-lg">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Company/User Info Bar */}
      {!collapsed && selectedCompany && (
        <div className="px-4 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-sm">
            <div className="h-10 w-10 rounded-lg gradient-emerald flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{selectedCompany.name}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {selectedCompany.phone || 'No phone'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 relative',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'bg-slate-900 text-white shadow-financial-lg'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              {/* Active indicator bar */}
              {isActive && !collapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full" />
              )}

              {/* Icon with subtle animation */}
              <div className={cn(
                'relative flex-shrink-0 transition-transform duration-200',
                !isActive && 'group-hover:scale-110'
              )}>
                <item.icon className="h-5 w-5" />
                {item.badge && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>

              {/* Label */}
              {!collapsed && (
                <span className="flex-1">{item.name}</span>
              )}

              {/* Badge for non-collapsed view */}
              {!collapsed && item.badge && (
                <Badge variant="destructive" className="ml-auto font-semibold">
                  {item.badge}
                </Badge>
              )}

              {/* Subtle hover accent */}
              {!isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-emerald-500/0 group-hover:from-blue-500/5 group-hover:to-emerald-500/5 transition-all duration-300" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section - Collapse Toggle */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <Button
          variant="outline"
          size={collapsed ? "icon" : "default"}
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full transition-all duration-300 border-slate-300 hover:bg-slate-100 hover:border-slate-400",
            collapsed ? 'h-11 w-11' : ''
          )}
        >
          {collapsed ? (
            <ChevronLeft className="h-5 w-5 rotate-180" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 mr-2" />
              <span className="font-medium">Collapse Menu</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
