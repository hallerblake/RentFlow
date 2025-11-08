import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';

// PATCH - Update an expense category
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

    const data = await request.json();
    const { name } = data;

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category exists and belongs to current company
    const existing = await prisma.expenseCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    if (existing.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if name is already used by another category
    if (name !== existing.name) {
      const duplicate = await prisma.expenseCategory.findUnique({
        where: {
          companyId_name: {
            companyId,
            name,
          },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'A category with this name already exists' },
          { status: 409 }
        );
      }
    }

    const category = await prisma.expenseCategory.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating expense category:', error);
    return NextResponse.json(
      { error: 'Failed to update expense category' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an expense category
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

    // Check if category exists and belongs to current company
    const category = await prisma.expenseCategory.findUnique({
      where: { id },
      include: {
        expenses: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    if (category.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if category is being used by any expenses
    if (category.expenses.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that is being used by expenses' },
        { status: 409 }
      );
    }

    await prisma.expenseCategory.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense category:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense category' },
      { status: 500 }
    );
  }
}
