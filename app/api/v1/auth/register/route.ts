import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/jwt';
import { errorResponse, successResponse } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, email, phone, password, role } = body;

    // Validation
    if (!full_name || !email || !phone || !password || !role) {
      return errorResponse('VALIDATION_ERROR', 'All fields (full_name, email, phone, password, role) are required', 400);
    }

    if (full_name.length > 100) {
      return errorResponse('VALIDATION_ERROR', 'full_name must not exceed 100 characters', 400);
    }

    if (phone.length > 15) {
      return errorResponse('VALIDATION_ERROR', 'phone number must not exceed 15 characters', 400);
    }

    if (password.length < 6) {
      return errorResponse('VALIDATION_ERROR', 'password must be at least 6 characters', 400);
    }

    if (role !== 'customer' && role !== 'buter') {
      return errorResponse('VALIDATION_ERROR', 'role must be customer or buter', 400);
    }

    // Check unique constraints
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return errorResponse('CONFLICT', 'Email already exists', 409);
    }

    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return errorResponse('CONFLICT', 'Phone number already exists', 409);
    }

    // Create User
    const user = await prisma.user.create({
      data: {
        full_name,
        email,
        phone,
        password: hashPassword(password),
        role,
        is_verified: false,
      },
    });

    const responseData = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_verified: user.is_verified,
      buter_detail: null,
      stats: null,
      created_at: user.created_at.toISOString(),
    };

    return successResponse(responseData, 'User registered successfully', 201);
  } catch (error: any) {
    console.error('Registration error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error during registration', 500);
  }
}
