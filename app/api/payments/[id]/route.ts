import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/payments/[id] - Get a single payment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payment = await prisma.payment.findUnique({
      where: { id },
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
            email: true,
            phone: true,
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
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error('[PAYMENT_GET]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH /api/payments/[id] - Update a payment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        ...body,
        amount: body.amount ? parseFloat(body.amount) : undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        paidDate: body.paidDate ? new Date(body.paidDate) : undefined,
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

    return NextResponse.json(payment);
  } catch (error) {
    console.error('[PAYMENT_PATCH]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/payments/[id] - Delete a payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.payment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PAYMENT_DELETE]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
