'use client';

import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewToggleProps {
  view: 'card' | 'table';
  onViewChange: (view: 'card' | 'table') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
      <Button
        variant={view === 'card' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('card')}
        className={`h-8 px-3 ${
          view === 'card'
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <LayoutGrid className="w-4 h-4 mr-1.5" />
        Cards
      </Button>
      <Button
        variant={view === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('table')}
        className={`h-8 px-3 ${
          view === 'table'
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <List className="w-4 h-4 mr-1.5" />
        Rows
      </Button>
    </div>
  );
}
