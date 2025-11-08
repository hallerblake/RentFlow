import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email - use raw query to avoid schema issues
    const user = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id, email, name, image, password, role FROM "User" WHERE email = $1 LIMIT 1`,
      email
    );

    if (!user || user.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const dbUser = user[0];

    // Check if user has a password
    if (!dbUser.password) {
      return NextResponse.json(
        { error: 'Please contact admin to set up your password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, dbUser.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Get user's first company assignment for selectedCompanyId
    const userCompanies = await prisma.$queryRawUnsafe<any[]>(
      `SELECT c.id FROM "UserCompany" uc
       JOIN "Company" c ON uc."companyId" = c.id
       WHERE uc."userId" = $1
       ORDER BY c.name
       LIMIT 1`,
      dbUser.id
    );

    // Create session
    const session = await getSession();
    session.userId = dbUser.id;
    session.email = dbUser.email;
    session.name = dbUser.name || undefined;
    session.image = dbUser.image || undefined;
    session.role = dbUser.role;
    session.selectedCompanyId = userCompanies.length > 0 ? userCompanies[0].id : undefined;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        image: dbUser.image,
        role: dbUser.role,
      },
    });
  } catch (error) {
    console.error('[LOGIN_ERROR]', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
