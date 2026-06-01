import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse: authError } = await authenticate(request, ['buter', 'customer']);
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
      },
    });

    if (!task) {
      return errorResponse('NOT_FOUND', 'Task not found', 404);
    }

    if (task.status !== 'waiting') {
      return errorResponse('VALIDATION_ERROR', 'Task not in waiting status', 400);
    }

    let assignedButerId: number;
    let assignedButerName = '';

    if (user.role === 'customer') {
      // Customer accepting a bid
      if (task.customer_id !== user.id) {
        return errorResponse('FORBIDDEN', 'You do not own this task', 403);
      }
      
      const body = await request.json().catch(() => ({}));
      const { buter_id } = body;
      if (!buter_id) {
        return errorResponse('VALIDATION_ERROR', 'buter_id is required in body for customer assignment', 400);
      }
      
      assignedButerId = parseInt(buter_id);
      const targetButer = await prisma.user.findUnique({
        where: { id: assignedButerId },
        include: { buter_detail: true }
      });
      
      if (!targetButer || targetButer.role !== 'buter' || targetButer.buter_detail?.approval_status !== 'approved') {
        return errorResponse('VALIDATION_ERROR', 'Selected helper is not an approved Superhero', 400);
      }
      assignedButerName = targetButer.full_name;
    } else {
      // Buter self-assigning
      if (!user.is_verified) {
        return errorResponse('FORBIDDEN', 'Your Superhero registration is not approved yet', 403);
      }
      assignedButerId = user.id;
      assignedButerName = user.full_name;
    }

    // Update Task
    const now = new Date();
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'taken',
        buter_id: assignedButerId,
        taken_at: now,
      },
      include: {
        buter: {
          include: {
            buter_detail: true,
          },
        },
      },
    });

    // Create notification for the customer
    await prisma.notification.create({
      data: {
        userId: task.customer_id,
        type: 'task_accepted',
        title: 'Tugas diambil',
        message: `Tugas Anda "${task.description}" telah diambil oleh Superhero ${assignedButerName}`,
        related_task_id: task.id,
      },
    });

    const responseData = {
      id: updatedTask.id,
      status: updatedTask.status,
      buter_id: updatedTask.buter_id,
      buter_snapshot: {
        full_name: updatedTask.buter?.full_name,
        phone: updatedTask.buter?.phone,
        vehicle_type: updatedTask.buter?.buter_detail?.vehicle_type || 'Motor',
      },
      timeline: {
        created_at: updatedTask.created_at.toISOString(),
        taken_at: updatedTask.taken_at?.toISOString(),
      },
    };

    return successResponse(responseData, 'Task accepted successfully');
  } catch (error: any) {
    console.error('Accept task error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error accepting task', 500);
  }
}
