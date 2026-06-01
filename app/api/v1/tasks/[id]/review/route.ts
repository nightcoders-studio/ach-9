import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse: authError } = await authenticate(request, ['customer']);
    if (authError) return authError;

    const { id } = await params;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return errorResponse('VALIDATION_ERROR', 'Invalid task ID', 400);
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { review: true },
    });

    if (!task) {
      return errorResponse('NOT_FOUND', 'Task not found', 404);
    }

    if (task.customer_id !== user.id) {
      return errorResponse('FORBIDDEN', 'Only the customer who created this task can review it', 403);
    }

    if (task.status !== 'completed') {
      return errorResponse('VALIDATION_ERROR', 'You can only review completed tasks', 400);
    }

    if (task.review) {
      return errorResponse('CONFLICT', 'Task has already been reviewed', 409);
    }

    const body = await request.json();
    const { rating, comment } = body;

    const ratingInt = parseInt(rating);
    if (isNaN(ratingInt) || ratingInt < 1 || ratingInt > 5) {
      return errorResponse('VALIDATION_ERROR', 'Rating must be an integer between 1 and 5', 400);
    }

    if (comment && comment.length > 500) {
      return errorResponse('VALIDATION_ERROR', 'Comment must not exceed 500 characters', 400);
    }

    const review = await prisma.review.create({
      data: {
        taskId,
        rating: ratingInt,
        comment: comment || null,
      },
    });

    // Create notification for buter if assigned
    if (task.buter_id) {
      await prisma.notification.create({
        data: {
          userId: task.buter_id,
          type: 'review_received',
          title: 'Ulasan baru',
          message: `Anda menerima ulasan bintang ${ratingInt} untuk tugas "${task.description}"`,
          related_task_id: task.id,
        },
      });
    }

    const responseData = {
      id: task.id,
      review: {
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at.toISOString(),
      },
    };

    return successResponse(responseData, 'Review submitted');
  } catch (error: any) {
    console.error('Submit review error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error submitting review', 500);
  }
}
