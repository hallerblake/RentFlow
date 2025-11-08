'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

type ExpenseFormData = {
  categoryId: string;
  amount: string;
  date: string;
  vendor: string;
  paymentMethod: string;
  description: string;
  propertyId: string;
};

type ExpenseCategory = {
  id: string;
  name: string;
};

type Property = {
  id: string;
  name: string;
  address: string;
};

type ExpenseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: any;
  onSaved: () => void;
};

export function ExpenseDialog({ open, onOpenChange, expense, onSaved }: ExpenseDialogProps) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ExpenseFormData>();

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchProperties();
    }
  }, [open]);

  useEffect(() => {
    if (expense) {
      setValue('categoryId', expense.category.id);
      setValue('amount', expense.amount.toString());
      setValue('date', new Date(expense.date).toISOString().split('T')[0]);
      setValue('vendor', expense.vendor || '');
      setValue('paymentMethod', expense.paymentMethod || '');
      setValue('description', expense.description || '');
      setValue('propertyId', expense.property?.id || '');
    } else {
      reset({
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [expense, setValue, reset]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/expense-categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties');
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    }
  };

  const onSubmit = async (data: ExpenseFormData) => {
    setLoading(true);
    try {
      const url = expense ? `/api/expenses/${expense.id}` : '/api/expenses';
      const method = expense ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: data.categoryId,
          amount: parseFloat(data.amount),
          date: data.date,
          vendor: data.vendor || null,
          paymentMethod: data.paymentMethod || null,
          description: data.description || null,
          propertyId: data.propertyId || null,
        }),
      });

      if (response.ok) {
        toast.success(expense ? 'Expense updated successfully' : 'Expense created successfully');
        onSaved();
        reset();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save expense');
      }
    } catch (error) {
      console.error('Failed to save expense:', error);
      toast.error('Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>{expense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
          <DialogDescription>
            {expense ? 'Update the expense details below' : 'Enter the expense information below'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category *</Label>
              <Select onValueChange={(value) => setValue('categoryId', value)} defaultValue={expense?.category?.id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-red-600">Category is required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount', { required: true })}
              />
              {errors.amount && (
                <p className="text-sm text-red-600">Amount is required</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              {...register('date', { required: true })}
            />
            {errors.date && (
              <p className="text-sm text-red-600">Date is required</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor/Payee</Label>
              <Input
                id="vendor"
                placeholder="Enter vendor name"
                {...register('vendor')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select onValueChange={(value) => setValue('paymentMethod', value)} defaultValue={expense?.paymentMethod || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not specified</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CHECK">Check</SelectItem>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="ACH">ACH</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyId">Property (optional)</Label>
            <Select onValueChange={(value) => setValue('propertyId', value)} defaultValue={expense?.property?.id || ''}>
              <SelectTrigger>
                <SelectValue placeholder="General expense (no property)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">General expense</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name} - {property.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select a property if this expense is property-specific, or leave blank for general expenses
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description/Notes</Label>
            <Textarea
              id="description"
              placeholder="Enter expense details..."
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : expense ? 'Update Expense' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
