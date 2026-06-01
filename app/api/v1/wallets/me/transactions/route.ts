import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const { user, errorResponse: authError } = await authenticate(request, ['buter']);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const wallet = await prisma.wallet.findUnique({
      where: { buter_id: user.id },
    });

    if (!wallet) {
      return errorResponse('NOT_FOUND', 'Wallet not found', 404);
    }

    const where: any = {
      walletId: wallet.id,
    };
    if (type) where.type = type;

    const total = await prisma.transaction.count({ where });

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const responseData = {
      transactions: transactions.map((tx) => ({
        type: tx.type,
        amount: tx.amount,
        task_id: tx.task_id,
        date: tx.date.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit) || 1,
      },
    };

    return successResponse(responseData);
  } catch (error: any) {
    console.error('Get transactions error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error retrieving transaction logs', 500);
  }
}
