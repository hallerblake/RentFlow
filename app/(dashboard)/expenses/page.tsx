'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { ExpenseDialog } from '@/components/expenses/ExpenseDialog';
import { toast } from 'sonner';

type Expense = {
  id: string;
  amount: number;
  date: string;
  vendor: string | null;
  paymentMethod: string | null;
  description: string | null;
  category: {
    id: string;
    name: string;
  };
  property: {
    id: string;
    name: string;
    address: string;
  } | null;
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses');
      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to fetch expenses:', data.error || 'Unknown error');
        setExpenses([]);
        return;
      }

      setExpenses(data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = () => {
    setEditExpense(null);
    setDialogOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditExpense(expense);
    setDialogOpen(true);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Expense deleted successfully');
        fetchExpenses();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete expense');
      }
    } catch (error) {
      console.error('Failed to delete expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  const handleSaved = () => {
    setDialogOpen(false);
    fetchExpenses();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold gradient-text">Expenses</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Track and manage your property expenses ({expenses.length} total)
          </p>
        </div>
        <Button onClick={handleAddExpense} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Add Expense
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="glass shadow-premium-lg">
        <CardHeader>
          <CardTitle>Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(totalExpenses)}
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card className="glass shadow-premium-lg">
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No expenses yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first expense
              </p>
              <Button onClick={handleAddExpense} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">
                        {formatDate(expense.date)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {expense.category.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell>{expense.vendor || '-'}</TableCell>
                      <TableCell>
                        {expense.property ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{expense.property.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">General</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {expense.paymentMethod ? (
                          <Badge variant="secondary" className="text-xs">
                            {expense.paymentMethod.replace('_', ' ')}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {expense.description || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditExpense(expense)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Dialog */}
      <ExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        expense={editExpense}
        onSaved={handleSaved}
      />
    </div>
  );
}
