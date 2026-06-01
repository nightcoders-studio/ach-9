import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';
import { formatTaskList } from '../route';

export async function GET(request: NextRequest) {
  try {
    const { errorResponse: authError } = await authenticate(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const min_price = searchParams.get('min_price');
    const max_price = searchParams.get('max_price');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {
      status: 'waiting',
    };

    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price.gte = parseFloat(min_price);
      if (max_price) where.price.lte = parseFloat(max_price);
    }

    const total = await prisma.task.count({ where });

    const tasks = await prisma.task.findMany({
      where,
      include: {
        customer: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const responseData = {
      tasks: tasks.map(formatTaskList),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit) || 1,
      },
    };

    return successResponse(responseData);
  } catch (error: any) {
    console.error('List waiting tasks error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error listing waiting tasks', 500);
  }
}
