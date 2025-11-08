'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Building2, MapPin, Bed, Bath, Square, DollarSign, Users, Wrench, Edit, Trash2 } from 'lucide-react';
import { PropertyDialog } from '@/components/properties/PropertyDialog';
import { ViewToggle } from '@/components/ui/view-toggle';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCompany } from '@/lib/contexts/CompanyContext';

type Property = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  rentAmount: number;
  status: string;
  company: {
    id: string;
    name: string;
  };
  _count: {
    tenants: number;
    maintenanceRequests: number;
  };
};

const statusColors = {
  VACANT: 'bg-green-500/10 text-green-700 border-green-500/20',
  OCCUPIED: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  MAINTENANCE: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  UNAVAILABLE: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
};

const gradients = [
  'from-blue-500 to-purple-600',
  'from-purple-500 to-pink-600',
  'from-green-500 to-teal-600',
  'from-orange-500 to-red-600',
  'from-cyan-500 to-blue-600',
  'from-indigo-500 to-purple-600',
];

export default function PropertiesPage() {
  const { selectedCompany } = useCompany();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [view, setView] = useState<'card' | 'table'>('table');

  useEffect(() => {
    // Load view preference from localStorage
    const savedView = localStorage.getItem('propertiesView') as 'card' | 'table';
    if (savedView) setView(savedView);
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchProperties();
    }
  }, [selectedCompany]);

  const handleViewChange = (newView: 'card' | 'table') => {
    setView(newView);
    localStorage.setItem('propertiesView', newView);
  };

  const fetchProperties = async () => {
    if (!selectedCompany) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/properties?companyId=${selectedCompany.id}`);
      const data = await response.json();

      // Ensure data is an array before setting
      if (Array.isArray(data)) {
        setProperties(data);
      } else {
        console.error('API returned non-array data:', data);
        setProperties([]);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertySaved = () => {
    fetchProperties();
    setDialogOpen(false);
    setSelectedProperty(null);
  };

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      fetchProperties();
    } catch (error) {
      console.error('Failed to delete property:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 p-8">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-white/50 rounded-lg animate-pulse" />
          <div className="h-6 w-96 bg-white/30 rounded-lg animate-pulse" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass shadow-premium overflow-hidden animate-pulse">
              <div className="h-48 bg-gradient-to-br from-slate-200 to-slate-300" />
              <CardContent className="p-6 space-y-4">
                <div className="h-4 bg-white/50 rounded w-3/4" />
                <div className="h-4 bg-white/50 rounded w-1/2" />
                <div className="h-4 bg-white/50 rounded w-2/3" />
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
            Properties
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your rental properties ({properties.length} total)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onViewChange={handleViewChange} />
          <Button
            onClick={() => { setSelectedProperty(null); setDialogOpen(true); }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {properties.length === 0 ? (
        <Card className="glass shadow-premium-lg border-0">
          <CardContent className="p-16 text-center">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No properties yet</h3>
            <p className="text-muted-foreground mb-8 text-lg">
              Get started by adding your first rental property
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Property
            </Button>
          </CardContent>
        </Card>
      ) : view === 'card' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property, index) => {
            const gradient = gradients[index % gradients.length];
            return (
              <Card
                key={property.id}
                className="glass shadow-premium hover-lift border-0 overflow-hidden group"
              >
                {/* Property Image/Header */}
                <CardHeader className="p-0 relative">
                  <div className={`h-48 bg-gradient-to-br ${gradient} relative`}>
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge
                        variant="outline"
                        className={`${statusColors[property.status as keyof typeof statusColors]} backdrop-blur-sm font-semibold`}
                      >
                        {property.status}
                      </Badge>
                    </div>

                    {/* Property Name & Location */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">
                        {property.name}
                      </h3>
                      <div className="flex items-center text-sm opacity-95 drop-shadow">
                        <MapPin className="h-4 w-4 mr-1" />
                        {property.city}, {property.state}
                      </div>
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                </CardHeader>

                {/* Property Details */}
                <CardContent className="p-6 space-y-4">
                  {/* Address */}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {property.address}
                  </div>

                  {/* Property Stats */}
                  <div className="grid grid-cols-3 gap-3 py-4 border-y border-white/20">
                    {property.bedrooms && (
                      <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors">
                        <Bed className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-semibold">{property.bedrooms}</span>
                        <span className="text-xs text-muted-foreground">beds</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors">
                        <Bath className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-semibold">{property.bathrooms}</span>
                        <span className="text-xs text-muted-foreground">baths</span>
                      </div>
                    )}
                    {property.squareFeet && (
                      <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors">
                        <Square className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold">{property.squareFeet}</span>
                        <span className="text-xs text-muted-foreground">sqft</span>
                      </div>
                    )}
                  </div>

                  {/* Rent Amount */}
                  <div className="flex items-center justify-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                    <DollarSign className="h-6 w-6 text-green-600" />
                    <span className="text-3xl font-bold text-green-600">
                      {property.rentAmount.toLocaleString()}
                    </span>
                    <span className="text-lg text-green-600/70 ml-1">/mo</span>
                  </div>

                  {/* Tenants & Maintenance */}
                  <div className="flex items-center justify-around gap-4 p-3 rounded-lg bg-white/50">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{property._count.tenants}</div>
                        <div className="text-xs text-muted-foreground">Tenants</div>
                      </div>
                    </div>
                    <div className="h-8 w-px bg-gray-300" />
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <Wrench className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{property._count.maintenanceRequests}</div>
                        <div className="text-xs text-muted-foreground">Requests</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-white/50 hover:bg-white/70 border-blue-500/30 hover:border-blue-500 transition-all duration-300"
                      onClick={() => handleEdit(property)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-white/50 hover:bg-red-50 border-red-500/30 hover:border-red-500 text-red-600 hover:text-red-700 transition-all duration-300"
                      onClick={() => handleDelete(property.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="glass shadow-premium border-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="font-semibold">Property</TableHead>
                <TableHead className="font-semibold">Location</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Beds/Baths</TableHead>
                <TableHead className="font-semibold">Rent</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Tenants</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id} className="border-slate-200">
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold text-slate-900">{property.name}</div>
                      <div className="text-sm text-slate-500">{property.address}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      {property.city}, {property.state}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">{property.type.replace('_', ' ')}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      {property.bedrooms && (
                        <div className="flex items-center gap-1">
                          <Bed className="h-3 w-3" />
                          {property.bedrooms}
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="flex items-center gap-1">
                          <Bath className="h-3 w-3" />
                          {property.bathrooms}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-green-600">
                      ${property.rentAmount.toLocaleString()}/mo
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${statusColors[property.status as keyof typeof statusColors]} font-semibold`}
                    >
                      {property.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Users className="h-3 w-3" />
                        {property._count.tenants}
                      </div>
                      <div className="flex items-center gap-1 text-orange-600">
                        <Wrench className="h-3 w-3" />
                        {property._count.maintenanceRequests}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(property)}
                        className="h-8 bg-white/50 hover:bg-white/70"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(property.id)}
                        className="h-8 bg-white/50 hover:bg-red-50 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <PropertyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        property={selectedProperty}
        onSaved={handlePropertySaved}
      />
    </div>
  );
}
