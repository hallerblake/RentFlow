'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Building2, MapPin, Bed, Bath, Square, DollarSign, Users, Wrench } from 'lucide-react';
import { PropertyDialog } from '@/components/properties/PropertyDialog';

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
  VACANT: 'bg-green-100 text-green-800',
  OCCUPIED: 'bg-blue-100 text-blue-800',
  MAINTENANCE: 'bg-orange-100 text-orange-800',
  UNAVAILABLE: 'bg-gray-100 text-gray-800',
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties');
      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Properties</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-48 bg-gray-200" />
              <CardContent className="p-6 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Properties</h1>
          <p className="text-gray-500 mt-1">
            Manage your rental properties ({properties.length} total)
          </p>
        </div>
        <Button onClick={() => { setSelectedProperty(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      {properties.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first property</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                  <div className="absolute top-4 right-4">
                    <Badge className={statusColors[property.status as keyof typeof statusColors]}>
                      {property.status}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold mb-1">{property.name}</h3>
                    <div className="flex items-center text-sm opacity-90">
                      <MapPin className="h-3 w-3 mr-1" />
                      {property.city}, {property.state}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.address}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 border-y">
                    {property.bedrooms && (
                      <div className="flex items-center gap-2">
                        <Bed className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">{property.bedrooms} bed</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-2">
                        <Bath className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">{property.bathrooms} bath</span>
                      </div>
                    )}
                    {property.squareFeet && (
                      <div className="flex items-center gap-2">
                        <Square className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">{property.squareFeet} sqft</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-2xl font-bold text-gray-900">
                        ${property.rentAmount}
                      </span>
                      <span className="text-sm text-gray-500">/mo</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{property._count.tenants} tenants</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wrench className="h-4 w-4" />
                      <span>{property._count.maintenanceRequests} requests</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1" onClick={() => handleEdit(property)}>
                      Edit
                    </Button>
                    <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700" onClick={() => handleDelete(property.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
