const pool = require('../config/database');

const getDisputeById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM disputes WHERE id = ?', [id]);
  return rows[0] || null;
};

const createDispute = async ({ task_id, reported_by, reason, evidence }) => {
  const [reporter] = await pool.query('SELECT * FROM users WHERE id = ?', [reported_by]);
  if (!reporter[0]) return null;

  const reporter_snapshot = {
    full_name: reporter[0].full_name,
    phone: reporter[0].phone,
    role: reporter[0].role
  };

  const [result] = await pool.query(
    `INSERT INTO disputes (task_id, reported_by, reporter_snapshot, reason, evidence, status, chat_history) VALUES (?, ?, ?, ?, ?, 'open', ?)`,
    [task_id, reported_by, JSON.stringify(reporter_snapshot), reason, evidence || null, JSON.stringify([])]
  );

  // Update task status to dispute
  await pool.query(`UPDATE tasks SET status = 'dispute' WHERE id = ?`, [task_id]);

  const [rows] = await pool.query('SELECT * FROM disputes WHERE id = ?', [result.insertId]);
  return rows[0];
};

const getDisputes = async ({ status, task_id, page = 1, limit = 10 }) => {
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (task_id) {
    conditions.push('task_id = ?');
    params.push(task_id);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM disputes ${whereClause}`, params);
  const total = countResult[0].total;

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT * FROM disputes ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    disputes: rows,
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) }
  };
};

const addChatMessage = async (disputeId, { sender, message }) => {
  const dispute = await getDisputeById(disputeId);
  if (!dispute) return null;

  const chat_history = dispute.chat_history ? (typeof dispute.chat_history === 'string' ? JSON.parse(dispute.chat_history) : dispute.chat_history) : [];
  chat_history.push({
    sender,
    message,
    time: new Date().toISOString()
  });

  await pool.query(
    `UPDATE disputes SET chat_history = ? WHERE id = ?`,
    [JSON.stringify(chat_history), disputeId]
  );

  return getDisputeById(disputeId);
};

const resolveDispute = async (id, { resolution, status = 'resolved' }) => {
  await pool.query(
    `UPDATE disputes SET resolution = ?, status = ? WHERE id = ?`,
    [resolution, status, id]
  );
  return getDisputeById(id);
};

const updateDisputeStatus = async (id, status) => {
  await pool.query(`UPDATE disputes SET status = ? WHERE id = ?`, [status, id]);
  return getDisputeById(id);
};

module.exports = {
  getDisputeById,
  createDispute,
  getDisputes,
  addChatMessage,
  resolveDispute,
  updateDisputeStatus
};