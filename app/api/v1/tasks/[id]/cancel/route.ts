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
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return errorResponse('VALIDATION_ERROR', 'Invalid task ID', 400);
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return errorResponse('NOT_FOUND', 'Task not found', 404);
    }

    // Role verification: Only task owner (customer) or admin can cancel
    if (task.customer_id !== user.id && user.role !== 'admin') {
      return errorResponse('FORBIDDEN', 'Only the customer or an admin can cancel this task', 403);
    }

    if (task.status === 'completed' || task.status === 'cancelled') {
      return errorResponse('VALIDATION_ERROR', `Cannot cancel a task that is already ${task.status}`, 400);
    }

    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return errorResponse('VALIDATION_ERROR', 'Cancel reason is required', 400);
    }

    const now = new Date();
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'cancelled',
        cancelled_at: now,
        cancel_reason: reason,
      },
    });

    // Create notification for buter if assigned
    if (task.buter_id) {
      await prisma.notification.create({
        data: {
          userId: task.buter_id,
          type: 'task_cancelled',
          title: 'Tugas dibatalkan',
          message: `Tugas "${task.description}" telah dibatalkan oleh customer. Alasan: ${reason}`,
          related_task_id: task.id,
        },
      });
    }

    const responseData = {
      id: updatedTask.id,
      status: updatedTask.status,
    };

    return successResponse(responseData, 'Task cancelled');
  } catch (error: any) {
    console.error('Cancel task error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error cancelling task', 500);
  }
}
