import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();

    // Only SUPER_ADMIN can access user management
    const users = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id, email, name, role FROM "User" WHERE id = $1 LIMIT 1`,
      session.userId
    );

    if (!users || users.length === 0 || users[0].role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch all users with their company assignments
    const allUsers = await prisma.$queryRawUnsafe<any[]>(`
      SELECT
        u.id,
        u.email,
        u.name,
        u.role,
        u."isActive",
        COALESCE(
          json_agg(
            json_build_object(
              'company', json_build_object(
                'id', c.id,
                'name', c.name
              )
            ) ORDER BY c.name
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) as "companyAssignments"
      FROM "User" u
      LEFT JOIN "UserCompany" uc ON u.id = uc."userId"
      LEFT JOIN "Company" c ON uc."companyId" = c.id
      GROUP BY u.id, u.email, u.name, u.role, u."isActive"
      ORDER BY u.email
    `);

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error('[USERS_GET_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
