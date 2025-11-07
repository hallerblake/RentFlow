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
        <div className="h-8 w-8 rounded-lg bg-slate-100" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="h-3 bg-slate-100 rounded w-24" />
          <div className="h-2.5 bg-slate-50 rounded w-16" />
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200">
        <div className="h-8 w-8 rounded-lg gradient-teal flex items-center justify-center flex-shrink-0">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700 truncate">No companies</p>
          <p className="text-xs text-slate-500 truncate">Add a company</p>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 p-2 h-auto rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 w-full justify-between"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="h-8 w-8 rounded-lg gradient-teal flex items-center justify-center flex-shrink-0">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {selectedCompany?.name || 'Select company'}
              </p>
              {selectedCompany?.phone && (
                <p className="text-xs text-slate-600 truncate">{selectedCompany.phone}</p>
              )}
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 p-2 rounded-lg" align="start">
        <DropdownMenuLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wide px-2 mb-1">
          Switch Company
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => setSelectedCompany(company)}
            className={cn(
              'flex items-center gap-2 p-2 rounded-md cursor-pointer',
              selectedCompany?.id === company.id
                ? 'bg-blue-50 border border-blue-100'
                : 'hover:bg-slate-100'
            )}
          >
            <div className="h-8 w-8 rounded-lg gradient-teal flex items-center justify-center flex-shrink-0">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{company.name}</p>
              {company.phone && (
                <p className="text-xs text-slate-600 truncate">{company.phone}</p>
              )}
            </div>
            {selectedCompany?.id === company.id && (
              <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
