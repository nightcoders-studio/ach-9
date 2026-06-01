import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';

export async function PUT(
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
      include: { task: true },
    });

    if (!dispute) {
      return errorResponse('NOT_FOUND', 'Dispute not found', 404);
    }

    // Determine sender label
    let senderLabel = '';
    if (user.role === 'admin') {
      senderLabel = 'admin';
    } else if (dispute.task.customer_id === user.id) {
      senderLabel = 'customer';
    } else if (dispute.task.buter_id === user.id) {
      senderLabel = 'buter';
    } else {
      return errorResponse('FORBIDDEN', 'Access denied to this dispute chat thread', 403);
    }

    const body = await request.json();
    const { message } = body;

    if (!message) {
      return errorResponse('VALIDATION_ERROR', 'Message content is required', 400);
    }

    const now = new Date();

    // Create chat message
    await prisma.disputeChat.create({
      data: {
        disputeId,
        sender: senderLabel,
        message,
        time: now,
      },
    });

    // Fetch updated chat history
    const history = await prisma.disputeChat.findMany({
      where: { disputeId },
      orderBy: { time: 'asc' },
    });

    const responseData = {
      chat_history: history.map((h) => ({
        sender: h.sender,
        message: h.message,
        time: h.time.toISOString(),
      })),
    };

    return successResponse(responseData, 'Message sent');
  } catch (error: any) {
    console.error('Send dispute chat error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error sending dispute message', 500);
  }
}
