import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const { user, errorResponse: authError } = await authenticate(request);
    if (authError) return authError;

    // Calculate stats
    let stats: any = null;

    if (user.role === 'customer') {
      const totalTasks = await prisma.task.count({
        where: { customer_id: user.id },
      });
      const completedTasks = await prisma.task.findMany({
        where: { customer_id: user.id, status: 'completed' },
        include: { review: true },
      });
      const totalSpent = completedTasks.reduce((sum, task) => sum + task.price, 0);
      
      const reviews = completedTasks.map(t => t.review).filter(Boolean);
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r!.rating, 0) / reviews.length
        : 0;

      stats = {
        total_tasks: totalTasks,
        total_spent: totalSpent,
        avg_rating: parseFloat(avgRating.toFixed(1)),
      };
    } else if (user.role === 'buter') {
      const completedTasksCount = await prisma.task.count({
        where: { buter_id: user.id, status: 'completed' },
      });
      const completedTasks = await prisma.task.findMany({
        where: { buter_id: user.id, status: 'completed' },
        include: { review: true },
      });
      
      const reviews = completedTasks.map(t => t.review).filter(Boolean);
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r!.rating, 0) / reviews.length
        : 0;

      stats = {
        total_tasks: completedTasksCount,
        avg_rating: parseFloat(avgRating.toFixed(1)),
      };
    }

    const responseData = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_verified: user.is_verified,
      buter_detail: user.buter_detail,
      stats,
      created_at: user.created_at.toISOString(),
    };

    return successResponse(responseData);
  } catch (error: any) {
    console.error('Get profile error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error retrieving profile', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, errorResponse: authError } = await authenticate(request);
    if (authError) return authError;

    const body = await request.json();
    const { full_name, phone } = body;

    const updateData: any = {};
    if (full_name !== undefined) {
      if (full_name.length > 100) {
        return errorResponse('VALIDATION_ERROR', 'full_name must not exceed 100 characters', 400);
      }
      updateData.full_name = full_name;
    }
    if (phone !== undefined) {
      if (phone.length > 15) {
        return errorResponse('VALIDATION_ERROR', 'phone number must not exceed 15 characters', 400);
      }
      // Check uniqueness of phone
      const phoneOwner = await prisma.user.findFirst({
        where: { phone, NOT: { id: user.id } },
      });
      if (phoneOwner) {
        return errorResponse('CONFLICT', 'Phone number already exists', 409);
      }
      updateData.phone = phone;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      include: {
        buter_detail: true,
      },
    });

    const responseData = {
      id: updatedUser.id,
      full_name: updatedUser.full_name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      is_verified: updatedUser.is_verified,
      buter_detail: updatedUser.buter_detail,
      created_at: updatedUser.created_at.toISOString(),
    };

    return successResponse(responseData, 'Profile updated successfully');
  } catch (error: any) {
    console.error('Update profile error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error updating profile', 500);
  }
}
