import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';

// GET - List all expense categories for the selected company
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const companyId = session.selectedCompanyId;

    // If user is not SUPER_ADMIN and no company is selected, return error
    if (!companyId && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No company selected' },
        { status: 400 }
      );
    }

    const where = companyId ? { companyId } : {};

    const categories = await prisma.expenseCategory.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense categories' },
      { status: 500 }
    );
  }
}

// POST - Create a new expense category
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
    const { name } = data;

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category with same name already exists for this company
    const existing = await prisma.expenseCategory.findUnique({
      where: {
        companyId_name: {
          companyId,
          name,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 409 }
      );
    }

    const category = await prisma.expenseCategory.create({
      data: {
        name,
        companyId,
        isDefault: false,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating expense category:', error);
    return NextResponse.json(
      { error: 'Failed to create expense category' },
      { status: 500 }
    );
  }
}
