'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Home, User, Calendar, AlertCircle } from 'lucide-react';
import { MaintenanceDialog } from '@/components/maintenance/MaintenanceDialog';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type MaintenanceRequest = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
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
  };
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  } | null;
};

const priorityColors = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

const columns = [
  { id: 'REQUESTED', title: 'Requested', color: 'border-t-yellow-500' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-t-blue-500' },
  { id: 'COMPLETED', title: 'Completed', color: 'border-t-green-500' },
  { id: 'CLOSED', title: 'Closed', color: 'border-t-gray-500' },
];

function MaintenanceCard({ request, isDragging }: { request: MaintenanceRequest; isDragging?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: request.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border rounded-lg p-4 mb-3 cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-sm line-clamp-2">{request.title}</h4>
        <Badge className={priorityColors[request.priority as keyof typeof priorityColors]}>
          {request.priority}
        </Badge>
      </div>

      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{request.description}</p>

      <div className="space-y-2">
        <div className="flex items-center text-xs text-gray-500">
          <Home className="h-3 w-3 mr-1" />
          <span className="truncate">{request.property.name}</span>
        </div>

        {request.tenant && (
          <div className="flex items-center text-xs text-gray-500">
            <User className="h-3 w-3 mr-1" />
            <span>
              {request.tenant.firstName} {request.tenant.lastName}
            </span>
          </div>
        )}

        <div className="flex items-center text-xs text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/maintenance');
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch maintenance requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSaved = () => {
    fetchRequests();
    setDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const requestId = active.id as string;
    const newStatus = over.id as string;

    // Check if dropped on a column
    const isColumn = columns.some((col) => col.id === newStatus);
    if (!isColumn) {
      setActiveId(null);
      return;
    }

    const request = requests.find((r) => r.id === requestId);
    if (request && request.status !== newStatus) {
      // Optimistically update UI
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
      );

      // Update on server
      try {
        await fetch(`/api/maintenance/${requestId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
      } catch (error) {
        console.error('Failed to update request status:', error);
        // Revert on error
        fetchRequests();
      }
    }

    setActiveId(null);
  };

  const activeRequest = activeId ? requests.find((r) => r.id === activeId) : null;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Maintenance</h1>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-64 bg-gray-200 rounded" />
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Maintenance</h1>
          <p className="text-gray-500 mt-1">
            Manage maintenance requests ({requests.length} total)
          </p>
        </div>
        <Button onClick={() => { setSelectedRequest(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => {
            const columnRequests = requests.filter((r) => r.status === column.id);

            return (
              <Card key={column.id} className={`border-t-4 ${column.color}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>{column.title}</span>
                    <Badge variant="secondary">{columnRequests.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="min-h-[500px]">
                  <SortableContext
                    items={columnRequests.map((r) => r.id)}
                    strategy={verticalListSortingStrategy}
                    id={column.id}
                  >
                    <div
                      data-column-id={column.id}
                      className="space-y-3"
                    >
                      {columnRequests.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">
                          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          No requests
                        </div>
                      ) : (
                        columnRequests.map((request) => (
                          <div
                            key={request.id}
                            onClick={() => {
                              setSelectedRequest(request);
                              setDialogOpen(true);
                            }}
                          >
                            <MaintenanceCard
                              request={request}
                              isDragging={activeId === request.id}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </SortableContext>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <DragOverlay>
          {activeRequest ? <MaintenanceCard request={activeRequest} /> : null}
        </DragOverlay>
      </DndContext>

      <MaintenanceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        request={selectedRequest}
        onSaved={handleRequestSaved}
      />
    </div>
  );
}
