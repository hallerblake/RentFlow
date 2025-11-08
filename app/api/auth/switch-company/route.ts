import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { companyId } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify user has access to this company
    const hasAccess = await prisma.$queryRawUnsafe<any[]>(
      `SELECT 1 FROM "UserCompany" WHERE "userId" = $1 AND "companyId" = $2 LIMIT 1`,
      session.userId,
      companyId
    );

    if (!hasAccess || hasAccess.length === 0) {
      return NextResponse.json(
        { error: 'Access denied to this company' },
        { status: 403 }
      );
    }

    // Update session
    session.selectedCompanyId = companyId;
    await session.save();

    return NextResponse.json({ success: true, companyId });
  } catch (error) {
    console.error('[SWITCH_COMPANY_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to switch company' },
      { status: 500 }
    );
  }
}
