import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';

export function formatWithdrawal(w: any) {
  return {
    id: w.id,
    buter_id: w.buter_id,
    amount: w.amount.toFixed(2),
    bank_account: w.bank_account,
    bank_name: w.bank_name,
    status: w.status,
    buter_snapshot: w.buter ? {
      full_name: w.buter.full_name,
      phone: w.buter.phone,
      email: w.buter.email,
    } : null,
    requested_at: w.requested_at.toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const { user, errorResponse: authError } = await authenticate(request, ['buter']);
    if (authError) return authError;

    const body = await request.json();
    const { amount, bank_account, bank_name } = body;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return errorResponse('VALIDATION_ERROR', 'Invalid amount', 400);
    }

    if (!bank_account || !bank_name) {
      return errorResponse('VALIDATION_ERROR', 'bank_account and bank_name are required', 400);
    }

    const wallet = await prisma.wallet.findUnique({
      where: { buter_id: user.id },
    });

    if (!wallet) {
      return errorResponse('NOT_FOUND', 'Wallet not found', 404);
    }

    if (wallet.balance < amountNum) {
      return errorResponse('VALIDATION_ERROR', 'Insufficient balance', 400);
    }

    // Deduct from wallet balance
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { decrement: amountNum },
      },
    });

    // Create withdrawal
    const withdrawal = await prisma.withdrawal.create({
      data: {
        buter_id: user.id,
        amount: amountNum,
        bank_account,
        bank_name,
        status: 'pending',
      },
      include: {
        buter: true,
      },
    });

    const responseData = formatWithdrawal(withdrawal);
    return successResponse(responseData, 'Withdrawal requested successfully', 201);
  } catch (error: any) {
    console.error('Request withdrawal error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error requesting withdrawal', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, errorResponse: authError } = await authenticate(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    let buter_id: number | undefined;

    if (user.role === 'admin') {
      const buterIdParam = searchParams.get('buter_id');
      if (buterIdParam) buter_id = parseInt(buterIdParam);
    } else {
      buter_id = user.id;
    }

    const where: any = {};
    if (status) where.status = status;
    if (buter_id) where.buter_id = buter_id;

    const total = await prisma.withdrawal.count({ where });

    const withdrawals = await prisma.withdrawal.findMany({
      where,
      include: {
        buter: true,
      },
      orderBy: { requested_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const responseData = {
      withdrawals: withdrawals.map(formatWithdrawal),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit) || 1,
      },
    };

    return successResponse(responseData);
  } catch (error: any) {
    console.error('List withdrawals error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error listing withdrawals', 500);
  }
}
