const { success, created, error } = require('../utils/response');
const disputeModel = require('../models/disputeModel');

const createDispute = async (req, res) => {
  try {
    const { task_id, reason, evidence } = req.body;

    if (!task_id || !reason) {
      return error(res, 400, 'VALIDATION_ERROR', 'Task ID and reason are required');
    }

    const dispute = await disputeModel.createDispute({
      task_id,
      reported_by: req.user.id,
      reason,
      evidence
    });

    if (!dispute) {
      return error(res, 404, 'NOT_FOUND', 'Task not found');
    }

    return created(res, 'Dispute created', dispute);
  } catch (err) {
    console.error('CreateDispute error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to create dispute');
  }
};

const getDisputes = async (req, res) => {
  try {
    const { status, task_id, page = 1, limit = 10 } = req.query;

    const result = await disputeModel.getDisputes({
      status,
      task_id: task_id ? parseInt(task_id) : undefined,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    return success(res, null, result);
  } catch (err) {
    console.error('GetDisputes error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to get disputes');
  }
};

const getDisputeById = async (req, res) => {
  try {
    const dispute = await disputeModel.getDisputeById(req.params.id);
    if (!dispute) {
      return error(res, 404, 'NOT_FOUND', 'Dispute not found');
    }
    return success(res, null, dispute);
  } catch (err) {
    console.error('GetDisputeById error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to get dispute');
  }
};

const addChatMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return error(res, 400, 'VALIDATION_ERROR', 'Message is required');
    }

    const dispute = await disputeModel.getDisputeById(req.params.id);
    if (!dispute) {
      return error(res, 404, 'NOT_FOUND', 'Dispute not found');
    }

    const sender = req.user.role; // 'customer', 'buter', or 'admin'
    const updated = await disputeModel.addChatMessage(req.params.id, { sender, message });

    return success(res, 'Message sent', { chat_history: updated.chat_history });
  } catch (err) {
    console.error('AddChatMessage error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to send message');
  }
};

const resolveDispute = async (req, res) => {
  try {
    const { resolution, status } = req.body;

    if (!resolution) {
      return error(res, 400, 'VALIDATION_ERROR', 'Resolution is required');
    }

    const dispute = await disputeModel.resolveDispute(req.params.id, { resolution, status });
    if (!dispute) {
      return error(res, 404, 'NOT_FOUND', 'Dispute not found');
    }

    return success(res, 'Dispute resolved', dispute);
  } catch (err) {
    console.error('ResolveDispute error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to resolve dispute');
  }
};

const updateDisputeStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['open', 'investigating', 'resolved', 'closed'].includes(status)) {
      return error(res, 400, 'VALIDATION_ERROR', 'Invalid status');
    }

    const dispute = await disputeModel.updateDisputeStatus(req.params.id, status);
    if (!dispute) {
      return error(res, 404, 'NOT_FOUND', 'Dispute not found');
    }

    return success(res, 'Dispute status updated', dispute);
  } catch (err) {
    console.error('UpdateDisputeStatus error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to update dispute status');
  }
};

module.exports = {
  createDispute,
  getDisputes,
  getDisputeById,
  addChatMessage,
  resolveDispute,
  updateDisputeStatus
};