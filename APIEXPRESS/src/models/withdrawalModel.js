const pool = require('../config/database');

const getWithdrawalById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM withdrawals WHERE id = ?', [id]);
  return rows[0] || null;
};

const getWithdrawals = async ({ status, buter_id, page = 1, limit = 10 }) => {
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (buter_id) {
    conditions.push('buter_id = ?');
    params.push(buter_id);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM withdrawals ${whereClause}`, params);
  const total = countResult[0].total;

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT * FROM withdrawals ${whereClause} ORDER BY requested_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    withdrawals: rows,
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) }
  };
};

const processWithdrawal = async (id, { status, notes }) => {
  const withdrawal = await getWithdrawalById(id);
  if (!withdrawal) return null;

  const amount = parseFloat(withdrawal.amount);
  const processed_at = status === 'processed' || status === 'rejected' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;

  await pool.query(
    `UPDATE withdrawals SET status = ?, processed_at = ?, notes = ? WHERE id = ?`,
    [status, processed_at, notes || null, id]
  );

  // Update wallet: move from pending to balance (if rejected, return funds)
  if (status === 'rejected') {
    const [walletRows] = await pool.query('SELECT * FROM wallets WHERE buter_id = ?', [withdrawal.buter_id]);
    if (walletRows[0]) {
      const txHistory = walletRows[0].transaction_history ? (typeof walletRows[0].transaction_history === 'string' ? JSON.parse(walletRows[0].transaction_history) : walletRows[0].transaction_history) : [];
      txHistory.push({
        type: 'refund',
        amount: amount,
        date: new Date().toISOString(),
        status: 'refunded'
      });

      await pool.query(
        `UPDATE wallets SET balance = balance + ?, pending_balance = pending_balance - ?, transaction_history = ? WHERE buter_id = ?`,
        [amount, amount, JSON.stringify(txHistory), withdrawal.buter_id]
      );
    }
  } else if (status === 'processed') {
    await pool.query(
      `UPDATE wallets SET pending_balance = pending_balance - ? WHERE buter_id = ?`,
      [amount, withdrawal.buter_id]
    );
  }

  return getWithdrawalById(id);
};

module.exports = { getWithdrawalById, getWithdrawals, processWithdrawal };