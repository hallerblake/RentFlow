'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type PaymentFormData = {
  companyId: string;
  tenantId: string;
  propertyId: string;
  amount: string;
  dueDate: string;
  paidDate: string;
  paymentMethod: string;
  status: string;
  notes: string;
};

type Company = {
  id: string;
  name: string;
};

type Tenant = {
  id: string;
  firstName: string;
  lastName: string;
};

type Property = {
  id: string;
  name: string;
  address: string;
};

type PaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: any;
  onSaved: () => void;
};

export function PaymentDialog({ open, onOpenChange, payment, onSaved }: PaymentDialogProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PaymentFormData>();

  const selectedCompanyId = watch('companyId');

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchTenants(selectedCompanyId);
      fetchProperties(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    if (payment) {
      setValue('companyId', payment.company.id);
      setValue('tenantId', payment.tenant.id);
      setValue('propertyId', payment.property?.id || '');
      setValue('amount', payment.amount.toString());
      setValue('dueDate', new Date(payment.dueDate).toISOString().split('T')[0]);
      setValue('paidDate', payment.paidDate ? new Date(payment.paidDate).toISOString().split('T')[0] : '');
      setValue('paymentMethod', payment.paymentMethod || '');
      setValue('status', payment.status);
      setValue('notes', payment.notes || '');
    } else {
      reset({
        companyId: companies[0]?.id || '',
        status: 'PENDING',
      });
    }
  }, [payment, companies, setValue, reset]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const fetchTenants = async (companyId: string) => {
    try {
      const response = await fetch(`/api/tenants?companyId=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setTenants(data);
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
    }
  };

  const fetchProperties = async (companyId: string) => {
    try {
      const response = await fetch(`/api/properties?companyId=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    setLoading(true);
    try {
      const url = payment ? `/api/payments/${payment.id}` : '/api/payments';
      const method = payment ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSaved();
        reset();
      }
    } catch (error) {
      console.error('Failed to save payment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{payment ? 'Edit Payment' : 'Record New Payment'}</DialogTitle>
          <DialogDescription>
            {payment ? 'Update the payment details below' : 'Enter the payment information below'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyId">Company *</Label>
              <Select onValueChange={(value) => setValue('companyId', value)} defaultValue={payment?.company.id || companies[0]?.id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenantId">Tenant *</Label>
              <Select onValueChange={(value) => setValue('tenantId', value)} defaultValue={payment?.tenant?.id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.firstName} {tenant.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyId">Property</Label>
            <Select onValueChange={(value) => setValue('propertyId', value)} defaultValue={payment?.property?.id || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select property (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No property</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name} - {property.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input id="amount" type="number" step="0.01" {...register('amount', { required: true })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select onValueChange={(value) => setValue('status', value)} defaultValue={payment?.status || 'PENDING'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input id="dueDate" type="date" {...register('dueDate', { required: true })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paidDate">Paid Date</Label>
              <Input id="paidDate" type="date" {...register('paidDate')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select onValueChange={(value) => setValue('paymentMethod', value)} defaultValue={payment?.paymentMethod || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select method (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Not specified</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="CHECK">Check</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register('notes')} rows={3} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : payment ? 'Update Payment' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
