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
  Plus,
  Send,
  FileText,
  Calendar,
  ArrowUpRight,
  Clock,
  Activity,
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
      <div className="space-y-8">
        {/* Hero Skeleton */}
        <div className="rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 p-8 animate-pulse">
          <div className="h-8 bg-indigo-200 rounded-lg w-64 mb-4" />
          <div className="h-6 bg-indigo-100 rounded-lg w-96" />
        </div>

        {/* Metrics Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="modern-card p-6 animate-pulse">
              <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl" />
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
    <div className="space-y-8 pb-8">
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 p-8 shadow-modern-xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Welcome back, Blake! 👋
              </h1>
              <p className="text-indigo-100 text-lg">
                Here's what's happening with your properties today
              </p>
            </div>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm shadow-lg">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Tour
            </Button>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.metrics.properties}</p>
                  <p className="text-sm text-indigo-100">Properties</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{occupancyRate}%</p>
                  <p className="text-sm text-indigo-100">Occupancy</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">${(stats.metrics.revenue / 1000).toFixed(1)}k</p>
                  <p className="text-sm text-indigo-100">Revenue</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.metrics.maintenance}</p>
                  <p className="text-sm text-indigo-100">Maintenance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-indigo-600" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-modern-lg hover:shadow-modern-xl transition-all hover:scale-105 flex flex-col gap-2">
            <Plus className="h-6 w-6" />
            <span className="font-semibold">Add Property</span>
          </Button>
          <Button className="h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-modern-lg hover:shadow-modern-xl transition-all hover:scale-105 flex flex-col gap-2">
            <Users className="h-6 w-6" />
            <span className="font-semibold">Add Tenant</span>
          </Button>
          <Button className="h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-modern-lg hover:shadow-modern-xl transition-all hover:scale-105 flex flex-col gap-2">
            <Send className="h-6 w-6" />
            <span className="font-semibold">Send SMS</span>
          </Button>
          <Button className="h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-modern-lg hover:shadow-modern-xl transition-all hover:scale-105 flex flex-col gap-2">
            <FileText className="h-6 w-6" />
            <span className="font-semibold">Generate Report</span>
          </Button>
        </div>
      </div>

      {/* Activity Timeline & Upcoming Payments */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity - 2 columns */}
        <div className="lg:col-span-2">
          <div className="modern-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-600" />
                Recent Activity
              </h3>
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                View All
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-4">
              {stats.recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No recent activity</p>
                  <p className="text-sm text-slate-400 mt-1">Activity will appear here</p>
                </div>
              ) : (
                stats.recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300 group">
                    {/* Timeline Line */}
                    <div className="relative flex flex-col items-center">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transition-all duration-300 group-hover:scale-110 ${
                        activity.type === 'payment'
                          ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                          : 'bg-gradient-to-br from-cyan-400 to-cyan-600'
                      }`}>
                        {activity.type === 'payment' ? (
                          <CheckCircle className="h-5 w-5 text-white" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-white" />
                        )}
                      </div>
                      {index < stats.recentActivity.length - 1 && (
                        <div className="w-0.5 h-12 bg-gradient-to-b from-slate-200 to-transparent mt-2" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{activity.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <p className="text-xs text-slate-500 font-medium">{activity.time}</p>
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
          <div className="modern-card p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
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
                  <div key={payment.id} className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 hover:shadow-modern-md transition-all duration-300 group hover:scale-[1.02]">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-slate-900 truncate">{payment.tenant}</p>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold px-2">
                        ${payment.amount.toLocaleString()}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 truncate font-medium">{payment.property}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <p className="text-xs text-slate-500 font-medium">Due {payment.dueDate}</p>
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
        <div className="modern-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                Revenue Trend
              </h3>
              <p className="text-sm text-slate-500 mt-1">Last 6 months performance</p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 font-bold">+12%</Badge>
          </div>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 rounded-2xl border border-indigo-100">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">Chart visualization</p>
              <p className="text-sm text-slate-400 mt-1">Coming soon with real-time data</p>
            </div>
          </div>
        </div>

        {/* Occupancy Chart */}
        <div className="modern-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-cyan-600" />
                Occupancy Rate
              </h3>
              <p className="text-sm text-slate-500 mt-1">Property utilization</p>
            </div>
            <Badge className="bg-cyan-100 text-cyan-700 font-bold">{occupancyRate}%</Badge>
          </div>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 rounded-2xl border border-cyan-100">
            <div className="text-center">
              <Users className="h-12 w-12 text-cyan-300 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">Occupancy analytics</p>
              <p className="text-sm text-slate-400 mt-1">Coming soon with real-time data</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
