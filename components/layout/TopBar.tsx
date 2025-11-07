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
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-sm px-8 shadow-sm">
      {/* Page Title & Breadcrumb Area */}
      <div className="flex items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">Welcome back, Blake</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center flex-1 max-w-xl mx-8">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Search properties, tenants, payments..."
            className="pl-12 pr-4 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-300 rounded-xl text-sm transition-all duration-200"
          />
          <kbd className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border border-slate-200 bg-white px-2 font-mono text-[10px] font-medium text-slate-500">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Actions & User Menu */}
      <div className="flex items-center gap-3">
        {/* Help Button */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-11 w-11 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-11 w-11 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <Bell className="h-5 w-5" />
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold"
          >
            5
          </Badge>
        </Button>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200 mx-2" />

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-12 gap-3 px-3 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border-2 border-slate-200">
                  <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white font-semibold text-sm">
                    BH
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold text-slate-900 leading-none">Blake Haller</span>
                  <span className="text-xs text-slate-500 leading-none mt-1">Super Admin</span>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72 p-2" align="end" forceMount>
            {/* User Info Header */}
            <div className="flex items-center gap-3 p-3 mb-2 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-100">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white font-semibold">
                  BH
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">Blake Haller</p>
                <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  haller.blake@gmail.com
                </p>
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Company Switcher */}
            <div className="px-3 py-2 mb-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Current Company</p>
              <CompanySwitcher />
            </div>

            <DropdownMenuSeparator />

            {/* Menu Items */}
            <DropdownMenuItem className="cursor-pointer p-3 rounded-lg">
              <User className="mr-3 h-4 w-4 text-slate-600" />
              <span className="font-medium">My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer p-3 rounded-lg">
              <Settings className="mr-3 h-4 w-4 text-slate-600" />
              <span className="font-medium">Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer p-3 rounded-lg">
              <HelpCircle className="mr-3 h-4 w-4 text-slate-600" />
              <span className="font-medium">Help & Support</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer p-3 rounded-lg text-red-600 focus:text-red-700 focus:bg-red-50">
              <LogOut className="mr-3 h-4 w-4" />
              <span className="font-medium">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
