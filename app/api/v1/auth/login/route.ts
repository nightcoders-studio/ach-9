import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signJwt } from '@/lib/jwt';
import { errorResponse, successResponse } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('VALIDATION_ERROR', 'Email and password are required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !verifyPassword(password, user.password)) {
      return errorResponse('UNAUTHORIZED', 'Invalid email or password', 401);
    }

    // Sign Token
    const token = signJwt({ id: user.id, email: user.email, role: user.role });

    const responseData = {
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
      },
    };

    return successResponse(responseData, 'Login successful', 200);
  } catch (error: any) {
    console.error('Login error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error during login', 500);
  }
}
