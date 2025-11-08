import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';

// GET - List all expenses for the selected company
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

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

// POST - Create a new expense
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const companyId = session.selectedCompanyId;

    if (!companyId) {
      return NextResponse.json(
        { error: 'No company selected' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { categoryId, amount, date, vendor, paymentMethod, description, propertyId } = data;

    if (!categoryId || !amount) {
      return NextResponse.json(
        { error: 'Category and amount are required' },
        { status: 400 }
      );
    }

    // Verify category belongs to the company
    const category = await prisma.expenseCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // If property is specified, verify it belongs to the company
    if (propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });

      if (!property || property.companyId !== companyId) {
        return NextResponse.json(
          { error: 'Invalid property' },
          { status: 400 }
        );
      }
    }

    const expense = await prisma.expense.create({
      data: {
        companyId,
        categoryId,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
        vendor: vendor || null,
        paymentMethod: paymentMethod || null,
        description: description || null,
        propertyId: propertyId || null,
      },
      include: {
        category: true,
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
