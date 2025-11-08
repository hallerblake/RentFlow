import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getSession();

    // Only SUPER_ADMIN can update users
    const users = await prisma.$queryRawUnsafe<any[]>(
      `SELECT role FROM "User" WHERE id = $1 LIMIT 1`,
      session.userId
    );

    if (!users || users.length === 0 || users[0].role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { role, isActive, companyIds } = body;

    // Update user role and active status
    if (role !== undefined) {
      await prisma.$queryRawUnsafe(
        `UPDATE "User" SET role = $1 WHERE id = $2`,
        role,
        id
      );
    }

    if (isActive !== undefined) {
      await prisma.$queryRawUnsafe(
        `UPDATE "User" SET "isActive" = $1 WHERE id = $2`,
        isActive,
        id
      );
    }

    // Update company assignments
    if (companyIds !== undefined) {
      // Delete existing assignments
      await prisma.$queryRawUnsafe(
        `DELETE FROM "UserCompany" WHERE "userId" = $1`,
        id
      );

      // Add new assignments
      for (const companyId of companyIds) {
        await prisma.$queryRawUnsafe(
          `INSERT INTO "UserCompany" ("id", "userId", "companyId", "createdAt") VALUES (gen_random_uuid(), $1, $2, NOW())`,
          id,
          companyId
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[USER_UPDATE_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
