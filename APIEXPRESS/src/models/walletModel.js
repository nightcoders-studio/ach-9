const pool = require('../config/database');

const getWalletByButerId = async (buterId) => {
  const [rows] = await pool.query('SELECT * FROM wallets WHERE buter_id = ?', [buterId]);
  return rows[0] || null;
};

const createWallet = async (buterId) => {
  const [result] = await pool.query(
    `INSERT INTO wallets (buter_id, balance, pending_balance, transaction_history) VALUES (?, 0, 0, NULL)`,
    [buterId]
  );
  return getWalletByButerId(result.insertId);
};

const getOrCreateWallet = async (buterId) => {
  let wallet = await getWalletByButerId(buterId);
  if (!wallet) {
    wallet = await createWallet(buterId);
  }
  return wallet;
};

const getTransactions = async (buterId, { type, page = 1, limit = 10 }) => {
  const wallet = await getWalletByButerId(buterId);
  if (!wallet || !wallet.transaction_history) {
    return { transactions: [], pagination: { page, limit, total: 0, total_pages: 0 } };
  }

  let transactions = typeof wallet.transaction_history === 'string' ? JSON.parse(wallet.transaction_history) : wallet.transaction_history;

  if (type) {
    transactions = transactions.filter(t => t.type === type);
  }

  const total = transactions.length;
  const offset = (page - 1) * limit;
  const paginated = transactions.slice(offset, offset + limit).reverse();

  return {
    transactions: paginated,
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) }
  };
};

const addWithdrawal = async (buterId, { amount, bank_account, bank_name }) => {
  const wallet = await getWalletByButerId(buterId);
  if (!wallet || parseFloat(wallet.balance) < parseFloat(amount)) {
    return { error: 'Insufficient balance' };
  }

  const [buter] = await pool.query('SELECT * FROM users WHERE id = ?', [buterId]);
  const buter_snapshot = {
    full_name: buter[0].full_name,
    phone: buter[0].phone,
    email: buter[0].email
  };

  const [result] = await pool.query(
    `INSERT INTO withdrawals (buter_id, amount, bank_account, bank_name, status, buter_snapshot) VALUES (?, ?, ?, ?, 'pending', ?)`,
    [buterId, amount, bank_account, bank_name || '', JSON.stringify(buter_snapshot)]
  );

  // Deduct from balance, add to pending_balance
  const txHistory = wallet.transaction_history ? (typeof wallet.transaction_history === 'string' ? JSON.parse(wallet.transaction_history) : wallet.transaction_history) : [];
  txHistory.push({
    type: 'withdrawal',
    amount: -parseFloat(amount),
    date: new Date().toISOString(),
    status: 'pending'
  });

  await pool.query(
    `UPDATE wallets SET balance = balance - ?, pending_balance = pending_balance + ?, transaction_history = ? WHERE buter_id = ?`,
    [parseFloat(amount), parseFloat(amount), JSON.stringify(txHistory), buterId]
  );

  const [rows] = await pool.query('SELECT * FROM withdrawals WHERE id = ?', [result.insertId]);
  return rows[0];
};

module.exports = {
  getWalletByButerId,
  createWallet,
  getOrCreateWallet,
  getTransactions,
  addWithdrawal
};