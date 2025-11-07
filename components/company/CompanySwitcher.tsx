'use client';

import { Building2, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCompany } from '@/lib/contexts/CompanyContext';
import { cn } from '@/lib/utils';

export function CompanySwitcher() {
  const { selectedCompany, companies, setSelectedCompany, isLoading } = useCompany();

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-indigo-100 animate-pulse shadow-modern">
        <div className="h-10 w-10 rounded-xl bg-indigo-100" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-3.5 bg-indigo-100 rounded-lg w-28" />
          <div className="h-2.5 bg-indigo-50 rounded w-20" />
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-indigo-100 shadow-modern">
        <div className="h-10 w-10 rounded-xl gradient-cyan flex items-center justify-center flex-shrink-0 shadow-md">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-700 truncate">No companies</p>
          <p className="text-xs text-slate-500 truncate">Add a company to get started</p>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 p-3.5 h-auto rounded-2xl bg-white border border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-300 w-full justify-between shadow-modern hover:shadow-modern-md"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-xl gradient-cyan flex items-center justify-center flex-shrink-0 shadow-md">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-bold text-slate-900 truncate">
                {selectedCompany?.name || 'Select company'}
              </p>
              {selectedCompany?.phone && (
                <p className="text-xs text-slate-600 truncate font-medium">{selectedCompany.phone}</p>
              )}
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-indigo-400 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-3 rounded-2xl shadow-modern-xl border-indigo-100" align="start">
        <DropdownMenuLabel className="text-xs font-bold text-indigo-600 uppercase tracking-wider px-3 mb-1">
          Switch Company
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => setSelectedCompany(company)}
            className={cn(
              'flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all duration-200',
              selectedCompany?.id === company.id
                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 shadow-modern'
                : 'hover:bg-indigo-50'
            )}
          >
            <div className="h-10 w-10 rounded-xl gradient-cyan flex items-center justify-center flex-shrink-0 shadow-md">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{company.name}</p>
              {company.phone && (
                <p className="text-xs text-slate-600 truncate font-medium">{company.phone}</p>
              )}
            </div>
            {selectedCompany?.id === company.id && (
              <Check className="h-5 w-5 text-cyan-600 flex-shrink-0 drop-shadow-sm" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
