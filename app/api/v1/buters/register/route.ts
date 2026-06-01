import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    // Must be buter role to register details
    const { user, errorResponse: authError } = await authenticate(request, ['buter']);
    if (authError) return authError;

    const body = await request.json();
    const { vehicle_type, id_card_photo, skck_photo, selfie_photo } = body;

    if (!vehicle_type || !id_card_photo || !skck_photo || !selfie_photo) {
      return errorResponse('VALIDATION_ERROR', 'All fields (vehicle_type, id_card_photo, skck_photo, selfie_photo) are required', 400);
    }

    // Upsert or create buter detail
    const detail = await prisma.buterDetail.upsert({
      where: { userId: user.id },
      update: {
        vehicle_type,
        id_card_photo,
        skck_photo,
        selfie_photo,
        approval_status: 'pending',
      },
      create: {
        userId: user.id,
        vehicle_type,
        id_card_photo,
        skck_photo,
        selfie_photo,
        approval_status: 'pending',
      },
    });

    const responseData = {
      buter_detail: {
        vehicle_type: detail.vehicle_type,
        id_card_photo: detail.id_card_photo,
        skck_photo: detail.skck_photo,
        selfie_photo: detail.selfie_photo,
        approval_status: detail.approval_status,
        total_earnings: detail.total_earnings,
        total_tasks_completed: detail.total_tasks_completed,
      },
    };

    return successResponse(responseData, 'Buter registration submitted for approval', 201);
  } catch (error: any) {
    console.error('Buter registration error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error registering buter', 500);
  }
}
