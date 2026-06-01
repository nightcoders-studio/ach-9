const { success, created, error } = require('../utils/response');
const taskModel = require('../models/taskModel');
const notificationModel = require('../models/notificationModel');

const createTask = async (req, res) => {
  try {
    const { description, pickup_location, dropoff_location, price, payment_method } = req.body;

    if (!description || !pickup_location || !dropoff_location || !price || !payment_method) {
      return error(res, 400, 'VALIDATION_ERROR', 'All fields are required');
    }

    if (!['gopay', 'qris', 'bank_transfer', 'dana'].includes(payment_method)) {
      return error(res, 400, 'VALIDATION_ERROR', 'Invalid payment method');
    }

    const task = await taskModel.createTask({
      customer_id: req.user.id,
      description,
      pickup_location,
      dropoff_location,
      price,
      payment_method
    });

    return created(res, 'Task created successfully', task);
  } catch (err) {
    console.error('CreateTask error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to create task');
  }
};

const getTasks = async (req, res) => {
  try {
    const { status, customer_id, buter_id, min_price, max_price, page = 1, limit = 10, sort_by, sort_order } = req.query;
    const result = await taskModel.getTasks({
      status,
      customer_id: customer_id ? parseInt(customer_id) : undefined,
      buter_id: buter_id ? parseInt(buter_id) : undefined,
      min_price,
      max_price,
      page: parseInt(page),
      limit: parseInt(limit),
      sort_by,
      sort_order
    });
    return success(res, null, result);
  } catch (err) {
    console.error('GetTasks error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to get tasks');
  }
};

const getWaitingTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, min_price, max_price } = req.query;
    const result = await taskModel.getWaitingTasks({
      page: parseInt(page),
      limit: parseInt(limit),
      min_price,
      max_price
    });
    return success(res, null, result);
  } catch (err) {
    console.error('GetWaitingTasks error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to get waiting tasks');
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await taskModel.getTaskById(req.params.id);
    if (!task) {
      return error(res, 404, 'NOT_FOUND', 'Task not found');
    }
    return success(res, null, task);
  } catch (err) {
    console.error('GetTaskById error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to get task');
  }
};

const acceptTask = async (req, res) => {
  try {
    const task = await taskModel.getTaskById(req.params.id);
    if (!task) {
      return error(res, 404, 'NOT_FOUND', 'Task not found');
    }

    if (task.status !== 'waiting') {
      return error(res, 400, 'VALIDATION_ERROR', 'Task is not in waiting status');
    }

    if (task.buter_id) {
      return error(res, 409, 'CONFLICT', 'Task already taken by another buter');
    }

    const updated = await taskModel.acceptTask(req.params.id, req.user.id);
    return success(res, 'Task accepted successfully', updated);
  } catch (err) {
    console.error('AcceptTask error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to accept task');
  }
};

const startTask = async (req, res) => {
  try {
    const task = await taskModel.getTaskById(req.params.id);
    if (!task) {
      return error(res, 404, 'NOT_FOUND', 'Task not found');
    }

    if (task.buter_id !== req.user.id) {
      return error(res, 403, 'FORBIDDEN', 'Only assigned buter can start the task');
    }

    if (task.status !== 'taken') {
      return error(res, 400, 'VALIDATION_ERROR', 'Task must be in taken status');
    }

    const updated = await taskModel.startTask(req.params.id);
    return success(res, 'Task started', updated);
  } catch (err) {
    console.error('StartTask error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to start task');
  }
};

const completeTask = async (req, res) => {
  try {
    const task = await taskModel.getTaskById(req.params.id);
    if (!task) {
      return error(res, 404, 'NOT_FOUND', 'Task not found');
    }

    if (task.buter_id !== req.user.id) {
      return error(res, 403, 'FORBIDDEN', 'Only assigned buter can complete the task');
    }

    if (task.status !== 'on_progress') {
      return error(res, 400, 'VALIDATION_ERROR', 'Task must be in on_progress status');
    }

    const updated = await taskModel.completeTask(req.params.id);

    // Notify customer
    await notificationModel.createNotification({
      user_id: task.customer_id,
      type: 'task_completed',
      title: 'Tugas selesai',
      message: `Tugas "${task.description}" telah selesai`,
      related_task_id: task.id,
      related_task_snapshot: { description: task.description, price: task.price }
    });

    return success(res, 'Task completed successfully', updated);
  } catch (err) {
    console.error('CompleteTask error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to complete task');
  }
};

const cancelTask = async (req, res) => {
  try {
    const task = await taskModel.getTaskById(req.params.id);
    if (!task) {
      return error(res, 404, 'NOT_FOUND', 'Task not found');
    }

    // Customer or admin can cancel
    if (task.customer_id !== req.user.id && req.user.role !== 'admin') {
      return error(res, 403, 'FORBIDDEN', 'Only task owner or admin can cancel');
    }

    const updated = await taskModel.cancelTask(req.params.id, req.body.reason);
    return success(res, 'Task cancelled', updated);
  } catch (err) {
    console.error('CancelTask error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to cancel task');
  }
};

const submitReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return error(res, 400, 'VALIDATION_ERROR', 'Rating must be between 1 and 5');
    }

    const task = await taskModel.getTaskById(req.params.id);
    if (!task) {
      return error(res, 404, 'NOT_FOUND', 'Task not found');
    }

    if (task.customer_id !== req.user.id) {
      return error(res, 403, 'FORBIDDEN', 'Only customer can submit review');
    }

    if (task.status !== 'completed') {
      return error(res, 400, 'VALIDATION_ERROR', 'Task must be completed to submit review');
    }

    const updated = await taskModel.addReview(req.params.id, { rating, comment });
    return success(res, 'Review submitted', { id: updated.id, review: updated.review });
  } catch (err) {
    console.error('SubmitReview error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to submit review');
  }
};

const addTrackingPoint = async (req, res) => {
  try {
    const { lat, lng, status } = req.body;

    if (lat === undefined || lng === undefined || !status) {
      return error(res, 400, 'VALIDATION_ERROR', 'lat, lng, and status are required');
    }

    const task = await taskModel.getTaskById(req.params.id);
    if (!task) {
      return error(res, 404, 'NOT_FOUND', 'Task not found');
    }

    if (task.buter_id !== req.user.id) {
      return error(res, 403, 'FORBIDDEN', 'Only assigned buter can add tracking');
    }

    const updated = await taskModel.addTrackingPoint(req.params.id, { lat, lng, status });
    return success(res, 'Tracking point added', { tracking_history: updated.tracking_history });
  } catch (err) {
    console.error('AddTrackingPoint error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to add tracking point');
  }
};

const getTrackingHistory = async (req, res) => {
  try {
    const history = await taskModel.getTrackingHistory(req.params.id);
    if (history === null) {
      return error(res, 404, 'NOT_FOUND', 'Task not found');
    }
    return success(res, null, { tracking_history: history });
  } catch (err) {
    console.error('GetTrackingHistory error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to get tracking history');
  }
};

module.exports = {
  createTask,
  getTasks,
  getWaitingTasks,
  getTaskById,
  acceptTask,
  startTask,
  completeTask,
  cancelTask,
  submitReview,
  addTrackingPoint,
  getTrackingHistory
};