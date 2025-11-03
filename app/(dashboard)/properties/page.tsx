import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Properties</h1>
          <p className="text-gray-500 mt-1">Manage your rental properties</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      {/* Properties grid will go here */}
      <Card className="p-12 text-center">
        <p className="text-gray-500">Properties management coming soon...</p>
      </Card>
    </div>
  );
}
