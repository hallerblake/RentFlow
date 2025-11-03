import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tenants - List all tenants
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const propertyId = searchParams.get('propertyId');

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (propertyId) where.propertyId = propertyId;

    const tenants = await prisma.tenant.findMany({
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
        _count: {
          select: {
            payments: true,
            maintenanceRequests: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tenants);
  } catch (error) {
    console.error('[TENANTS_GET]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/tenants - Create a new tenant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      companyId,
      propertyId,
      firstName,
      lastName,
      email,
      phone,
      leaseStartDate,
      leaseEndDate,
      rentAmount,
      depositPaid,
      isActive,
      emergencyContactName,
      emergencyContactPhone,
      notes,
    } = body;

    // Validate required fields
    if (!companyId || !firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.create({
      data: {
        companyId,
        propertyId: propertyId || null,
        firstName,
        lastName,
        email,
        phone,
        leaseStartDate: leaseStartDate ? new Date(leaseStartDate) : null,
        leaseEndDate: leaseEndDate ? new Date(leaseEndDate) : null,
        rentAmount: rentAmount ? parseFloat(rentAmount) : null,
        depositPaid: depositPaid ? parseFloat(depositPaid) : null,
        isActive: isActive ?? true,
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || null,
        notes: notes || null,
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

    return NextResponse.json(tenant, { status: 201 });
  } catch (error) {
    console.error('[TENANTS_POST]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
