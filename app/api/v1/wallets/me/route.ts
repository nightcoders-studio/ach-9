import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const { user, errorResponse: authError } = await authenticate(request, ['buter']);
    if (authError) return authError;

    const wallet = await prisma.wallet.findUnique({
      where: { buter_id: user.id },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!wallet) {
      return errorResponse('NOT_FOUND', 'Wallet not found', 404);
    }

    const responseData = {
      id: wallet.id,
      buter_id: wallet.buter_id,
      balance: wallet.balance.toFixed(2),
      pending_balance: wallet.pending_balance.toFixed(2),
      transaction_history: wallet.transactions.map((tx) => ({
        type: tx.type,
        amount: tx.amount,
        task_id: tx.task_id,
        date: tx.date.toISOString(),
      })),
    };

    return successResponse(responseData);
  } catch (error: any) {
    console.error('Get wallet error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error retrieving wallet details', 500);
  }
}
