import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  description?: string;
  variant?: 'blue' | 'teal' | 'emerald' | 'amber' | 'rose';
}

const variantStyles = {
  blue: {
    icon: 'bg-blue-500',
    trend: 'text-blue-600',
    badge: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  teal: {
    icon: 'bg-teal-500',
    trend: 'text-teal-600',
    badge: 'bg-teal-50 text-teal-700 border-teal-100',
  },
  emerald: {
    icon: 'bg-emerald-500',
    trend: 'text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  amber: {
    icon: 'bg-amber-500',
    trend: 'text-amber-600',
    badge: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  rose: {
    icon: 'bg-rose-500',
    trend: 'text-rose-600',
    badge: 'bg-rose-50 text-rose-700 border-rose-100',
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  variant = 'blue',
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200 min-h-[140px] flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', styles.icon)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend && (
          <div
            className={cn(
              'text-xs font-semibold px-2 py-1 rounded border',
              trend.isPositive ? styles.badge : 'bg-slate-50 text-slate-700 border-slate-200'
            )}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </div>
        )}
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
      </div>
    </div>
  );
}
