'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, DollarSign, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PaymentDialog } from '@/components/payments/PaymentDialog';

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
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

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
      setPayments(data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Payments</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Payments</h1>
          <p className="text-gray-500 mt-1">Track and manage rent payments ({payments.length} total)</p>
        </div>
        <Button onClick={() => { setSelectedPayment(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {payments.filter((p) => p.status === 'PAID').length} payments received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {payments.filter((p) => p.status === 'PENDING').length} payments pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(overdueAmount)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {payments.filter((p) => p.status === 'OVERDUE').length} payments overdue
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Payments</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredPayments.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-500 mb-4">
                {activeTab === 'all'
                  ? 'Get started by recording your first payment'
                  : `No ${activeTab} payments at this time`}
              </p>
              {activeTab === 'all' && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
              )}
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Paid Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="font-medium">
                            {payment.tenant.firstName} {payment.tenant.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{payment.company.name}</div>
                        </TableCell>
                        <TableCell>
                          {payment.property ? (
                            <div>
                              <div className="font-medium text-sm">{payment.property.name}</div>
                              <div className="text-xs text-gray-500">{payment.property.address}</div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No property</span>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{formatDate(payment.dueDate)}</TableCell>
                        <TableCell>
                          {payment.paidDate ? (
                            <span className="text-green-600">{formatDate(payment.paidDate)}</span>
                          ) : (
                            <span className="text-gray-400">Not paid</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {payment.paymentMethod ? (
                            <span className="text-sm">{payment.paymentMethod.replace('_', ' ')}</span>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[payment.status as keyof typeof statusColors]}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(payment)}>
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(payment.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <PaymentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        payment={selectedPayment}
        onSaved={handlePaymentSaved}
      />
    </div>
  );
}
