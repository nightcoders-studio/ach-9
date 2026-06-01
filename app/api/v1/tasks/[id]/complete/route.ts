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

    if (task.status !== 'on_progress') {
      return errorResponse('VALIDATION_ERROR', 'Task status must be on_progress to complete it', 400);
    }

    const now = new Date();

    // 1. Transaction context or sequential updates:
    // Update Task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'completed',
        completed_at: now,
        payment_status: 'paid',
        paid_at: now,
        transaction_id: `TRX${Math.floor(100000 + Math.random() * 900000)}`, // Generate sample trx id
      },
    });

    // Update ButerDetail stats
    await prisma.buterDetail.update({
      where: { userId: user.id },
      data: {
        total_earnings: { increment: task.price },
        total_tasks_completed: { increment: 1 },
      },
    });

    // Credit Wallet
    const wallet = await prisma.wallet.findUnique({
      where: { buter_id: user.id },
    });

    if (wallet) {
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: task.price },
        },
      });

      // Create earning transaction log
      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'earning',
          amount: task.price,
          task_id: task.id,
          date: now,
        },
      });
    }

    // Create notification for customer
    await prisma.notification.create({
      data: {
        userId: task.customer_id,
        type: 'task_completed',
        title: 'Tugas selesai',
        message: `Tugas belanja Anda "${task.description}" telah selesai`,
        related_task_id: task.id,
      },
    });

    const responseData = {
      id: updatedTask.id,
      status: updatedTask.status,
      timeline: {
        completed_at: updatedTask.completed_at?.toISOString(),
      },
    };

    return successResponse(responseData, 'Task completed successfully');
  } catch (error: any) {
    console.error('Complete task error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error completing task', 500);
  }
}
