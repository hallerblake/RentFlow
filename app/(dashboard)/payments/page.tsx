'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, DollarSign, TrendingUp, AlertCircle, CheckCircle2, Calendar, CreditCard, Edit, Trash2, User } from 'lucide-react';
import { PaymentDialog } from '@/components/payments/PaymentDialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type Payment = {
  id: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: string;
  paymentMethod: string | null;
  company: {
    id: string;
    name: string;
  };
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
  };
  property: {
    id: string;
    name: string;
    address: string;
  } | null;
};

const statusColors = {
  PENDING: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30',
  PAID: 'bg-green-500/10 text-green-700 border-green-500/30',
  OVERDUE: 'bg-red-500/10 text-red-700 border-red-500/30',
  CANCELLED: 'bg-gray-500/10 text-gray-700 border-gray-500/30',
};

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments');
      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to fetch payments:', data.error || 'Unknown error');
        setPayments([]);
        return;
      }

      setPayments(data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSaved = () => {
    fetchPayments();
    setDialogOpen(false);
    setSelectedPayment(null);
  };

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment record?')) return;

    try {
      await fetch(`/api/payments/${id}`, { method: 'DELETE' });
      fetchPayments();
    } catch (error) {
      console.error('Failed to delete payment:', error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not paid';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const filteredPayments = payments.filter((payment) => {
    if (activeTab === 'all') return true;
    return payment.status === activeTab.toUpperCase();
  });

  const totalRevenue = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0);

  const overdueAmount = payments
    .filter((p) => p.status === 'OVERDUE')
    .reduce((sum, p) => sum + p.amount, 0);

  // Payment status distribution for pie chart
  const statusDistribution = [
    { name: 'Paid', value: payments.filter((p) => p.status === 'PAID').length },
    { name: 'Pending', value: payments.filter((p) => p.status === 'PENDING').length },
    { name: 'Overdue', value: payments.filter((p) => p.status === 'OVERDUE').length },
    { name: 'Cancelled', value: payments.filter((p) => p.status === 'CANCELLED').length },
  ].filter((item) => item.value > 0);

  if (loading) {
    return (
      <div className="space-y-8 p-8">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-white/50 rounded-lg animate-pulse" />
          <div className="h-6 w-96 bg-white/30 rounded-lg animate-pulse" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass shadow-premium animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-white/50 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold gradient-text">
            Payments
          </h1>
          <p className="text-lg text-muted-foreground">
            Track and manage rent payments ({payments.length} total)
          </p>
        </div>
        <Button
          onClick={() => { setSelectedPayment(null); setDialogOpen(true); }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Revenue */}
        <Card className="glass shadow-premium hover-lift border-0 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
            <p className="text-sm text-muted-foreground mt-2">
              {payments.filter((p) => p.status === 'PAID').length} payments received
            </p>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="glass shadow-premium hover-lift border-0 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</div>
            <p className="text-sm text-muted-foreground mt-2">
              {payments.filter((p) => p.status === 'PENDING').length} payments pending
            </p>
          </CardContent>
        </Card>

        {/* Overdue */}
        <Card className="glass shadow-premium hover-lift border-0 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-red-600">{formatCurrency(overdueAmount)}</div>
            <p className="text-sm text-muted-foreground mt-2">
              {payments.filter((p) => p.status === 'OVERDUE').length} payments overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Distribution Chart */}
      {statusDistribution.length > 0 && (
        <Card className="glass shadow-premium-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              Payment Status Distribution
            </CardTitle>
            <p className="text-sm text-muted-foreground">Overview of payment statuses</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Payments Table with Tabs */}
      <Card className="glass shadow-premium-lg border-0">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                All Payments
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-600 data-[state=active]:text-white">
                Pending
              </TabsTrigger>
              <TabsTrigger value="paid" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
                Paid
              </TabsTrigger>
              <TabsTrigger value="overdue" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                Overdue
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredPayments.length === 0 ? (
                <div className="text-center py-16">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No payments found</h3>
                  <p className="text-muted-foreground mb-6">
                    {activeTab === 'all'
                      ? 'Get started by recording your first payment'
                      : `No ${activeTab} payments at this time`}
                  </p>
                  {activeTab === 'all' && (
                    <Button
                      onClick={() => setDialogOpen(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Record Payment
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 hover:from-blue-500/10 hover:to-purple-500/10 border-b border-white/20">
                        <TableHead className="font-semibold text-gray-700">Tenant</TableHead>
                        <TableHead className="font-semibold text-gray-700">Property</TableHead>
                        <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                        <TableHead className="font-semibold text-gray-700">Due Date</TableHead>
                        <TableHead className="font-semibold text-gray-700">Paid Date</TableHead>
                        <TableHead className="font-semibold text-gray-700">Method</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow
                          key={payment.id}
                          className="group hover:bg-white/60 transition-all duration-300 border-b border-white/20"
                        >
                          {/* Tenant */}
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                                <User className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {payment.tenant.firstName} {payment.tenant.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground">{payment.company.name}</div>
                              </div>
                            </div>
                          </TableCell>

                          {/* Property */}
                          <TableCell className="py-4">
                            {payment.property ? (
                              <div>
                                <div className="font-medium text-sm text-gray-900">{payment.property.name}</div>
                                <div className="text-xs text-muted-foreground">{payment.property.address}</div>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">No property</span>
                            )}
                          </TableCell>

                          {/* Amount */}
                          <TableCell className="py-4">
                            <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 w-fit">
                              <span className="font-bold text-green-600">{formatCurrency(payment.amount)}</span>
                            </div>
                          </TableCell>

                          {/* Due Date */}
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-orange-600" />
                              <span className="text-sm">{formatDate(payment.dueDate)}</span>
                            </div>
                          </TableCell>

                          {/* Paid Date */}
                          <TableCell className="py-4">
                            {payment.paidDate ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-600">{formatDate(payment.paidDate)}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Not paid</span>
                            )}
                          </TableCell>

                          {/* Payment Method */}
                          <TableCell className="py-4">
                            {payment.paymentMethod ? (
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">{payment.paymentMethod.replace('_', ' ')}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">N/A</span>
                            )}
                          </TableCell>

                          {/* Status */}
                          <TableCell className="py-4">
                            <Badge
                              variant="outline"
                              className={`${statusColors[payment.status as keyof typeof statusColors]} font-semibold`}
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right py-4">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white/50 hover:bg-white/70 border-blue-500/30 hover:border-blue-500 transition-all duration-300"
                                onClick={() => handleEdit(payment)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white/50 hover:bg-red-50 border-red-500/30 hover:border-red-500 text-red-600 hover:text-red-700 transition-all duration-300"
                                onClick={() => handleDelete(payment.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <PaymentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        payment={selectedPayment}
        onSaved={handlePaymentSaved}
      />
    </div>
  );
}
