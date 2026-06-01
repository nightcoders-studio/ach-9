import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const { errorResponse: authError } = await authenticate(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const vehicle_type = searchParams.get('vehicle_type');
    const sort_by = searchParams.get('sort_by') || 'avg_rating';
    const status = searchParams.get('status') || 'approved';

    const users = await prisma.user.findMany({
      where: {
        role: 'buter',
        buter_detail: {
          approval_status: status,
          ...(vehicle_type && { vehicle_type }),
        },
      },
      include: {
        buter_detail: true,
      },
    });

    // Compute stats & format
    const formattedButers = await Promise.all(
      users.map(async (user) => {
        const completedTasksCount = await prisma.task.count({
          where: { buter_id: user.id, status: 'completed' },
        });
        const completedTasks = await prisma.task.findMany({
          where: { buter_id: user.id, status: 'completed' },
          include: { review: true },
        });

        const reviews = completedTasks.map((t) => t.review).filter(Boolean);
        const avgRating =
          reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r!.rating, 0) / reviews.length
            : 0;

        return {
          id: user.id,
          full_name: user.full_name,
          buter_detail: {
            vehicle_type: user.buter_detail?.vehicle_type,
            approval_status: user.buter_detail?.approval_status,
            total_tasks_completed: user.buter_detail?.total_tasks_completed || 0,
          },
          stats: {
            avg_rating: parseFloat(avgRating.toFixed(1)),
            total_tasks: completedTasksCount,
          },
        };
      })
    );

    // Sorting
    formattedButers.sort((a, b) => {
      if (sort_by === 'avg_rating') {
        return b.stats.avg_rating - a.stats.avg_rating;
      } else if (sort_by === 'total_tasks') {
        return b.stats.total_tasks - a.stats.total_tasks;
      }
      return 0;
    });

    // Pagination
    const total = formattedButers.length;
    const startIndex = (page - 1) * limit;
    const paginatedButers = formattedButers.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(total / limit);

    const responseData = {
      buters: paginatedButers,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages || 1,
      },
    };

    return successResponse(responseData);
  } catch (error: any) {
    console.error('List buters error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error listing buters', 500);
  }
}
