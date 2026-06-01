import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from './jwt';
import { prisma } from './prisma';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: number;
    email: string;
    role: string;
    full_name: string;
    is_verified: boolean;
  };
}

export function errorResponse(code: string, message: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status }
  );
}

export function successResponse(data?: any, message?: string, status: number = 200) {
  const body: any = { success: true };
  if (message !== undefined) {
    body.message = message;
  }
  if (data !== undefined) {
    body.data = data;
  }
  return NextResponse.json(body, { status });
}

export async function getAuthUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.substring(7);
    const decoded = verifyJwt(token);
    if (!decoded || !decoded.id) {
      return null;
    }
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        buter_detail: true,
      },
    });
    return user;
  } catch {
    return null;
  }
}

export async function authenticate(
  request: NextRequest,
  allowedRoles?: string[]
): Promise<{ user: any | null; errorResponse?: NextResponse }> {
  const user = await getAuthUser(request);
  if (!user) {
    return {
      user: null,
      errorResponse: errorResponse('UNAUTHORIZED', 'Missing or invalid token', 401),
    };
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      user: null,
      errorResponse: errorResponse('FORBIDDEN', 'Insufficient permissions', 403),
    };
  }

  return { user, errorResponse: undefined };
}
