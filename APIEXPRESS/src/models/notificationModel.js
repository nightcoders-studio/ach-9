const pool = require('../config/database');

const getNotifications = async ({ user_id, is_read, type, page = 1, limit = 10 }) => {
  const conditions = ['user_id = ?'];
  const params = [user_id];

  if (is_read !== undefined) {
    conditions.push('is_read = ?');
    params.push(is_read === 'true' || is_read === true ? 1 : 0);
  }
  if (type) {
    conditions.push('type = ?');
    params.push(type);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM notifications ${whereClause}`, params);
  const total = countResult[0].total;

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT * FROM notifications ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    notifications: rows,
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) }
  };
};

const getUnreadCount = async (userId) => {
  const [result] = await pool.query(
    `SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE`,
    [userId]
  );
  return result[0].unread_count;
};

const markAsRead = async (id, userId) => {
  await pool.query(`UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?`, [id, userId]);
  const [rows] = await pool.query('SELECT * FROM notifications WHERE id = ?', [id]);
  return rows[0] || null;
};

const markAllAsRead = async (userId) => {
  const [result] = await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE`,
    [userId]
  );
  return { count: result.affectedRows };
};

const createNotification = async ({ user_id, type, title, message, related_task_id, related_task_snapshot }) => {
  const [user] = await pool.query('SELECT full_name, role FROM users WHERE id = ?', [user_id]);
  const user_snapshot = user[0] ? { full_name: user[0].full_name, role: user[0].role } : null;

  const snapshot = related_task_snapshot ? (typeof related_task_snapshot === 'string' ? related_task_snapshot : JSON.stringify(related_task_snapshot)) : null;

  const [result] = await pool.query(
    `INSERT INTO notifications (user_id, user_snapshot, type, title, message, related_task_id, related_task_snapshot) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user_id, JSON.stringify(user_snapshot), type, title, message, related_task_id || null, snapshot]
  );

  const [rows] = await pool.query('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
  return rows[0];
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification
};