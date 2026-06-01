import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin only
    const { errorResponse: authError } = await authenticate(request, ['admin']);
    if (authError) return authError;

    const { id } = await params;
    const targetUserId = parseInt(id);
    if (isNaN(targetUserId)) {
      return errorResponse('VALIDATION_ERROR', 'Invalid user ID', 400);
    }

    const body = await request.json();
    const { status, notes } = body;

    if (!status || (status !== 'approved' && status !== 'rejected')) {
      return errorResponse('VALIDATION_ERROR', 'Status must be approved or rejected', 400);
    }

    const detail = await prisma.buterDetail.findUnique({
      where: { userId: targetUserId },
    });

    if (!detail) {
      return errorResponse('NOT_FOUND', 'Buter details not found for this user', 404);
    }

    // Update ButerDetail status and notes
    await prisma.buterDetail.update({
      where: { userId: targetUserId },
      data: {
        approval_status: status,
        notes: notes || null,
      },
    });

    // Update User is_verified status
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        is_verified: status === 'approved',
      },
    });

    // Initialize wallet if approved and does not exist
    if (status === 'approved') {
      await prisma.wallet.upsert({
        where: { buter_id: targetUserId },
        update: {},
        create: {
          buter_id: targetUserId,
          balance: 0,
          pending_balance: 0,
        },
      });
    }

    return successResponse(undefined, 'Buter approval status updated');
  } catch (error: any) {
    console.error('Buter approval error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error updating approval status', 500);
  }
}
