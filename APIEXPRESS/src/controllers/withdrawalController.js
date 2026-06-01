const { success, created, error } = require('../utils/response');
const withdrawalModel = require('../models/withdrawalModel');
const walletModel = require('../models/walletModel');

const createWithdrawal = async (req, res) => {
  try {
    const { amount, bank_account, bank_name } = req.body;

    if (!amount || !bank_account) {
      return error(res, 400, 'VALIDATION_ERROR', 'Amount and bank account are required');
    }

    if (parseFloat(amount) <= 0) {
      return error(res, 400, 'VALIDATION_ERROR', 'Amount must be greater than 0');
    }

    const wallet = await walletModel.getWalletByButerId(req.user.id);
    if (!wallet || parseFloat(wallet.balance) < parseFloat(amount)) {
      return error(res, 400, 'VALIDATION_ERROR', 'Insufficient balance');
    }

    const result = await walletModel.addWithdrawal(req.user.id, { amount, bank_account, bank_name });
    if (result.error) {
      return error(res, 400, 'VALIDATION_ERROR', result.error);
    }

    return created(res, 'Withdrawal requested successfully', result);
  } catch (err) {
    console.error('CreateWithdrawal error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to create withdrawal');
  }
};

const getWithdrawals = async (req, res) => {
  try {
    const { status, buter_id, page = 1, limit = 10 } = req.query;

    // Buters can only see their own, admins can see all
    const filterButerId = req.user.role === 'admin' ? buter_id : req.user.id;

    const result = await withdrawalModel.getWithdrawals({
      status,
      buter_id: filterButerId ? parseInt(filterButerId) : undefined,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    return success(res, null, result);
  } catch (err) {
    console.error('GetWithdrawals error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to get withdrawals');
  }
};

const processWithdrawal = async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status || !['processed', 'rejected'].includes(status)) {
      return error(res, 400, 'VALIDATION_ERROR', 'Status must be processed or rejected');
    }

    const withdrawal = await withdrawalModel.processWithdrawal(req.params.id, { status, notes });
    if (!withdrawal) {
      return error(res, 404, 'NOT_FOUND', 'Withdrawal not found');
    }

    return success(res, 'Withdrawal processed', withdrawal);
  } catch (err) {
    console.error('ProcessWithdrawal error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to process withdrawal');
  }
};

module.exports = { createWithdrawal, getWithdrawals, processWithdrawal };