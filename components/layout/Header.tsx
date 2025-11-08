'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, ChevronDown, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CompanySwitcher } from '@/components/company/CompanySwitcher';

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/sign-in');
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between h-full px-6">
        {/* Search bar */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search properties, tenants, payments..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* User menu dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">BH</span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-slate-900">Blake Haller</p>
                  <p className="text-xs text-slate-500">Admin</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-3 bg-white border border-slate-200 shadow-lg" align="end">
              {/* User Info Header */}
              <div className="flex items-center gap-3 px-2 py-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">BH</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">Blake Haller</p>
                  <p className="text-xs text-slate-500 truncate">blake@example.com</p>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Company Switcher */}
              <div className="py-2">
                <DropdownMenuLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wide px-2 mb-2">
                  Current Company
                </DropdownMenuLabel>
                <CompanySwitcher />
              </div>

              <DropdownMenuSeparator />

              {/* Menu Items */}
              <Link href="/account">
                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md">
                  <User className="w-4 h-4 text-slate-600" />
                  <span className="text-sm">My Account</span>
                </DropdownMenuItem>
              </Link>

              <Link href="/settings">
                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md">
                  <Settings className="w-4 h-4 text-slate-600" />
                  <span className="text-sm">Settings</span>
                </DropdownMenuItem>
              </Link>

              <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md">
                <HelpCircle className="w-4 h-4 text-slate-600" />
                <span className="text-sm">Help & Support</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
