import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/payments - List all payments
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (tenantId) where.tenantId = tenantId;
    if (status) where.status = status;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
      orderBy: {
        dueDate: 'desc',
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('[PAYMENTS_GET]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/payments - Create a new payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      companyId,
      tenantId,
      propertyId,
      amount,
      dueDate,
      paidDate,
      paymentMethod,
      status,
      notes,
    } = body;

    // Validate required fields
    if (!companyId || !tenantId || !amount || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        companyId,
        tenantId,
        propertyId: propertyId || null,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        paidDate: paidDate ? new Date(paidDate) : null,
        paymentMethod: paymentMethod || null,
        status: status || 'PENDING',
        notes: notes || null,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('[PAYMENTS_POST]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
