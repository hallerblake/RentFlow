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
        'flex flex-col bg-white border-r border-slate-200 transition-all duration-300 shadow-sm',
        collapsed ? 'w-20' : 'w-[280px]'
      )}
    >
      {/* Logo Section - Clean Professional */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">
                RentFlow
              </h1>
              <p className="text-xs text-slate-500 mt-1">Property Management</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Company Info Section */}
      {!collapsed && selectedCompany && (
        <div className="px-4 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
            <div className="h-10 w-10 rounded-lg gradient-teal flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{selectedCompany.name}</p>
              <p className="text-xs text-slate-600 truncate mt-0.5">
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
                'group flex items-center gap-3 rounded-lg px-3 h-11 text-sm font-medium transition-all duration-200',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              {/* Icon */}
              <div className="relative flex-shrink-0">
                <item.icon className="h-5 w-5" />
                {item.badge && collapsed && (
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
                <span className="flex-1 truncate">{item.name}</span>
              )}

              {/* Badge for non-collapsed view */}
              {!collapsed && item.badge && (
                <Badge
                  variant="destructive"
                  className="ml-auto font-semibold text-xs px-2 h-5"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section - Collapse Toggle */}
      <div className="p-4 border-t border-slate-200">
        <Button
          variant="outline"
          size={collapsed ? "icon" : "default"}
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full transition-all duration-200 border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg",
            collapsed ? 'h-10 w-10' : ''
          )}
        >
          {collapsed ? (
            <ChevronLeft className="h-5 w-5 rotate-180" />
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
