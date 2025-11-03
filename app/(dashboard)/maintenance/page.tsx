'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Home, User, Calendar, AlertCircle, Clock } from 'lucide-react';
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
  LOW: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
  MEDIUM: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30',
  HIGH: 'bg-orange-500/10 text-orange-700 border-orange-500/30',
  URGENT: 'bg-red-500/10 text-red-700 border-red-500/30',
};

const columns = [
  { id: 'REQUESTED', title: 'Requested', color: 'from-yellow-500 to-orange-500', icon: Clock },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'from-blue-500 to-cyan-500', icon: AlertCircle },
  { id: 'COMPLETED', title: 'Completed', color: 'from-green-500 to-emerald-500', icon: Calendar },
  { id: 'CLOSED', title: 'Closed', color: 'from-gray-500 to-slate-500', icon: Home },
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
      className="glass border-0 shadow-premium rounded-xl p-4 mb-3 cursor-move hover:shadow-premium-lg hover-lift transition-all duration-300 group"
    >
      {/* Header with Title and Priority */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <h4 className="font-semibold text-sm line-clamp-2 flex-1 text-gray-900 group-hover:text-blue-600 transition-colors">
          {request.title}
        </h4>
        <Badge
          variant="outline"
          className={`${priorityColors[request.priority as keyof typeof priorityColors]} font-semibold text-xs flex-shrink-0`}
        >
          {request.priority}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
        {request.description}
      </p>

      {/* Property, Tenant, Date Info */}
      <div className="space-y-2">
        {/* Property */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-sm flex-shrink-0">
            <Home className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-xs font-medium text-gray-700 truncate">{request.property.name}</span>
        </div>

        {/* Tenant */}
        {request.tenant && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm flex-shrink-0">
              <User className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-700">
              {request.tenant.firstName} {request.tenant.lastName}
            </span>
          </div>
        )}

        {/* Created Date */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm flex-shrink-0">
            <Calendar className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(request.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
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
      <div className="space-y-8 p-8">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-white/50 rounded-lg animate-pulse" />
          <div className="h-6 w-96 bg-white/30 rounded-lg animate-pulse" />
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="glass shadow-premium animate-pulse">
              <CardContent className="p-6">
                <div className="h-96 bg-white/50 rounded" />
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
            Maintenance
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage maintenance requests ({requests.length} total)
          </p>
        </div>
        <Button
          onClick={() => { setSelectedRequest(null); setDialogOpen(true); }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => {
            const columnRequests = requests.filter((r) => r.status === column.id);
            const ColumnIcon = column.icon;

            return (
              <Card key={column.id} className="glass border-0 shadow-premium-lg overflow-hidden">
                {/* Column Header with Gradient */}
                <div className={`h-2 bg-gradient-to-r ${column.color}`} />
                <CardHeader className="pb-3 bg-white/50">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${column.color} flex items-center justify-center shadow-md`}>
                        <ColumnIcon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-900">{column.title}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-white/70 border-gray-300 font-bold"
                    >
                      {columnRequests.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>

                {/* Column Content */}
                <CardContent className="min-h-[600px] p-4">
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
                        <div className="text-center py-16">
                          <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${column.color} flex items-center justify-center mx-auto mb-4 opacity-20`}>
                            <ColumnIcon className="h-8 w-8 text-white" />
                          </div>
                          <p className="text-sm text-muted-foreground">No requests</p>
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
          {activeRequest ? (
            <div className="rotate-3 scale-105">
              <MaintenanceCard request={activeRequest} />
            </div>
          ) : null}
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
