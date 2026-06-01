import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';
import { formatTaskDetail } from '../route';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse: authError } = await authenticate(request);
    if (authError) return authError;

    const { id } = await params;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return errorResponse('VALIDATION_ERROR', 'Invalid task ID', 400);
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        customer: true,
        buter: {
          include: {
            buter_detail: true,
          },
        },
        review: true,
        tracking_history: {
          orderBy: { time: 'asc' },
        },
      },
    });

    if (!task) {
      return errorResponse('NOT_FOUND', 'Task not found', 404);
    }

    const responseData = formatTaskDetail(task);
    return successResponse(responseData);
  } catch (error: any) {
    console.error('Get task details error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error retrieving task details', 500);
  }
}
