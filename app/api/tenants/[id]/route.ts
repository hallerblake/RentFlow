import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tenants/[id] - Get a single tenant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenant = await prisma.tenant.findUnique({
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
        payments: {
          orderBy: { dueDate: 'desc' },
          take: 10,
        },
        maintenanceRequests: {
          where: { status: { not: 'CLOSED' } },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            payments: true,
            maintenanceRequests: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(tenant);
  } catch (error) {
    console.error('[TENANT_GET]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH /api/tenants/[id] - Update a tenant
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        ...body,
        leaseStartDate: body.leaseStartDate ? new Date(body.leaseStartDate) : undefined,
        leaseEndDate: body.leaseEndDate ? new Date(body.leaseEndDate) : undefined,
        rentAmount: body.rentAmount ? parseFloat(body.rentAmount) : undefined,
        depositPaid: body.depositPaid ? parseFloat(body.depositPaid) : undefined,
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
      },
    });

    return NextResponse.json(tenant);
  } catch (error) {
    console.error('[TENANT_PATCH]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/tenants/[id] - Delete a tenant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.tenant.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[TENANT_DELETE]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
