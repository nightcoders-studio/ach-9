import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const { errorResponse: authError } = await authenticate(request, ['admin']);
    if (authError) return authError;

    const totalUsers = await prisma.user.count();
    const totalButers = await prisma.user.count({ where: { role: 'buter' } });
    const totalCustomers = await prisma.user.count({ where: { role: 'customer' } });
    
    const totalTasks = await prisma.task.count();
    const pendingTasks = await prisma.task.count({ where: { status: 'waiting' } });
    const completedTasks = await prisma.task.count({ where: { status: 'completed' } });

    const totalDisputes = await prisma.dispute.count();
    const openDisputes = await prisma.dispute.count({ where: { status: 'open' } });

    const totalWallets = await prisma.wallet.count();
    const totalWithdrawals = await prisma.withdrawal.count();

    const responseData = {
      total_users: totalUsers,
      total_buters: totalButers,
      total_customers: totalCustomers,
      total_tasks: totalTasks,
      pending_tasks: pendingTasks,
      completed_tasks: completedTasks,
      total_disputes: totalDisputes,
      open_disputes: openDisputes,
      total_wallets: totalWallets,
      total_withdrawals: totalWithdrawals,
    };

    return successResponse(responseData);
  } catch (error: any) {
    console.error('Get admin stats error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error retrieving platform statistics', 500);
  }
}
