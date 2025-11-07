import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/users/[id] - Get user by ID (admin only)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser || (dbUser.role !== 'SUPER_ADMIN' && dbUser.role !== 'COMPANY_ADMIN')) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id },
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

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('[USER_GET]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Update user (admin only)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser || (dbUser.role !== 'SUPER_ADMIN' && dbUser.role !== 'COMPANY_ADMIN')) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const { firstName, lastName, role, isActive, companyIds } = body;

    // Company admins cannot modify super admins
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (
      dbUser.role === 'COMPANY_ADMIN' &&
      (targetUser?.role === 'SUPER_ADMIN' || role === 'SUPER_ADMIN')
    ) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot modify super admin' },
        { status: 403 }
      );
    }

    // Update user and company assignments in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Update user basic fields
      await tx.user.update({
        where: { id },
        data: {
          firstName,
          lastName,
          role,
          isActive,
        },
      });

      // Update company assignments if provided
      if (companyIds !== undefined) {
        // Remove all existing assignments
        await tx.userCompany.deleteMany({
          where: { userId: id },
        });

        // Create new assignments
        if (companyIds.length > 0) {
          await tx.userCompany.createMany({
            data: companyIds.map((companyId: string) => ({
              userId: id,
              companyId,
            })),
          });
        }
      }

      return await tx.user.findUnique({
        where: { id },
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

    return NextResponse.json(user);
  } catch (error) {
    console.error('[USER_PATCH]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser || dbUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Super admin access required' },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    // Prevent deleting yourself
    if (dbUser.id === id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Company assignments will be deleted automatically due to cascade
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[USER_DELETE]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
