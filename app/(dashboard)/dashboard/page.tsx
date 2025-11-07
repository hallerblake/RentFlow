'use client';

import { useEffect, useState } from 'react';
import {
  Building2,
  Users,
  DollarSign,
  Wrench,
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';

type DashboardStats = {
  metrics: {
    properties: number;
    occupied: number;
    revenue: number;
    maintenance: number;
    urgentMaintenance: number;
  };
  upcomingPayments: Array<{
    id: string;
    tenant: string;
    property: string;
    amount: number;
    dueDate: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    time: string;
  }>;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Page header skeleton */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="h-8 bg-slate-200 rounded w-48 mb-2 animate-pulse" />
            <div className="h-4 bg-slate-100 rounded w-64 animate-pulse" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-pulse">
                <div className="h-12 w-12 bg-slate-100 rounded-lg mb-4" />
                <div className="h-4 bg-slate-100 rounded w-20 mb-2" />
                <div className="h-8 bg-slate-100 rounded w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const occupancyRate = stats.metrics.properties > 0
    ? Math.round((stats.metrics.occupied / stats.metrics.properties) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your properties and performance metrics
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Properties"
            value={stats.metrics.properties}
            change={{ value: 12, type: 'increase' }}
            icon={Building2}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Occupancy Rate"
            value={`${occupancyRate}%`}
            change={{ value: 5, type: 'increase' }}
            icon={Users}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${(stats.metrics.revenue / 1000).toFixed(1)}k`}
            change={{ value: 18, type: 'increase' }}
            icon={DollarSign}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-100"
          />
          <StatCard
            title="Pending Maintenance"
            value={stats.metrics.maintenance}
            change={stats.metrics.urgentMaintenance > 0 ? { value: stats.metrics.urgentMaintenance, type: 'decrease' } : undefined}
            icon={Wrench}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
          />
        </div>
      </div>
    </div>
  );
}
