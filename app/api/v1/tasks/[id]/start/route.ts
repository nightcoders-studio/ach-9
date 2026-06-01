import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse: authError } = await authenticate(request, ['buter']);
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

    if (task.buter_id !== user.id) {
      return errorResponse('FORBIDDEN', 'You are not the assigned buter for this task', 403);
    }

    if (task.status !== 'taken') {
      return errorResponse('VALIDATION_ERROR', 'Task status must be taken to start it', 400);
    }

    // Update Task
    const now = new Date();
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'on_progress',
        started_at: now,
      },
    });

    // Create notification for the customer
    await prisma.notification.create({
      data: {
        userId: task.customer_id,
        type: 'task_started',
        title: 'Tugas dimulai',
        message: `Tugas Anda "${task.description}" sedang berjalan.`,
        related_task_id: task.id,
      },
    });

    const responseData = {
      id: updatedTask.id,
      status: updatedTask.status,
      timeline: {
        started_at: updatedTask.started_at?.toISOString(),
      },
    };

    return successResponse(responseData, 'Task started');
  } catch (error: any) {
    console.error('Start task error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error starting task', 500);
  }
}
