import {
  Building2,
  Users,
  DollarSign,
  Wrench,
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your properties and performance metrics
          </p>
        </div>

        {/* Stats grid - 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Properties"
            value={125}
            change={{ value: 12, type: 'increase' }}
            icon={Building2}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Occupancy Rate"
            value="87%"
            change={{ value: 5, type: 'increase' }}
            icon={Users}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Monthly Revenue"
            value="$45,200"
            change={{ value: 18, type: 'increase' }}
            icon={DollarSign}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-100"
          />
          <StatCard
            title="Pending Maintenance"
            value={5}
            change={{ value: 2, type: 'decrease' }}
            icon={Wrench}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
          />
        </div>

        {/* Charts placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Occupancy Trends
            </h3>
            <div className="h-64 flex items-center justify-center text-slate-400">
              Chart placeholder
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Revenue Overview
            </h3>
            <div className="h-64 flex items-center justify-center text-slate-400">
              Chart placeholder
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
