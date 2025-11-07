'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2,
  Users,
  DollarSign,
  Wrench,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Calendar,
  ArrowUpRight,
  Clock,
  Activity,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/StatCard';

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
        {/* Header Skeleton */}
        <div>
          <div className="h-8 bg-slate-200 rounded w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-slate-100 rounded w-64 animate-pulse" />
        </div>

        {/* Metrics Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse min-h-[140px]">
              <div className="h-10 w-10 bg-slate-100 rounded-lg mb-4" />
              <div className="h-4 bg-slate-100 rounded w-20 mb-2" />
              <div className="h-8 bg-slate-100 rounded w-24" />
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
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-sm text-slate-600 mt-1">Track your properties and performance metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Properties"
          value={stats.metrics.properties}
          icon={Building2}
          variant="blue"
          trend={{ value: '12%', isPositive: true }}
          description="Active listings"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${occupancyRate}%`}
          icon={Users}
          variant="teal"
          trend={{ value: '5%', isPositive: true }}
          description={`${stats.metrics.occupied} of ${stats.metrics.properties} occupied`}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(stats.metrics.revenue / 1000).toFixed(1)}k`}
          icon={DollarSign}
          variant="emerald"
          trend={{ value: '8%', isPositive: true }}
          description="Total collections"
        />
        <StatCard
          title="Maintenance"
          value={stats.metrics.maintenance}
          icon={Wrench}
          variant="amber"
          trend={stats.metrics.urgentMaintenance > 0 ? { value: `${stats.metrics.urgentMaintenance} urgent`, isPositive: false } : undefined}
          description="Open requests"
        />
      </div>

      {/* Activity Timeline & Upcoming Payments */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity - 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Recent Activity
              </h3>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm">
                View All
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {stats.recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No recent activity</p>
                  <p className="text-sm text-slate-400 mt-1">Activity will appear here</p>
                </div>
              ) : (
                stats.recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="relative flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'payment'
                          ? 'bg-emerald-500'
                          : 'bg-teal-500'
                      }`}>
                        {activity.type === 'payment' ? (
                          <CheckCircle className="h-4 w-4 text-white" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-white" />
                        )}
                      </div>
                      {index < stats.recentActivity.length - 1 && (
                        <div className="w-px h-10 bg-slate-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm font-medium text-slate-900 truncate">{activity.message}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <p className="text-xs text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Payments - 1 column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Upcoming Payments
            </h3>
            <div className="space-y-3">
              {stats.upcomingPayments.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm font-medium">No upcoming payments</p>
                </div>
              ) : (
                stats.upcomingPayments.map((payment) => (
                  <div key={payment.id} className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-slate-900 truncate">{payment.tenant}</p>
                      <Badge className="bg-emerald-100 text-emerald-700 font-semibold text-xs px-2 h-5">
                        ${payment.amount.toLocaleString()}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 truncate">{payment.property}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <p className="text-xs text-slate-500">Due {payment.dueDate}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Revenue Trend
              </h3>
              <p className="text-sm text-slate-500 mt-1">Last 6 months</p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 font-semibold text-xs px-2 h-6">+12%</Badge>
          </div>
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Chart visualization</p>
              <p className="text-sm text-slate-400 mt-1">Coming soon</p>
            </div>
          </div>
        </div>

        {/* Occupancy Chart */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-teal-600" />
                Occupancy Rate
              </h3>
              <p className="text-sm text-slate-500 mt-1">Property utilization</p>
            </div>
            <Badge className="bg-teal-100 text-teal-700 font-semibold text-xs px-2 h-6">{occupancyRate}%</Badge>
          </div>
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-center">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Occupancy analytics</p>
              <p className="text-sm text-slate-400 mt-1">Coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
