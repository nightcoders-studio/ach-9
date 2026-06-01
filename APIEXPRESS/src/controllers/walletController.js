const { success, error } = require('../utils/response');
const walletModel = require('../models/walletModel');

const getMyWallet = async (req, res) => {
  try {
    const wallet = await walletModel.getOrCreateWallet(req.user.id);
    return success(res, null, wallet);
  } catch (err) {
    console.error('GetMyWallet error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to get wallet');
  }
};

const getTransactions = async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    const result = await walletModel.getTransactions(req.user.id, {
      type,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    return success(res, null, result);
  } catch (err) {
    console.error('GetTransactions error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to get transactions');
  }
};

module.exports = { getMyWallet, getTransactions };