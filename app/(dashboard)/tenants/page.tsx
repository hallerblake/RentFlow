'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, UserPlus, Mail, Phone, Home, Calendar, DollarSign, Edit, Trash2, User } from 'lucide-react';
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-green-500 to-green-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600',
      'from-cyan-500 to-cyan-600',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="space-y-8 p-8">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-white/50 rounded-lg animate-pulse" />
          <div className="h-6 w-96 bg-white/30 rounded-lg animate-pulse" />
        </div>
        <Card className="glass shadow-premium">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-white/50 rounded-lg animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold gradient-text">
            Tenants
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your tenants ({tenants.length} total, {tenants.filter(t => t.isActive).length} active)
          </p>
        </div>
        <Button
          onClick={() => { setSelectedTenant(null); setDialogOpen(true); }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Tenant
        </Button>
      </div>

      {/* Empty State */}
      {tenants.length === 0 ? (
        <Card className="glass shadow-premium-lg border-0">
          <CardContent className="p-16 text-center">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
              <UserPlus className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No tenants yet</h3>
            <p className="text-muted-foreground mb-8 text-lg">
              Get started by adding your first tenant
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Tenant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass shadow-premium-lg border-0 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 hover:from-blue-500/10 hover:to-purple-500/10 border-b border-white/20">
                    <TableHead className="font-semibold text-gray-700">Tenant</TableHead>
                    <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                    <TableHead className="font-semibold text-gray-700">Property</TableHead>
                    <TableHead className="font-semibold text-gray-700">Lease Period</TableHead>
                    <TableHead className="font-semibold text-gray-700">Rent</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map((tenant, index) => (
                    <TableRow
                      key={tenant.id}
                      className="group hover:bg-white/60 transition-all duration-300 border-b border-white/20"
                    >
                      {/* Name with Avatar */}
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${getAvatarColor(index)} flex items-center justify-center text-white font-bold shadow-md flex-shrink-0`}>
                            {getInitials(tenant.firstName, tenant.lastName)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {tenant.firstName} {tenant.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {tenant.company.name}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact Info */}
                      <TableCell className="py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              <Mail className="h-4 w-4 text-blue-600" />
                            </div>
                            <a
                              href={`mailto:${tenant.email}`}
                              className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                            >
                              {tenant.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                              <Phone className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="text-gray-700">{tenant.phone}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Property */}
                      <TableCell className="py-4">
                        {tenant.property ? (
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
                              <Home className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-sm text-gray-900">{tenant.property.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {tenant.property.city}, {tenant.property.state}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Home className="h-4 w-4" />
                            <span className="text-sm">No property</span>
                          </div>
                        )}
                      </TableCell>

                      {/* Lease Period */}
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-orange-600" />
                          </div>
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{formatDate(tenant.leaseStartDate)}</div>
                            <div className="text-xs text-muted-foreground">to {formatDate(tenant.leaseEndDate)}</div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Rent Amount */}
                      <TableCell className="py-4">
                        {tenant.rentAmount ? (
                          <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 w-fit">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <span className="font-bold text-green-600">{tenant.rentAmount.toLocaleString()}</span>
                            <span className="text-xs text-green-600/70">/mo</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="py-4">
                        <Badge
                          variant="outline"
                          className={
                            tenant.isActive
                              ? 'bg-green-500/10 text-green-700 border-green-500/30 font-semibold'
                              : 'bg-gray-500/10 text-gray-700 border-gray-500/30 font-semibold'
                          }
                        >
                          {tenant.isActive ? '● Active' : '○ Inactive'}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right py-4">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/50 hover:bg-white/70 border-blue-500/30 hover:border-blue-500 transition-all duration-300"
                            onClick={() => handleEdit(tenant)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white/50 hover:bg-red-50 border-red-500/30 hover:border-red-500 text-red-600 hover:text-red-700 transition-all duration-300"
                            onClick={() => handleDelete(tenant.id)}
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
