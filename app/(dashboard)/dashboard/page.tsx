'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, DollarSign, Wrench, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="financial-card p-6 animate-pulse">
              <div className="h-24 bg-slate-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const occupancyRate = stats.metrics.properties > 0
    ? Math.round((stats.metrics.occupied / stats.metrics.properties) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Properties */}
        <div className="metric-card group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Properties</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.metrics.properties}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span className="text-sm text-emerald-600 font-medium">{stats.metrics.occupied} occupied</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-xl gradient-navy flex items-center justify-center shadow-financial-lg group-hover:scale-110 transition-transform duration-200">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="metric-card group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Occupancy Rate</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{occupancyRate}%</p>
              <p className="text-sm text-slate-500 mt-2">{stats.metrics.occupied} of {stats.metrics.properties} units</p>
            </div>
            <div className="h-12 w-12 rounded-xl gradient-emerald flex items-center justify-center shadow-financial-lg group-hover:scale-110 transition-transform duration-200">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="metric-card group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Monthly Revenue</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                ${stats.metrics.revenue.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span className="text-sm text-emerald-600 font-medium">+12% from last month</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-xl gradient-gold flex items-center justify-center shadow-financial-lg group-hover:scale-110 transition-transform duration-200">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="metric-card group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending Maintenance</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.metrics.maintenance}</p>
              <p className="text-sm text-amber-600 font-medium mt-2">
                {stats.metrics.urgentMaintenance} urgent items
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl gradient-slate flex items-center justify-center shadow-financial-lg group-hover:scale-110 transition-transform duration-200">
              <Wrench className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Upcoming Payments */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <div className="financial-card-elevated p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'payment'
                    ? 'bg-emerald-100'
                    : 'bg-blue-100'
                }`}>
                  {activity.type === 'payment' ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Payments */}
        <div className="financial-card-elevated p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Payments</h3>
          <div className="space-y-3">
            {stats.upcomingPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{payment.tenant}</p>
                  <p className="text-xs text-slate-500 truncate">{payment.property}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-bold text-emerald-600">${payment.amount.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">{payment.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="financial-card-elevated p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Revenue Trend</h3>
        <p className="text-sm text-slate-500 mb-6">Last 6 months</p>
        <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
          <p className="text-slate-400 text-sm">Chart visualization coming soon...</p>
        </div>
      </div>
    </div>
  );
}
