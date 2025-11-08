import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// GET /api/properties - List all properties
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const searchParams = request.nextUrl.searchParams;
    const companyIdParam = searchParams.get('companyId');

    // Use selectedCompanyId from session, or fall back to query parameter
    const companyId = session.selectedCompanyId || companyIdParam;

    // If user is not SUPER_ADMIN and no company is selected, return error
    if (!companyId && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No company selected' },
        { status: 400 }
      );
    }

    const where = companyId ? { companyId } : {};

    const properties = await prisma.property.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tenants: true,
            maintenanceRequests: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error('[PROPERTIES_GET]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/properties - Create a new property
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      companyId,
      name,
      address,
      city,
      state,
      zipCode,
      type,
      bedrooms,
      bathrooms,
      squareFeet,
      rentAmount,
      depositAmount,
      status,
      description,
    } = body;

    // Validate required fields
    if (!companyId || !name || !address || !city || !state || !zipCode || !type || !rentAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const property = await prisma.property.create({
      data: {
        companyId,
        name,
        address,
        city,
        state,
        zipCode,
        type,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseFloat(bathrooms) : null,
        squareFeet: squareFeet ? parseInt(squareFeet) : null,
        rentAmount: parseFloat(rentAmount),
        depositAmount: depositAmount ? parseFloat(depositAmount) : null,
        status: status || 'VACANT',
        description,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error('[PROPERTIES_POST]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
