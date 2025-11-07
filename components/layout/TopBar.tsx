'use client';

import { Bell, Search, User, Settings, HelpCircle, LogOut, Building2, Mail, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CompanySwitcher } from '@/components/company/CompanySwitcher';

export function TopBar() {
  return (
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-slate-200/60 bg-gradient-to-r from-white via-indigo-50/30 to-purple-50/30 backdrop-blur-xl px-8 shadow-modern-md">
      {/* Page Title & Breadcrumb Area */}
      <div className="flex items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold gradient-text-primary tracking-tight">Dashboard</h2>
          <p className="text-sm text-slate-600 mt-1 font-medium">Welcome back, Blake</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center flex-1 max-w-2xl mx-8">
        <div className="relative w-full">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-400" />
          <Input
            type="search"
            placeholder="Search properties, tenants, payments..."
            className="pl-14 pr-20 h-14 bg-white border-indigo-100 focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-2xl text-sm shadow-modern hover:shadow-modern-md transition-all duration-300 font-medium"
          />
          <kbd className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-7 select-none items-center gap-1.5 rounded-lg border border-indigo-200 bg-gradient-to-br from-white to-indigo-50 px-2.5 font-mono text-xs font-semibold text-indigo-600 shadow-sm">
            <span>⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Actions & User Menu */}
      <div className="flex items-center gap-2.5">
        {/* Help Button */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-12 w-12 rounded-2xl hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition-all duration-300 hover:scale-105 shadow-modern hover:shadow-modern-md"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-12 w-12 rounded-2xl hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition-all duration-300 hover:scale-105 shadow-modern hover:shadow-modern-md"
        >
          <Bell className="h-5 w-5" />
          <Badge
            variant="destructive"
            className="absolute -top-1.5 -right-1.5 h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold shadow-md animate-pulse"
          >
            5
          </Badge>
        </Button>

        {/* Divider */}
        <div className="h-10 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent mx-2" />

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-14 gap-3 px-4 rounded-2xl hover:bg-indigo-50 transition-all duration-300 hover:scale-105 shadow-modern hover:shadow-modern-md"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-indigo-200 ring-2 ring-indigo-50 shadow-md">
                  <AvatarFallback className="gradient-primary text-white font-bold text-sm">
                    BH
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-bold text-slate-900 leading-none truncate max-w-[120px]">Blake Haller</span>
                  <span className="text-xs text-indigo-600 leading-none mt-1 font-semibold">Super Admin</span>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 p-3 rounded-2xl shadow-modern-xl border-slate-200/60" align="end" forceMount>
            {/* User Info Header */}
            <div className="flex items-center gap-3 p-4 mb-3 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 border border-indigo-100 shadow-modern">
              <Avatar className="h-14 w-14 border-3 border-white ring-2 ring-indigo-100 shadow-md">
                <AvatarFallback className="gradient-primary text-white font-bold text-base">
                  BH
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">Blake Haller</p>
                <p className="text-xs text-slate-600 truncate flex items-center gap-1.5 mt-1 font-medium">
                  <Mail className="h-3.5 w-3.5 text-indigo-500" />
                  haller.blake@gmail.com
                </p>
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Company Switcher */}
            <div className="px-2 py-2 mb-2">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 px-1">Current Company</p>
              <CompanySwitcher />
            </div>

            <DropdownMenuSeparator className="my-2" />

            {/* Menu Items */}
            <DropdownMenuItem className="cursor-pointer p-3.5 rounded-xl hover:bg-indigo-50 transition-all duration-200">
              <User className="mr-3 h-4 w-4 text-indigo-600" />
              <span className="font-semibold text-slate-700">My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer p-3.5 rounded-xl hover:bg-indigo-50 transition-all duration-200">
              <Settings className="mr-3 h-4 w-4 text-indigo-600" />
              <span className="font-semibold text-slate-700">Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer p-3.5 rounded-xl hover:bg-indigo-50 transition-all duration-200">
              <HelpCircle className="mr-3 h-4 w-4 text-indigo-600" />
              <span className="font-semibold text-slate-700">Help & Support</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuItem className="cursor-pointer p-3.5 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 focus:text-rose-700 focus:bg-rose-50 transition-all duration-200">
              <LogOut className="mr-3 h-4 w-4" />
              <span className="font-semibold">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
