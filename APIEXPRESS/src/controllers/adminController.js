const pool = require('../config/database');
const { success, error } = require('../utils/response');

const getStats = async (req, res) => {
  try {
    const [[userCount]] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    const [[buterCount]] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'buter'");
    const [[customerCount]] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
    const [[taskCount]] = await pool.query('SELECT COUNT(*) as count FROM tasks');
    const [[pendingTaskCount]] = await pool.query("SELECT COUNT(*) as count FROM tasks WHERE status = 'waiting'");
    const [[completedTaskCount]] = await pool.query("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'");
    const [[disputeCount]] = await pool.query('SELECT COUNT(*) as count FROM disputes');
    const [[openDisputeCount]] = await pool.query("SELECT COUNT(*) as count FROM disputes WHERE status = 'open'");
    const [[walletCount]] = await pool.query('SELECT COUNT(*) as count FROM wallets');
    const [[withdrawalCount]] = await pool.query('SELECT COUNT(*) as count FROM withdrawals');

    return success(res, null, {
      total_users: userCount.count,
      total_buters: buterCount.count,
      total_customers: customerCount.count,
      total_tasks: taskCount.count,
      pending_tasks: pendingTaskCount.count,
      completed_tasks: completedTaskCount.count,
      total_disputes: disputeCount.count,
      open_disputes: openDisputeCount.count,
      total_wallets: walletCount.count,
      total_withdrawals: withdrawalCount.count
    });
  } catch (err) {
    console.error('GetStats error:', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to get stats');
  }
};

module.exports = { getStats };