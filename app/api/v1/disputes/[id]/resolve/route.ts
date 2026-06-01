import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse: authError } = await authenticate(request, ['admin']);
    if (authError) return authError;

    const { id } = await params;
    const disputeId = parseInt(id);
    if (isNaN(disputeId)) {
      return errorResponse('VALIDATION_ERROR', 'Invalid dispute ID', 400);
    }

    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      return errorResponse('NOT_FOUND', 'Dispute not found', 404);
    }

    const body = await request.json();
    const { resolution, status } = body;

    if (!resolution || !status || (status !== 'resolved' && status !== 'closed')) {
      return errorResponse('VALIDATION_ERROR', 'resolution (string) and status (resolved or closed) are required', 400);
    }

    // Update Dispute
    const updatedDispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status,
        resolution,
      },
    });

    // Optionally update task status to match (e.g. completed or cancelled depending on resolution)
    // For safety, let's update task status to 'completed' if resolved, or 'cancelled' if closed
    const targetTaskStatus = status === 'resolved' ? 'completed' : 'cancelled';
    await prisma.task.update({
      where: { id: dispute.task_id },
      data: {
        status: targetTaskStatus,
      },
    });

    // Create notifications for both customer and buter
    const task = await prisma.task.findUnique({ where: { id: dispute.task_id } });
    if (task) {
      const message = `Sengketa untuk tugas "${task.description}" telah diselesaikan oleh admin. Status: ${status}. Resolusi: ${resolution}`;
      
      await prisma.notification.create({
        data: {
          userId: task.customer_id,
          type: 'dispute_resolved',
          title: 'Sengketa selesai',
          message,
          related_task_id: task.id,
        },
      });

      if (task.buter_id) {
        await prisma.notification.create({
          data: {
            userId: task.buter_id,
            type: 'dispute_resolved',
            title: 'Sengketa selesai',
            message,
            related_task_id: task.id,
          },
        });
      }
    }

    const responseData = {
      id: updatedDispute.id,
      status: updatedDispute.status,
      resolution: updatedDispute.resolution,
    };

    return successResponse(responseData, 'Dispute resolved');
  } catch (error: any) {
    console.error('Resolve dispute error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error resolving dispute', 500);
  }
}
