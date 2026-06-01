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
    const { status } = body;

    const validStatuses = ['open', 'investigating', 'resolved', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return errorResponse('VALIDATION_ERROR', 'Valid status (open, investigating, resolved, closed) is required', 400);
    }

    const updatedDispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status,
      },
    });

    const responseData = {
      id: updatedDispute.id,
      status: updatedDispute.status,
    };

    return successResponse(responseData, 'Dispute status updated');
  } catch (error: any) {
    console.error('Update dispute status error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error updating dispute status', 500);
  }
}
