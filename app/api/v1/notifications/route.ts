import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const { user, errorResponse: authError } = await authenticate(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const is_read = searchParams.get('is_read');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {
      userId: user.id,
    };

    if (is_read !== null) {
      where.is_read = is_read === 'true';
    }
    if (type) {
      where.type = type;
    }

    const total = await prisma.notification.count({ where });

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Populate task snapshots
    const formattedNotifications = await Promise.all(
      notifications.map(async (n) => {
        let related_task_snapshot = null;
        if (n.related_task_id) {
          const task = await prisma.task.findUnique({
            where: { id: n.related_task_id },
          });
          if (task) {
            related_task_snapshot = {
              description: task.description,
              price: task.price,
            };
          }
        }

        return {
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          related_task_id: n.related_task_id,
          related_task_snapshot,
          is_read: n.is_read,
          created_at: n.created_at.toISOString(),
        };
      })
    );

    const responseData = {
      notifications: formattedNotifications,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit) || 1,
      },
    };

    return successResponse(responseData);
  } catch (error: any) {
    console.error('List notifications error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error listing notifications', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, errorResponse: authError } = await authenticate(request);
    if (authError) return authError;

    // Mark all as read
    const { count } = await prisma.notification.updateMany({
      where: { userId: user.id, is_read: false },
      data: { is_read: true },
    });

    const responseData = { count };
    return successResponse(responseData, 'All notifications marked as read');
  } catch (error: any) {
    console.error('Mark all notifications read error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error marking notifications as read', 500);
  }
}
