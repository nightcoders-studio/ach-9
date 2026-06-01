const pool = require('../config/database');

const getUserById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] || null;
};

const getUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

const getUserByPhone = async (phone) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE phone = ?', [phone]);
  return rows[0] || null;
};

const createUser = async ({ full_name, email, phone, password_hash, role }) => {
  const [result] = await pool.query(
    `INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
    [full_name, email, phone, password_hash, role]
  );
  return getUserById(result.insertId);
};

const updateUser = async (id, fields) => {
  const allowedFields = ['full_name', 'phone'];
  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (fields[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(fields[field]);
    }
  }

  if (updates.length === 0) return getUserById(id);

  values.push(id);
  await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
  return getUserById(id);
};

const getPublicProfile = async (id) => {
  const [rows] = await pool.query(
    `SELECT id, full_name, role, is_verified, buter_detail, stats, created_at FROM users WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

const getButers = async ({ page = 1, limit = 10, vehicle_type, sort_by = 'avg_rating' }) => {
  const offset = (page - 1) * limit;
  let whereClause = `WHERE role = 'buter' AND JSON_EXTRACT(buter_detail, '$.approval_status') = 'approved'`;
  const params = [];

  if (vehicle_type) {
    whereClause += ` AND JSON_EXTRACT(buter_detail, '$.vehicle_type') = ?`;
    params.push(vehicle_type);
  }

  const validSorts = ['avg_rating', 'total_tasks_completed', 'created_at'];
  const sortField = validSorts.includes(sort_by) ? sort_by : 'avg_rating';

  const [countResult] = await pool.query(
    `SELECT COUNT(*) as total FROM users ${whereClause}`,
    params
  );
  const total = countResult[0].total;

  const orderClause = sortField === 'avg_rating'
    ? `ORDER BY CAST(JSON_EXTRACT(stats, '$.avg_rating') AS DECIMAL(3,2)) DESC`
    : `ORDER BY CAST(JSON_EXTRACT(buter_detail, '$.${sortField}') AS UNSIGNED) DESC`;

  const [rows] = await pool.query(
    `SELECT id, full_name, buter_detail, stats, created_at FROM users ${whereClause} ${orderClause} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    buters: rows,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit)
    }
  };
};

const updateButerDetail = async (id, buter_detail) => {
  await pool.query(`UPDATE users SET buter_detail = ? WHERE id = ?`, [JSON.stringify(buter_detail), id]);
  return getUserById(id);
};

const updateButerApproval = async (id, approval_status) => {
  const user = await getUserById(id);
  if (!user || !user.buter_detail) return null;

  const detail = typeof user.buter_detail === 'string' ? JSON.parse(user.buter_detail) : user.buter_detail;
  detail.approval_status = approval_status;

  await pool.query(`UPDATE users SET buter_detail = ? WHERE id = ?`, [JSON.stringify(detail), id]);
  return getUserById(id);
};

const updateUserStats = async (id, statsUpdate) => {
  const user = await getUserById(id);
  if (!user) return null;

  const currentStats = user.stats && typeof user.stats === 'string' ? JSON.parse(user.stats) : (user.stats || {});
  const newStats = { ...currentStats, ...statsUpdate };

  await pool.query(`UPDATE users SET stats = ? WHERE id = ?`, [JSON.stringify(newStats), id]);
  return getUserById(id);
};

module.exports = {
  getUserById,
  getUserByEmail,
  getUserByPhone,
  createUser,
  updateUser,
  getPublicProfile,
  getButers,
  updateButerDetail,
  updateButerApproval,
  updateUserStats
};