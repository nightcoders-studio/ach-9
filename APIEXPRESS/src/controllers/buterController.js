const { success, created, error } = require('../utils/response');
const userModel = require('../models/userModel');
const walletModel = require('../models/walletModel');

const registerButer = async (req, res) => {
  try {
    const { vehicle_type, id_card_photo, skck_photo, selfie_photo } = req.body;

    if (!vehicle_type) {
      return error(res, 400, 'VALIDATION_ERROR', 'Vehicle type is required');
    }

    const user = await userModel.getUserById(req.user.id);
    if (!user) {
      return error(res, 404, 'NOT_FOUND', 'User not found');
    }

    if (user.role !== 'buter') {
      return error(res, 403, 'FORBIDDEN', 'Only users with buter role can register as buter');
    }

    const buter_detail = {
      vehicle_type,
      id_card_photo: id_card_photo || '',
      skck_photo: skck_photo || '',
      selfie_photo: selfie_photo || '',
      approval_status: 'pending',
      total_earnings: 0,
      total_tasks_completed: 0
    };

    const updated = await userModel.updateButerDetail(req.user.id, buter_detail);

    // Create wallet if not exists
    await walletModel.getOrCreateWallet(req.user.id);

    return created(res, 'Buter registration submitted for approval', {
      buter_detail: updated.buter_detail
    });
  } catch (err) {
    console.error('RegisterButer error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to register buter');
  }
};

const approveButer = async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return error(res, 400, 'VALIDATION_ERROR', 'Status must be approved or rejected');
    }

    const user = await userModel.updateButerApproval(req.params.id, status);
    if (!user) {
      return error(res, 404, 'NOT_FOUND', 'Buter not found');
    }

    return success(res, 'Buter approval status updated');
  } catch (err) {
    console.error('ApproveButer error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to update buter status');
  }
};

const getButers = async (req, res) => {
  try {
    const { page = 1, limit = 10, vehicle_type, sort_by } = req.query;
    const result = await userModel.getButers({
      page: parseInt(page),
      limit: parseInt(limit),
      vehicle_type,
      sort_by
    });
    return success(res, null, result);
  } catch (err) {
    console.error('GetButers error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to get buters');
  }
};

module.exports = { registerButer, approveButer, getButers };