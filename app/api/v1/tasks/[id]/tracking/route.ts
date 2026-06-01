import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse: authError } = await authenticate(request, ['buter']);
    if (authError) return authError;

    const { id } = await params;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return errorResponse('VALIDATION_ERROR', 'Invalid task ID', 400);
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return errorResponse('NOT_FOUND', 'Task not found', 404);
    }

    if (task.buter_id !== user.id) {
      return errorResponse('FORBIDDEN', 'You are not the assigned buter for this task', 403);
    }

    const body = await request.json();
    const { lat, lng, status } = body;

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum) || !status) {
      return errorResponse('VALIDATION_ERROR', 'lat, lng (numbers) and status (string) are required', 400);
    }

    await prisma.trackingPoint.create({
      data: {
        taskId,
        lat: latNum,
        lng: lngNum,
        status,
      },
    });

    const trackingPoints = await prisma.trackingPoint.findMany({
      where: { taskId },
      orderBy: { time: 'asc' },
    });

    const responseData = {
      tracking_history: trackingPoints.map((pt) => ({
        lat: pt.lat,
        lng: pt.lng,
        time: pt.time.toISOString(),
        status: pt.status,
      })),
    };

    return successResponse(responseData, 'Tracking point added');
  } catch (error: any) {
    console.error('Add tracking error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error adding tracking point', 500);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse: authError } = await authenticate(request);
    if (authError) return authError;

    const { id } = await params;
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return errorResponse('VALIDATION_ERROR', 'Invalid task ID', 400);
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return errorResponse('NOT_FOUND', 'Task not found', 404);
    }

    const trackingPoints = await prisma.trackingPoint.findMany({
      where: { taskId },
      orderBy: { time: 'asc' },
    });

    const responseData = {
      tracking_history: trackingPoints.map((pt) => ({
        lat: pt.lat,
        lng: pt.lng,
        time: pt.time.toISOString(),
        status: pt.status,
      })),
    };

    return successResponse(responseData);
  } catch (error: any) {
    console.error('Get tracking error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error retrieving tracking history', 500);
  }
}
