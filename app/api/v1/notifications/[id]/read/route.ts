import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse: authError } = await authenticate(request);
    if (authError) return authError;

    const { id } = await params;
    const notificationId = parseInt(id);
    if (isNaN(notificationId)) {
      return errorResponse('VALIDATION_ERROR', 'Invalid notification ID', 400);
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return errorResponse('NOT_FOUND', 'Notification not found', 404);
    }

    if (notification.userId !== user.id) {
      return errorResponse('FORBIDDEN', 'Access denied to this notification', 403);
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { is_read: true },
    });

    const responseData = {
      id: updated.id,
      is_read: updated.is_read,
    };

    return successResponse(responseData, 'Notification marked as read');
  } catch (error: any) {
    console.error('Mark notification read error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error updating notification', 500);
  }
}
