import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';

// GET - Get a single expense
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getSession();
    const companyId = session.selectedCompanyId;

    const expense = await prisma.expense.findUnique({
      where: { id },
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

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (session.role !== 'SUPER_ADMIN' && expense.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
      { status: 500 }
    );
  }
}

// PATCH - Update an expense
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getSession();
    const companyId = session.selectedCompanyId;

    if (!companyId) {
      return NextResponse.json(
        { error: 'No company selected' },
        { status: 400 }
      );
    }

    // Check if expense exists and belongs to current company
    const existing = await prisma.expense.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    if (existing.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { categoryId, amount, date, vendor, paymentMethod, description, propertyId } = data;

    // If category is being changed, verify it belongs to the company
    if (categoryId && categoryId !== existing.categoryId) {
      const category = await prisma.expenseCategory.findUnique({
        where: { id: categoryId },
      });

      if (!category || category.companyId !== companyId) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        );
      }
    }

    // If property is being changed, verify it belongs to the company
    if (propertyId !== undefined && propertyId !== existing.propertyId) {
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
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        categoryId: categoryId || existing.categoryId,
        amount: amount ? parseFloat(amount) : existing.amount,
        date: date ? new Date(date) : existing.date,
        vendor: vendor !== undefined ? vendor : existing.vendor,
        paymentMethod: paymentMethod !== undefined ? paymentMethod : existing.paymentMethod,
        description: description !== undefined ? description : existing.description,
        propertyId: propertyId !== undefined ? propertyId : existing.propertyId,
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

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an expense
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getSession();
    const companyId = session.selectedCompanyId;

    if (!companyId) {
      return NextResponse.json(
        { error: 'No company selected' },
        { status: 400 }
      );
    }

    // Check if expense exists and belongs to current company
    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    if (expense.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
