'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  DollarSign,
  Wrench,
  MessageSquare,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Properties', href: '/properties', icon: Building2 },
  { name: 'Tenants', href: '/tenants', icon: Users },
  { name: 'Payments', href: '/payments', icon: DollarSign, badge: 3 },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench, badge: 2 },
  { name: 'SMS', href: '/sms', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen w-64 bg-white border-r border-slate-200">
      {/* Logo/Brand */}
      <div className="flex items-center h-16 px-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">RF</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">RentFlow</h1>
            <p className="text-xs text-slate-500">Property Management</p>
          </div>
        </div>
      </div>

      {/* Company section */}
      <div className="px-4 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              Haller Properties
            </p>
            <p className="text-xs text-slate-500">555-0200</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-600 text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
