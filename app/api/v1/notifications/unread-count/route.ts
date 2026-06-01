import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const { user, errorResponse: authError } = await authenticate(request);
    if (authError) return authError;

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, is_read: false },
    });

    const responseData = { unread_count: unreadCount };
    return successResponse(responseData);
  } catch (error: any) {
    console.error('Get unread count error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error retrieving unread count', 500);
  }
}
