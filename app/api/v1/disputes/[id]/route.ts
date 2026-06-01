import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';
import { formatDispute } from '../route';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse: authError } = await authenticate(request);
    if (authError) return authError;

    const { id } = await params;
    const disputeId = parseInt(id);
    if (isNaN(disputeId)) {
      return errorResponse('VALIDATION_ERROR', 'Invalid dispute ID', 400);
    }

    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        reporter: true,
        chat_history: { orderBy: { time: 'asc' } },
        task: true,
      },
    });

    if (!dispute) {
      return errorResponse('NOT_FOUND', 'Dispute not found', 404);
    }

    // Role checks
    if (
      user.role !== 'admin' &&
      dispute.reported_by !== user.id &&
      dispute.task.customer_id !== user.id &&
      dispute.task.buter_id !== user.id
    ) {
      return errorResponse('FORBIDDEN', 'Access denied to this sengketa', 403);
    }

    const responseData = formatDispute(dispute);
    return successResponse(responseData);
  } catch (error: any) {
    console.error('Get dispute details error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error retrieving dispute details', 500);
  }
}
