import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
}

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100',
}: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Icon with colored background */}
      <div className="flex items-start justify-between mb-4">
        <div className={`${iconBgColor} ${iconColor} p-3 rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-slate-600 mb-1">
        {title}
      </p>

      {/* Big bold value */}
      <p className="text-3xl font-bold text-slate-900 mb-3">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>

      {/* Trend indicator */}
      {change && (
        <div className="flex items-center gap-1.5 text-sm">
          {change.type === 'increase' ? (
            <>
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-medium">
                +{change.value}%
              </span>
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-red-600 font-medium">
                -{change.value}%
              </span>
            </>
          )}
          <span className="text-slate-500">from last month</span>
        </div>
      )}
    </div>
  );
}
