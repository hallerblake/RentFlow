'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type MaintenanceFormData = {
  companyId: string;
  propertyId: string;
  tenantId: string;
  title: string;
  description: string;
  priority: string;
  status: string;
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

type Tenant = {
  id: string;
  firstName: string;
  lastName: string;
};

type MaintenanceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: any;
  onSaved: () => void;
};

export function MaintenanceDialog({ open, onOpenChange, request, onSaved }: MaintenanceDialogProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, setValue, watch } = useForm<MaintenanceFormData>();

  const selectedCompanyId = watch('companyId');

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchProperties(selectedCompanyId);
      fetchTenants(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    if (request) {
      setValue('companyId', request.company.id);
      setValue('propertyId', request.property.id);
      setValue('tenantId', request.tenant?.id || '');
      setValue('title', request.title);
      setValue('description', request.description);
      setValue('priority', request.priority);
      setValue('status', request.status);
    } else {
      reset({
        companyId: companies[0]?.id || '',
        priority: 'MEDIUM',
        status: 'REQUESTED',
      });
    }
  }, [request, companies, setValue, reset]);

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

  const onSubmit = async (data: MaintenanceFormData) => {
    setLoading(true);
    try {
      const url = request ? `/api/maintenance/${request.id}` : '/api/maintenance';
      const method = request ? 'PATCH' : 'POST';

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
      console.error('Failed to save maintenance request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{request ? 'Edit Maintenance Request' : 'New Maintenance Request'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyId">Company *</Label>
              <Select onValueChange={(value) => setValue('companyId', value)} defaultValue={request?.company.id || companies[0]?.id}>
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
              <Label htmlFor="propertyId">Property *</Label>
              <Select onValueChange={(value) => setValue('propertyId', value)} defaultValue={request?.property.id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenantId">Tenant</Label>
            <Select onValueChange={(value) => setValue('tenantId', value)} defaultValue={request?.tenant?.id || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select tenant (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No tenant</SelectItem>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.firstName} {tenant.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" {...register('title', { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" {...register('description', { required: true })} rows={4} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select onValueChange={(value) => setValue('priority', value)} defaultValue={request?.priority || 'MEDIUM'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select onValueChange={(value) => setValue('status', value)} defaultValue={request?.status || 'REQUESTED'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REQUESTED">Requested</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : request ? 'Update Request' : 'Create Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
