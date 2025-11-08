import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import bcrypt from 'bcryptjs';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getSession();

    // Only SUPER_ADMIN can reset passwords
    const users = await prisma.$queryRawUnsafe<any[]>(
      `SELECT role FROM "User" WHERE id = $1 LIMIT 1`,
      session.userId
    );

    if (!users || users.length === 0 || users[0].role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Reset password to default
    const hashedPassword = await bcrypt.hash('password123', 10);

    await prisma.$queryRawUnsafe(
      `UPDATE "User" SET password = $1 WHERE id = $2`,
      hashedPassword,
      id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PASSWORD_RESET_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
