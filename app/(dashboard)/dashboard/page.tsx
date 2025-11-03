'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, DollarSign, Wrench, TrendingUp, Calendar } from 'lucide-react';
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your properties</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded" />
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your properties</p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Properties
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.metrics.properties}</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <p className="text-xs text-green-600">{stats.metrics.occupied} occupied</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Occupied Units
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.metrics.occupied}</div>
            <p className="text-xs text-gray-500 mt-1">
              {occupancyRate}% occupancy rate
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${stats.metrics.revenue.toLocaleString()}
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <p className="text-xs text-green-600">Current month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Maintenance
            </CardTitle>
            <Wrench className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.metrics.maintenance}</div>
            <p className="text-xs text-orange-600 mt-1">
              {stats.metrics.urgentMaintenance} urgent items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Upcoming Payments */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Payments</CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            {stats.upcomingPayments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No upcoming payments</p>
            ) : (
              <div className="space-y-4">
                {stats.upcomingPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">{payment.tenant}</p>
                      <p className="text-xs text-gray-500">{payment.property}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        ${payment.amount.toLocaleString()}
                      </p>
                      <Badge variant="outline" className="text-xs">
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
