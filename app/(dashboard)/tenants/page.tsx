import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function TenantsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tenants</h1>
          <p className="text-gray-500 mt-1">Manage your tenants</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Tenant
        </Button>
      </div>

      <Card className="p-12 text-center">
        <p className="text-gray-500">Tenant management coming soon...</p>
      </Card>
    </div>
  );
}
