import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// POST /api/users/sync - Create or update user from Clerk
export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { clerkId, email, firstName, lastName } = body;

    // Verify the clerkId matches the authenticated user
    if (clerkId !== clerkUser.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId },
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

    if (existingUser) {
      return NextResponse.json(existingUser);
    }

    // Check if this is Blake Haller (super admin)
    const role = email === 'haller.blake@gmail.com' ? 'SUPER_ADMIN' : 'USER';

    // Create new user
    const user = await prisma.user.create({
      data: {
        clerkId,
        email,
        firstName,
        lastName,
        role,
        isActive: true,
      },
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

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('[USERS_SYNC_POST]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
