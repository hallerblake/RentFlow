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
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm">
      {/* Page Title & Breadcrumb Area */}
      <div className="flex items-center gap-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-0.5">Welcome back, Blake</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center flex-1 max-w-xl mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Search properties, tenants, payments..."
            className="pl-10 pr-16 h-10 bg-white border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border border-slate-300 bg-slate-50 px-2 font-mono text-xs text-slate-600">
            <span>⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Actions & User Menu */}
      <div className="flex items-center gap-2">
        {/* Help Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg hover:bg-slate-100 text-slate-600"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg hover:bg-slate-100 text-slate-600"
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
              className="h-10 gap-2 px-3 rounded-lg hover:bg-slate-100"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="gradient-primary text-white font-semibold text-xs">
                  BH
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-slate-900 leading-none">Blake Haller</span>
                <span className="text-xs text-slate-500 leading-none mt-0.5">Admin</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72 p-2 rounded-lg" align="end" forceMount>
            {/* User Info Header */}
            <div className="flex items-center gap-3 p-3 mb-2 rounded-lg bg-slate-50">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="gradient-primary text-white font-semibold">
                  BH
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">Blake Haller</p>
                <p className="text-xs text-slate-600 truncate flex items-center gap-1 mt-0.5">
                  <Mail className="h-3 w-3" />
                  haller.blake@gmail.com
                </p>
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Company Switcher */}
            <div className="px-2 py-2 mb-1">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Current Company</p>
              <CompanySwitcher />
            </div>

            <DropdownMenuSeparator />

            {/* Menu Items */}
            <DropdownMenuItem className="cursor-pointer p-2.5 rounded-md hover:bg-slate-100">
              <User className="mr-2 h-4 w-4 text-slate-600" />
              <span className="font-medium text-slate-700">My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer p-2.5 rounded-md hover:bg-slate-100">
              <Settings className="mr-2 h-4 w-4 text-slate-600" />
              <span className="font-medium text-slate-700">Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer p-2.5 rounded-md hover:bg-slate-100">
              <HelpCircle className="mr-2 h-4 w-4 text-slate-600" />
              <span className="font-medium text-slate-700">Help & Support</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer p-2.5 rounded-md text-rose-600 hover:text-rose-700 hover:bg-rose-50 focus:text-rose-700 focus:bg-rose-50">
              <LogOut className="mr-2 h-4 w-4" />
              <span className="font-medium">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
