import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/maintenance/[id] - Get a single maintenance request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const maintenanceRequest = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
          },
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!maintenanceRequest) {
      return NextResponse.json(
        { error: 'Maintenance request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(maintenanceRequest);
  } catch (error) {
    console.error('[MAINTENANCE_REQUEST_GET]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH /api/maintenance/[id] - Update a maintenance request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const maintenanceRequest = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        ...body,
        resolvedAt: body.status === 'CLOSED' && !body.resolvedAt ? new Date() : body.resolvedAt,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(maintenanceRequest);
  } catch (error) {
    console.error('[MAINTENANCE_REQUEST_PATCH]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/maintenance/[id] - Delete a maintenance request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.maintenanceRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[MAINTENANCE_REQUEST_DELETE]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
