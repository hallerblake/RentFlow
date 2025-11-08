import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

// Default expense categories that property owners commonly use
const DEFAULT_CATEGORIES = [
  'Loan Repayment',
  'Mortgage Payment',
  'Property Taxes',
  'Insurance',
  'Repairs & Maintenance',
  'Property Management Fees',
  'Utilities',
  'Landscaping',
  'Cleaning Services',
  'Legal & Professional Fees',
  'Advertising & Marketing',
  'Office Supplies',
  'HOA Fees',
  'Pest Control',
  'Snow Removal',
  'Capital Improvements',
  'Depreciation',
  'Other',
];

// POST - Initialize default categories for the current company
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

    // Check if company already has categories
    const existingCategories = await prisma.expenseCategory.findMany({
      where: { companyId },
    });

    if (existingCategories.length > 0) {
      return NextResponse.json(
        { message: 'Company already has categories', count: existingCategories.length },
        { status: 200 }
      );
    }

    // Create default categories
    const categories = await prisma.$transaction(
      DEFAULT_CATEGORIES.map((name) =>
        prisma.expenseCategory.create({
          data: {
            name,
            companyId,
            isDefault: true,
          },
        })
      )
    );

    return NextResponse.json(
      {
        message: 'Default categories created successfully',
        count: categories.length,
        categories,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error initializing default categories:', error);
    return NextResponse.json(
      { error: 'Failed to initialize default categories' },
      { status: 500 }
    );
  }
}
