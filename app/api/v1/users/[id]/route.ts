import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse: authError } = await authenticate(request);
    if (authError) return authError;

    const { id } = await params;
    const targetUserId = parseInt(id);
    if (isNaN(targetUserId)) {
      return errorResponse('VALIDATION_ERROR', 'Invalid user ID', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        buter_detail: true,
      },
    });

    if (!user) {
      return errorResponse('NOT_FOUND', 'User not found', 404);
    }

    // Calculate stats and reviews
    let stats: any = null;
    let reviews: any[] = [];

    if (user.role === 'customer') {
      const totalTasks = await prisma.task.count({
        where: { customer_id: user.id },
      });
      const completedTasks = await prisma.task.findMany({
        where: { customer_id: user.id, status: 'completed' },
        include: { review: true },
      });
      
      const rawReviews = completedTasks.map(t => t.review).filter(Boolean);
      const avgRating = rawReviews.length > 0
        ? rawReviews.reduce((sum, r) => sum + r!.rating, 0) / rawReviews.length
        : 0;

      stats = {
        total_tasks: totalTasks,
        avg_rating: parseFloat(avgRating.toFixed(1)),
      };

      reviews = completedTasks
        .filter(t => t.review !== null)
        .map(t => ({
          id: t.review!.id,
          rating: t.review!.rating,
          comment: t.review!.comment,
          created_at: t.review!.created_at.toISOString(),
          task_title: t.description
        }));
    } else if (user.role === 'buter') {
      const completedTasksCount = await prisma.task.count({
        where: { buter_id: user.id, status: 'completed' },
      });
      const completedTasks = await prisma.task.findMany({
        where: { buter_id: user.id, status: 'completed' },
        include: { review: true, customer: true },
      });
      
      const rawReviews = completedTasks.map(t => t.review).filter(Boolean);
      const avgRating = rawReviews.length > 0
        ? rawReviews.reduce((sum, r) => sum + r!.rating, 0) / rawReviews.length
        : 0;

      stats = {
        total_tasks: completedTasksCount,
        avg_rating: parseFloat(avgRating.toFixed(1)),
      };

      reviews = completedTasks
        .filter(t => t.review !== null)
        .map(t => ({
          id: t.review!.id,
          rating: t.review!.rating,
          comment: t.review!.comment,
          created_at: t.review!.created_at.toISOString(),
          task_title: t.description,
          reviewer_name: t.customer?.full_name || 'Customer'
        }));
    }

    const responseData: any = {
      id: user.id,
      full_name: user.full_name,
      role: user.role,
      is_verified: user.is_verified,
      buter_detail: null,
      stats,
      reviews,
    };

    if (user.role === 'buter' && user.buter_detail) {
      responseData.buter_detail = {
        vehicle_type: user.buter_detail.vehicle_type,
        approval_status: user.buter_detail.approval_status,
        total_earnings: user.buter_detail.total_earnings,
        total_tasks_completed: user.buter_detail.total_tasks_completed,
      };
    }

    return successResponse(responseData);
  } catch (error: any) {
    console.error('Get public profile error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error retrieving profile', 500);
  }
}
