import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';

export function formatDispute(d: any) {
  return {
    id: d.id,
    task_id: d.task_id,
    reported_by: d.reported_by,
    reason: d.reason,
    evidence: d.evidence || null,
    status: d.status,
    reporter_snapshot: d.reporter ? {
      full_name: d.reporter.full_name,
      phone: d.reporter.phone,
      role: d.reporter.role,
    } : null,
    chat_history: d.chat_history ? d.chat_history.map((c: any) => ({
      sender: c.sender,
      message: c.message,
      time: c.time.toISOString(),
    })) : [],
    created_at: d.created_at.toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const { user, errorResponse: authError } = await authenticate(request);
    if (authError) return authError;

    const body = await request.json();
    const { task_id, reason, evidence } = body;

    const taskIdInt = parseInt(task_id);
    if (isNaN(taskIdInt) || !reason) {
      return errorResponse('VALIDATION_ERROR', 'task_id (integer) and reason (string) are required', 400);
    }

    const task = await prisma.task.findUnique({
      where: { id: taskIdInt },
    });

    if (!task) {
      return errorResponse('NOT_FOUND', 'Task not found', 404);
    }

    // Must be either the customer or buter of the task to raise dispute
    if (task.customer_id !== user.id && task.buter_id !== user.id) {
      return errorResponse('FORBIDDEN', 'You are not involved in this task to file a dispute', 403);
    }

    // Create dispute
    const dispute = await prisma.dispute.create({
      data: {
        task_id: taskIdInt,
        reported_by: user.id,
        reason,
        evidence: evidence || null,
        status: 'open',
      },
      include: {
        reporter: true,
        chat_history: true,
      },
    });

    // Update Task status to 'dispute'
    await prisma.task.update({
      where: { id: taskIdInt },
      data: {
        status: 'dispute',
      },
    });

    // Notify the other party
    const notifyUserId = task.customer_id === user.id ? task.buter_id : task.customer_id;
    if (notifyUserId) {
      await prisma.notification.create({
        data: {
          userId: notifyUserId,
          type: 'dispute_created',
          title: 'Sengketa diajukan',
          message: `Sengketa telah diajukan untuk tugas "${task.description}" oleh ${user.full_name}`,
          related_task_id: task.id,
        },
      });
    }

    const responseData = formatDispute(dispute);
    return successResponse(responseData, 'Dispute created', 201);
  } catch (error: any) {
    console.error('Create dispute error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error filing dispute', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, errorResponse: authError } = await authenticate(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const task_id = searchParams.get('task_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};
    if (status) where.status = status;
    if (task_id) where.task_id = parseInt(task_id);

    // If not admin, restrict to disputes where user is reporter or involved in task
    if (user.role !== 'admin') {
      where.OR = [
        { reported_by: user.id },
        {
          task: {
            OR: [
              { customer_id: user.id },
              { buter_id: user.id },
            ],
          },
        },
      ];
    }

    const total = await prisma.dispute.count({ where });

    const disputes = await prisma.dispute.findMany({
      where,
      include: {
        reporter: true,
        chat_history: { orderBy: { time: 'asc' } },
        task: true,
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const responseData = {
      disputes: disputes.map(formatDispute),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit) || 1,
      },
    };

    return successResponse(responseData);
  } catch (error: any) {
    console.error('List disputes error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error listing disputes', 500);
  }
}
