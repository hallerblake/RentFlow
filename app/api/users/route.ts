import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/users - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user from database to check role
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser || (dbUser.role !== 'SUPER_ADMIN' && dbUser.role !== 'COMPANY_ADMIN')) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');

    // Super admins can see all users, company admins see only their company's users
    let where = {};
    if (dbUser.role === 'COMPANY_ADMIN' || companyId) {
      where = {
        companyAssignments: {
          some: {
            companyId: companyId || undefined,
          },
        },
      };
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        companyAssignments: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('[USERS_GET]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user from database to check role
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser || (dbUser.role !== 'SUPER_ADMIN' && dbUser.role !== 'COMPANY_ADMIN')) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { clerkId, email, firstName, lastName, role, isActive, companyIds } = body;

    // Validate required fields
    if (!clerkId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Company admins cannot create super admins
    if (dbUser.role === 'COMPANY_ADMIN' && role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Cannot create super admin' },
        { status: 403 }
      );
    }

    // Create user and company assignments in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          clerkId,
          email,
          firstName,
          lastName,
          role: role || 'USER',
          isActive: isActive !== undefined ? isActive : true,
        },
      });

      // Create company assignments if provided
      if (companyIds && companyIds.length > 0) {
        await tx.userCompany.createMany({
          data: companyIds.map((companyId: string) => ({
            userId: newUser.id,
            companyId,
          })),
        });
      }

      return await tx.user.findUnique({
        where: { id: newUser.id },
        include: {
          companyAssignments: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      });
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('[USERS_POST]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
