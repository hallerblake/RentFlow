import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const searchParams = request.nextUrl.searchParams;
    const companyIdParam = searchParams.get('companyId');

    // Use selectedCompanyId from session, or fall back to query parameter
    const companyId = session.selectedCompanyId || companyIdParam;

    // If user is not SUPER_ADMIN and no company is selected, return error
    if (!companyId && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No company selected' },
        { status: 400 }
      );
    }

    const where = companyId ? { companyId } : {};

    // Test database connection first
    await prisma.$connect();

    // Get total properties count
    const propertiesCount = await prisma.property.count({ where });

    // Get occupied properties count (properties with active tenants)
    const occupiedCount = await prisma.property.count({
      where: {
        ...where,
        tenants: {
          some: {
            isActive: true,
          },
        },
      },
    });

    // Get total revenue from paid payments this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyPayments = await prisma.payment.findMany({
      where: {
        ...where,
        status: 'PAID',
        paidDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const monthlyRevenue = monthlyPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get pending maintenance requests count
    const pendingMaintenance = await prisma.maintenanceRequest.count({
      where: {
        ...where,
        status: {
          in: ['REQUESTED', 'IN_PROGRESS'],
        },
      },
    });

    // Get urgent maintenance count
    const urgentMaintenance = await prisma.maintenanceRequest.count({
      where: {
        ...where,
        priority: 'URGENT',
        status: {
          in: ['REQUESTED', 'IN_PROGRESS'],
        },
      },
    });

    // Get upcoming payments (next 30 days, pending status)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingPayments = await prisma.payment.findMany({
      where: {
        ...where,
        status: 'PENDING',
        dueDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
      include: {
        tenant: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        property: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
      take: 5,
    });

    // Get recent activity (last 10 payments, maintenance requests, etc.)
    const recentPayments = await prisma.payment.findMany({
      where: {
        ...where,
        status: 'PAID',
      },
      include: {
        tenant: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        paidDate: 'desc',
      },
      take: 3,
    });

    const recentMaintenance = await prisma.maintenanceRequest.findMany({
      where,
      include: {
        property: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
    });

    // Combine and sort recent activity
    const recentActivity = [
      ...recentPayments.map((p) => ({
        id: `payment-${p.id}`,
        type: 'payment',
        message: `Payment received from ${p.tenant.firstName} ${p.tenant.lastName}`,
        time: p.paidDate || p.createdAt,
      })),
      ...recentMaintenance.map((m) => ({
        id: `maintenance-${m.id}`,
        type: 'maintenance',
        message: `${m.title} at ${m.property.name}`,
        time: m.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5)
      .map((activity) => ({
        ...activity,
        time: getTimeAgo(new Date(activity.time)),
      }));

    return NextResponse.json({
      metrics: {
        properties: propertiesCount,
        occupied: occupiedCount,
        revenue: monthlyRevenue,
        maintenance: pendingMaintenance,
        urgentMaintenance,
      },
      upcomingPayments: upcomingPayments.map((p) => ({
        id: p.id,
        tenant: `${p.tenant.firstName} ${p.tenant.lastName}`,
        property: p.property?.name || 'No property',
        amount: p.amount,
        dueDate: p.dueDate.toISOString().split('T')[0],
      })),
      recentActivity,
    });
  } catch (error) {
    console.error('[DASHBOARD_STATS_GET] Error:', error);
    console.error('[DASHBOARD_STATS_GET] Error details:', JSON.stringify(error, null, 2));

    // Return a more detailed error for debugging
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString();
}
