import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPassword } from '@/lib/jwt';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';

export async function PUT(request: NextRequest) {
  try {
    const { user, errorResponse: authError } = await authenticate(request);
    if (authError) return authError;

    const body = await request.json();
    const { current_password, new_password } = body;

    if (!current_password || !new_password) {
      return errorResponse('VALIDATION_ERROR', 'current_password and new_password are required', 400);
    }

    if (new_password.length < 6) {
      return errorResponse('VALIDATION_ERROR', 'new_password must be at least 6 characters', 400);
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser || !verifyPassword(current_password, dbUser.password)) {
      return errorResponse('UNAUTHORIZED', 'Incorrect current password', 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashPassword(new_password),
      },
    });

    return successResponse(undefined, 'Password changed successfully');
  } catch (error: any) {
    console.error('Change password error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error changing password', 500);
  }
}
