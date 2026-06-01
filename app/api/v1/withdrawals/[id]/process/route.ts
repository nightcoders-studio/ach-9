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
    const withdrawalId = parseInt(id);
    if (isNaN(withdrawalId)) {
      return errorResponse('VALIDATION_ERROR', 'Invalid withdrawal ID', 400);
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      return errorResponse('NOT_FOUND', 'Withdrawal request not found', 404);
    }

    if (withdrawal.status !== 'pending') {
      return errorResponse('VALIDATION_ERROR', `Withdrawal has already been ${withdrawal.status}`, 400);
    }

    const body = await request.json();
    const { status, notes } = body;

    if (!status || (status !== 'processed' && status !== 'rejected')) {
      return errorResponse('VALIDATION_ERROR', 'Status must be processed or rejected', 400);
    }

    const now = new Date();

    // Perform DB updates
    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status,
        notes: notes || null,
        processed_at: now,
      },
    });

    if (status === 'rejected') {
      // Refund back to buter wallet balance
      await prisma.wallet.update({
        where: { buter_id: withdrawal.buter_id },
        data: {
          balance: { increment: withdrawal.amount },
        },
      });

      // Create a refund transaction log
      const wallet = await prisma.wallet.findUnique({
        where: { buter_id: withdrawal.buter_id },
      });
      if (wallet) {
        await prisma.transaction.create({
          data: {
            walletId: wallet.id,
            type: 'refund',
            amount: withdrawal.amount,
            date: now,
          },
        });
      }
    } else if (status === 'processed') {
      // Create a withdrawal transaction log
      const wallet = await prisma.wallet.findUnique({
        where: { buter_id: withdrawal.buter_id },
      });
      if (wallet) {
        await prisma.transaction.create({
          data: {
            walletId: wallet.id,
            type: 'withdrawal',
            amount: withdrawal.amount,
            date: now,
          },
        });
      }
    }

    // Create notification for buter
    await prisma.notification.create({
      data: {
        userId: withdrawal.buter_id,
        type: `withdrawal_${status}`,
        title: `Penarikan ${status === 'processed' ? 'berhasil' : 'ditolak'}`,
        message: `Permintaan penarikan dana Anda sebesar Rp ${withdrawal.amount} telah ${status === 'processed' ? 'diproses' : 'ditolak'}.${notes ? ' Catatan: ' + notes : ''}`,
      },
    });

    const responseData = {
      id: withdrawalId,
      status,
      processed_at: now.toISOString(),
      notes: notes || null,
    };

    return successResponse(responseData, 'Withdrawal processed');
  } catch (error: any) {
    console.error('Process withdrawal error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error processing withdrawal', 500);
  }
}
