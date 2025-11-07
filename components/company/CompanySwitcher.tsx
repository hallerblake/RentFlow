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
      <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 animate-pulse">
        <div className="h-8 w-8 rounded-lg bg-slate-200" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-3 bg-slate-200 rounded w-24" />
          <div className="h-2 bg-slate-200 rounded w-16" />
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200">
        <div className="h-8 w-8 rounded-lg gradient-emerald flex items-center justify-center flex-shrink-0">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-600">No companies</p>
          <p className="text-xs text-slate-500">Add a company to get started</p>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 p-2 h-auto rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors w-full justify-between"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="h-8 w-8 rounded-lg gradient-emerald flex items-center justify-center flex-shrink-0">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-slate-900 truncate">
                {selectedCompany?.name || 'Select company'}
              </p>
              {selectedCompany?.phone && (
                <p className="text-xs text-slate-500 truncate">{selectedCompany.phone}</p>
              )}
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 p-2" align="start">
        <DropdownMenuLabel className="text-xs font-medium text-slate-500 uppercase tracking-wider px-2">
          Switch Company
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => setSelectedCompany(company)}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg cursor-pointer',
              selectedCompany?.id === company.id && 'bg-slate-100'
            )}
          >
            <div className="h-9 w-9 rounded-lg gradient-emerald flex items-center justify-center flex-shrink-0">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{company.name}</p>
              {company.phone && (
                <p className="text-xs text-slate-500 truncate">{company.phone}</p>
              )}
            </div>
            {selectedCompany?.id === company.id && (
              <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
