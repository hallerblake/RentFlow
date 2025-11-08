'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type PropertyFormData = {
  companyId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  rentAmount: string;
  depositAmount: string;
  status: string;
  description: string;
};

type Company = {
  id: string;
  name: string;
};

type PropertyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: any;
  onSaved: () => void;
};

export function PropertyDialog({ open, onOpenChange, property, onSaved }: PropertyDialogProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PropertyFormData>();

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (property) {
      setValue('companyId', property.company.id);
      setValue('name', property.name);
      setValue('address', property.address);
      setValue('city', property.city);
      setValue('state', property.state);
      setValue('zipCode', property.zipCode);
      setValue('type', property.type);
      setValue('bedrooms', property.bedrooms?.toString() || '');
      setValue('bathrooms', property.bathrooms?.toString() || '');
      setValue('squareFeet', property.squareFeet?.toString() || '');
      setValue('rentAmount', property.rentAmount.toString());
      setValue('depositAmount', property.depositAmount?.toString() || '');
      setValue('status', property.status);
      setValue('description', property.description || '');
    } else {
      reset({
        companyId: companies[0]?.id || '',
        status: 'VACANT',
        type: 'SINGLE_FAMILY',
      });
    }
  }, [property, companies, setValue, reset]);

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

  const onSubmit = async (data: PropertyFormData) => {
    setLoading(true);
    try {
      const url = property ? `/api/properties/${property.id}` : '/api/properties';
      const method = property ? 'PATCH' : 'POST';

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
      console.error('Failed to save property:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>{property ? 'Edit Property' : 'Add New Property'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Property Name *</Label>
              <Input id="name" {...register('name', { required: true })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyId">Company *</Label>
              <Select onValueChange={(value) => setValue('companyId', value)} defaultValue={property?.company.id || companies[0]?.id}>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input id="address" {...register('address', { required: true })} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input id="city" {...register('city', { required: true })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input id="state" {...register('state', { required: true })} maxLength={2} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip Code *</Label>
              <Input id="zipCode" {...register('zipCode', { required: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Property Type *</Label>
              <Select onValueChange={(value) => setValue('type', value)} defaultValue={property?.type || 'SINGLE_FAMILY'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE_FAMILY">Single Family</SelectItem>
                  <SelectItem value="MULTI_FAMILY">Multi Family</SelectItem>
                  <SelectItem value="APARTMENT">Apartment</SelectItem>
                  <SelectItem value="CONDO">Condo</SelectItem>
                  <SelectItem value="TOWNHOUSE">Townhouse</SelectItem>
                  <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select onValueChange={(value) => setValue('status', value)} defaultValue={property?.status || 'VACANT'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VACANT">Vacant</SelectItem>
                  <SelectItem value="OCCUPIED">Occupied</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input id="bedrooms" type="number" {...register('bedrooms')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input id="bathrooms" type="number" step="0.5" {...register('bathrooms')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="squareFeet">Square Feet</Label>
              <Input id="squareFeet" type="number" {...register('squareFeet')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rentAmount">Monthly Rent *</Label>
              <Input id="rentAmount" type="number" step="0.01" {...register('rentAmount', { required: true })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="depositAmount">Deposit Amount</Label>
              <Input id="depositAmount" type="number" step="0.01" {...register('depositAmount')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} rows={3} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : property ? 'Update Property' : 'Add Property'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
