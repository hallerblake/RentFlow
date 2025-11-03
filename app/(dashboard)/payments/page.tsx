import { Card } from '@/components/ui/card';

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Payments</h1>
        <p className="text-gray-500 mt-1">Track and manage rent payments</p>
      </div>

      <Card className="p-12 text-center">
        <p className="text-gray-500">Payment tracking coming soon...</p>
      </Card>
    </div>
  );
}
