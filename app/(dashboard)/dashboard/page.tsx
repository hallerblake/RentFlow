'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, DollarSign, Wrench, TrendingUp, TrendingDown, Calendar, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

// Mock data for charts - in a real app, this would come from the API
const revenueData = [
  { month: 'Jan', revenue: 42000 },
  { month: 'Feb', revenue: 45000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 51000 },
  { month: 'May', revenue: 49000 },
  { month: 'Jun', revenue: 52000 },
];

const occupancyData = [
  { month: 'Jan', rate: 85 },
  { month: 'Feb', rate: 88 },
  { month: 'Mar', rate: 92 },
  { month: 'Apr', rate: 90 },
  { month: 'May', rate: 94 },
  { month: 'Jun', rate: 92 },
];

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];

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
      <div className="space-y-8 p-8">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-white/50 rounded-lg animate-pulse" />
          <div className="h-6 w-96 bg-white/30 rounded-lg animate-pulse" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="glass shadow-premium animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const occupancyRate = stats.metrics.properties > 0
    ? Math.round((stats.metrics.occupied / stats.metrics.properties) * 100)
    : 0;

  const propertyStatusData = [
    { name: 'Occupied', value: stats.metrics.occupied },
    { name: 'Vacant', value: stats.metrics.properties - stats.metrics.occupied },
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight gradient-text">
          Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Welcome back! Here's what's happening with your properties
        </p>
      </div>

      {/* Premium Metric Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Properties Card */}
        <Card className="glass shadow-premium hover-lift border-0 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Properties
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{stats.metrics.properties}</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <p className="text-sm text-green-600 font-medium">{stats.metrics.occupied} occupied</p>
            </div>
          </CardContent>
        </Card>

        {/* Occupancy Rate Card */}
        <Card className="glass shadow-premium hover-lift border-0 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Occupancy Rate
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{occupancyRate}%</div>
            <p className="text-sm text-muted-foreground mt-2">
              {stats.metrics.occupied} of {stats.metrics.properties} units
            </p>
          </CardContent>
        </Card>

        {/* Monthly Revenue Card */}
        <Card className="glass shadow-premium hover-lift border-0 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Revenue
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">
              ${stats.metrics.revenue.toLocaleString()}
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <p className="text-sm text-green-600 font-medium">+12% from last month</p>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Card */}
        <Card className="glass shadow-premium hover-lift border-0 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Maintenance
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Wrench className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold">{stats.metrics.maintenance}</div>
            <p className="text-sm text-orange-600 font-medium mt-2">
              {stats.metrics.urgentMaintenance} urgent items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend Chart */}
        <Card className="glass shadow-premium-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              Revenue Trend
            </CardTitle>
            <p className="text-sm text-muted-foreground">Last 6 months</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="url(#colorRevenue)"
                  strokeWidth={3}
                  dot={{ fill: '#667eea', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Occupancy Trend Chart */}
        <Card className="glass shadow-premium-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Activity className="h-4 w-4 text-white" />
              </div>
              Occupancy Rate
            </CardTitle>
            <p className="text-sm text-muted-foreground">Last 6 months</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="rate" fill="url(#colorOccupancy)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Upcoming Payments */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="glass shadow-premium-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Activity className="h-4 w-4 text-white" />
              </div>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-br from-white/50 to-white/30 hover:from-white/70 hover:to-white/50 transition-all duration-300 hover-lift"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-relaxed">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Payments */}
        <Card className="glass shadow-premium-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              Upcoming Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.upcomingPayments.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm text-muted-foreground">No upcoming payments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.upcomingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-white/50 to-white/30 hover:from-white/70 hover:to-white/50 transition-all duration-300 hover-lift"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{payment.tenant}</p>
                      <p className="text-xs text-muted-foreground">{payment.property}</p>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="text-lg font-bold text-green-600">
                        ${payment.amount.toLocaleString()}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-xs bg-white/50 border-slate-300"
                      >
                        {new Date(payment.dueDate).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
