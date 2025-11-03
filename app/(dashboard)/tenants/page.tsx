'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, UserPlus, Mail, Phone, Home, Calendar, DollarSign } from 'lucide-react';
import { TenantDialog } from '@/components/tenants/TenantDialog';

type Tenant = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
  leaseStartDate: string | null;
  leaseEndDate: string | null;
  rentAmount: number | null;
  depositPaid: number | null;
  company: {
    id: string;
    name: string;
  };
  property: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
  } | null;
  _count: {
    payments: number;
    maintenanceRequests: number;
  };
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/tenants');
      const data = await response.json();
      setTenants(data);
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTenantSaved = () => {
    fetchTenants();
    setDialogOpen(false);
    setSelectedTenant(null);
  };

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tenant?')) return;

    try {
      await fetch(`/api/tenants/${id}`, { method: 'DELETE' });
      fetchTenants();
    } catch (error) {
      console.error('Failed to delete tenant:', error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Tenants</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tenants</h1>
          <p className="text-gray-500 mt-1">
            Manage your tenants ({tenants.length} total, {tenants.filter(t => t.isActive).length} active)
          </p>
        </div>
        <Button onClick={() => { setSelectedTenant(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Tenant
        </Button>
      </div>

      {tenants.length === 0 ? (
        <Card className="p-12 text-center">
          <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tenants yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first tenant</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Tenant
          </Button>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Lease Period</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div className="font-medium">
                        {tenant.firstName} {tenant.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {tenant.company.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1 text-gray-400" />
                          <a href={`mailto:${tenant.email}`} className="text-blue-600 hover:underline">
                            {tenant.email}
                          </a>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-3 w-3 mr-1 text-gray-400" />
                          {tenant.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {tenant.property ? (
                        <div className="flex items-start">
                          <Home className="h-4 w-4 mr-1 text-gray-400 mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">{tenant.property.name}</div>
                            <div className="text-xs text-gray-500">
                              {tenant.property.city}, {tenant.property.state}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No property</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start text-sm">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400 mt-0.5" />
                        <div>
                          <div>{formatDate(tenant.leaseStartDate)}</div>
                          <div className="text-xs text-gray-500">to {formatDate(tenant.leaseEndDate)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {tenant.rentAmount ? (
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{tenant.rentAmount}</span>
                          <span className="text-xs text-gray-500 ml-1">/mo</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={tenant.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {tenant.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(tenant)}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(tenant.id)}>
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

      <TenantDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tenant={selectedTenant}
        onSaved={handleTenantSaved}
      />
    </div>
  );
}
