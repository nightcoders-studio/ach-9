import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, errorResponse, successResponse } from '@/lib/middleware';

export function formatTaskDetail(task: any) {
  return {
    id: task.id,
    customer_id: task.customer_id,
    buter_id: task.buter_id,
    description: task.description,
    pickup_location: task.pickup_location,
    dropoff_location: task.dropoff_location,
    price: task.price.toFixed(2),
    status: task.status,
    customer_snapshot: task.customer ? {
      full_name: task.customer.full_name,
      phone: task.customer.phone,
      email: task.customer.email,
    } : null,
    buter_snapshot: (task.buter && task.buter.buter_detail) ? {
      full_name: task.buter.full_name,
      phone: task.buter.phone,
      vehicle_type: task.buter.buter_detail.vehicle_type,
    } : null,
    timeline: {
      created_at: task.created_at.toISOString(),
      taken_at: task.taken_at?.toISOString() || null,
      started_at: task.started_at?.toISOString() || null,
      completed_at: task.completed_at?.toISOString() || null,
    },
    payment: {
      method: task.payment_method,
      status: task.payment_status,
      amount: task.payment_amount,
      transaction_id: task.transaction_id || null,
      paid_at: task.paid_at?.toISOString() || null,
    },
    review: task.review ? {
      rating: task.review.rating,
      comment: task.review.comment,
      created_at: task.review.created_at.toISOString(),
    } : null,
    tracking_history: task.tracking_history ? task.tracking_history.map((pt: any) => ({
      lat: pt.lat,
      lng: pt.lng,
      time: pt.time.toISOString(),
      status: pt.status,
    })) : [],
  };
}

export function formatTaskList(task: any) {
  return {
    id: task.id,
    description: task.description,
    pickup_location: task.pickup_location,
    dropoff_location: task.dropoff_location,
    price: task.price,
    status: task.status,
    customer_snapshot: task.customer ? {
      full_name: task.customer.full_name,
      phone: task.customer.phone,
    } : null,
    created_at: task.created_at.toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    // Only customer or admin can create tasks (based on Role-Based Access Summary: Tasks (create) -> customer: Yes, buter: No, admin: Yes)
    const { user, errorResponse: authError } = await authenticate(request, ['customer', 'admin']);
    if (authError) return authError;

    const body = await request.json();
    const { description, pickup_location, dropoff_location, price, payment_method } = body;

    if (!description || !pickup_location || !dropoff_location || price === undefined || !payment_method) {
      return errorResponse('VALIDATION_ERROR', 'All fields (description, pickup_location, dropoff_location, price, payment_method) are required', 400);
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return errorResponse('VALIDATION_ERROR', 'Price must be a positive number', 400);
    }

    const validMethods = ['gopay', 'qris', 'bank_transfer', 'dana'];
    if (!validMethods.includes(payment_method)) {
      return errorResponse('VALIDATION_ERROR', 'Invalid payment method', 400);
    }

    const task = await prisma.task.create({
      data: {
        customer_id: user.id,
        description,
        pickup_location,
        dropoff_location,
        price: priceNum,
        status: 'waiting',
        payment_method,
        payment_status: 'pending',
        payment_amount: priceNum,
      },
      include: {
        customer: true,
      },
    });

    const responseData = formatTaskDetail(task);
    return successResponse(responseData, 'Task created successfully', 201);
  } catch (error: any) {
    console.error('Create task error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error creating task', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { errorResponse: authError } = await authenticate(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customer_id = searchParams.get('customer_id');
    const buter_id = searchParams.get('buter_id');
    const min_price = searchParams.get('min_price');
    const max_price = searchParams.get('max_price');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort_by = searchParams.get('sort_by') || 'created_at';
    const sort_order = searchParams.get('sort_order') || 'desc';

    const where: any = {};
    if (status) where.status = status;
    if (customer_id) where.customer_id = parseInt(customer_id);
    if (buter_id) where.buter_id = parseInt(buter_id);

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
        buter: {
          include: {
            buter_detail: true,
          },
        },
        review: true,
        tracking_history: true,
      },
      orderBy: {
        [sort_by]: sort_order,
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
    console.error('List tasks error:', error);
    return errorResponse('INTERNAL_ERROR', 'Server error listing tasks', 500);
  }
}
