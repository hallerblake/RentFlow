import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/maintenance - List all maintenance requests
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status');

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (propertyId) where.propertyId = propertyId;
    if (status) where.status = status;

    const requests = await prisma.maintenanceRequest.findMany({
      where,
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
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('[MAINTENANCE_GET]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/maintenance - Create a new maintenance request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      companyId,
      propertyId,
      tenantId,
      title,
      description,
      priority,
      status,
    } = body;

    // Validate required fields
    if (!companyId || !propertyId || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data: {
        companyId,
        propertyId,
        tenantId: tenantId || null,
        title,
        description,
        priority: priority || 'MEDIUM',
        status: status || 'REQUESTED',
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

    return NextResponse.json(maintenanceRequest, { status: 201 });
  } catch (error) {
    console.error('[MAINTENANCE_POST]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
