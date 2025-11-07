'use client';

import { Search, Bell, ChevronDown } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
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

          {/* User menu */}
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
        </div>
      </div>
    </header>
  );
}
