'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

type TenantFormData = {
  companyId: string;
  propertyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  leaseStartDate: string;
  leaseEndDate: string;
  rentAmount: string;
  depositPaid: string;
  isActive: boolean;
  emergencyContactName: string;
  emergencyContactPhone: string;
  notes: string;
};

type Company = {
  id: string;
  name: string;
};

type Property = {
  id: string;
  name: string;
  address: string;
};

type TenantDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: any;
  onSaved: () => void;
};

export function TenantDialog({ open, onOpenChange, tenant, onSaved }: TenantDialogProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TenantFormData>();

  const selectedCompanyId = watch('companyId');

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchProperties(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    if (tenant) {
      setValue('companyId', tenant.company.id);
      setValue('propertyId', tenant.property?.id || 'NONE');
      setValue('firstName', tenant.firstName);
      setValue('lastName', tenant.lastName);
      setValue('email', tenant.email);
      setValue('phone', tenant.phone);
      setValue('leaseStartDate', tenant.leaseStartDate ? new Date(tenant.leaseStartDate).toISOString().split('T')[0] : '');
      setValue('leaseEndDate', tenant.leaseEndDate ? new Date(tenant.leaseEndDate).toISOString().split('T')[0] : '');
      setValue('rentAmount', tenant.rentAmount?.toString() || '');
      setValue('depositPaid', tenant.depositPaid?.toString() || '');
      setValue('isActive', tenant.isActive);
      setValue('emergencyContactName', tenant.emergencyContactName || '');
      setValue('emergencyContactPhone', tenant.emergencyContactPhone || '');
      setValue('notes', tenant.notes || '');
    } else {
      reset({
        companyId: companies[0]?.id || '',
        isActive: true,
      });
    }
  }, [tenant, companies, setValue, reset]);

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

  const onSubmit = async (data: TenantFormData) => {
    setLoading(true);
    try {
      const url = tenant ? `/api/tenants/${tenant.id}` : '/api/tenants';
      const method = tenant ? 'PATCH' : 'POST';

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
      console.error('Failed to save tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>{tenant ? 'Edit Tenant' : 'Add New Tenant'}</DialogTitle>
          <DialogDescription>
            {tenant ? 'Update the tenant details below' : 'Enter the tenant information below'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" {...register('firstName', { required: true })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" {...register('lastName', { required: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...register('email', { required: true })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" type="tel" {...register('phone', { required: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyId">Company *</Label>
              <Select onValueChange={(value) => setValue('companyId', value)} defaultValue={tenant?.company.id || companies[0]?.id}>
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
              <Label htmlFor="propertyId">Property</Label>
              <Select onValueChange={(value) => setValue('propertyId', value === 'NONE' ? '' : value)} defaultValue={tenant?.property?.id || 'NONE'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">No property assigned</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name} - {property.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leaseStartDate">Lease Start Date</Label>
              <Input id="leaseStartDate" type="date" {...register('leaseStartDate')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="leaseEndDate">Lease End Date</Label>
              <Input id="leaseEndDate" type="date" {...register('leaseEndDate')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rentAmount">Monthly Rent</Label>
              <Input id="rentAmount" type="number" step="0.01" {...register('rentAmount')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="depositPaid">Deposit Paid</Label>
              <Input id="depositPaid" type="number" step="0.01" {...register('depositPaid')} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active Tenant</Label>
              <Switch
                id="isActive"
                checked={watch('isActive')}
                onCheckedChange={(checked) => setValue('isActive', checked)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
              <Input id="emergencyContactName" {...register('emergencyContactName')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
              <Input id="emergencyContactPhone" type="tel" {...register('emergencyContactPhone')} />
            </div>
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
              {loading ? 'Saving...' : tenant ? 'Update Tenant' : 'Add Tenant'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
