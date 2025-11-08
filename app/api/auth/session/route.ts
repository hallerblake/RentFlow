import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ user: null });
    }

    // Fetch fresh user data from database - use raw query
    const users = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id, email, name, image, role FROM "User" WHERE id = $1 LIMIT 1`,
      session.userId
    );

    if (!users || users.length === 0) {
      session.destroy();
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: users[0] });
  } catch (error) {
    console.error('[SESSION_ERROR]', error);
    return NextResponse.json({ user: null });
  }
}
