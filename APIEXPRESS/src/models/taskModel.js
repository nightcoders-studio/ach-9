const pool = require('../config/database');

const getTaskById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
  return rows[0] || null;
};

const createTask = async ({ customer_id, description, pickup_location, dropoff_location, price, payment_method }) => {
  const [customer] = await pool.query('SELECT * FROM users WHERE id = ?', [customer_id]);

  const customer_snapshot = {
    full_name: customer[0].full_name,
    phone: customer[0].phone,
    email: customer[0].email
  };

  const timeline = { created_at: new Date().toISOString() };
  const payment = {
    method: payment_method,
    status: 'pending',
    amount: parseFloat(price)
  };

  const [result] = await pool.query(
    `INSERT INTO tasks (customer_id, customer_snapshot, description, pickup_location, dropoff_location, price, status, timeline, payment)
     VALUES (?, ?, ?, ?, ?, ?, 'waiting', ?, ?)`,
    [customer_id, JSON.stringify(customer_snapshot), description, pickup_location, dropoff_location, price, JSON.stringify(timeline), JSON.stringify(payment)]
  );

  return getTaskById(result.insertId);
};

const getTasks = async ({ status, customer_id, buter_id, min_price, max_price, page = 1, limit = 10, sort_by = 'created_at', sort_order = 'desc' }) => {
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (customer_id) {
    conditions.push('customer_id = ?');
    params.push(customer_id);
  }
  if (buter_id) {
    conditions.push('buter_id = ?');
    params.push(buter_id);
  }
  if (min_price) {
    conditions.push('price >= ?');
    params.push(parseFloat(min_price));
  }
  if (max_price) {
    conditions.push('price <= ?');
    params.push(parseFloat(max_price));
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const validSorts = ['created_at', 'price'];
  const sortField = validSorts.includes(sort_by) ? sort_by : 'created_at';
  const order = sort_order === 'asc' ? 'ASC' : 'DESC';

  const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM tasks ${whereClause}`, params);
  const total = countResult[0].total;

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT * FROM tasks ${whereClause} ORDER BY ${sortField} ${order} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    tasks: rows,
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) }
  };
};

const getWaitingTasks = async ({ page = 1, limit = 10, min_price, max_price }) => {
  const conditions = ["status = 'waiting'"];
  const params = [];

  if (min_price) {
    conditions.push('price >= ?');
    params.push(parseFloat(min_price));
  }
  if (max_price) {
    conditions.push('price <= ?');
    params.push(parseFloat(max_price));
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM tasks ${whereClause}`, params);
  const total = countResult[0].total;

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT id, description, pickup_location, dropoff_location, price, status, customer_snapshot, created_at FROM tasks ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    tasks: rows,
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) }
  };
};

const acceptTask = async (taskId, buterId) => {
  const [buter] = await pool.query('SELECT * FROM users WHERE id = ?', [buterId]);
  if (!buter[0]) return null;

  const buter_snapshot = {
    full_name: buter[0].full_name,
    phone: buter[0].phone,
    vehicle_type: buter[0].buter_detail?.vehicle_type || 'Motor'
  };

  const timeline = {
    created_at: new Date().toISOString(),
    taken_at: new Date().toISOString()
  };

  await pool.query(
    `UPDATE tasks SET buter_id = ?, buter_snapshot = ?, status = 'taken', timeline = ? WHERE id = ?`,
    [buterId, JSON.stringify(buter_snapshot), JSON.stringify(timeline), taskId]
  );

  return getTaskById(taskId);
};

const startTask = async (taskId) => {
  const task = await getTaskById(taskId);
  if (!task) return null;

  const timeline = typeof task.timeline === 'string' ? JSON.parse(task.timeline) : (task.timeline || {});
  timeline.started_at = new Date().toISOString();

  await pool.query(
    `UPDATE tasks SET status = 'on_progress', timeline = ? WHERE id = ?`,
    [JSON.stringify(timeline), taskId]
  );

  return getTaskById(taskId);
};

const completeTask = async (taskId) => {
  const task = await getTaskById(taskId);
  if (!task) return null;

  const timeline = typeof task.timeline === 'string' ? JSON.parse(task.timeline) : (task.timeline || {});
  timeline.completed_at = new Date().toISOString();

  const payment = typeof task.payment === 'string' ? JSON.parse(task.payment) : (task.payment || {});
  payment.status = 'paid';
  payment.paid_at = new Date().toISOString();

  await pool.query(
    `UPDATE tasks SET status = 'completed', timeline = ?, payment = ? WHERE id = ?`,
    [JSON.stringify(timeline), JSON.stringify(payment), taskId]
  );

  // Credit buter wallet
  if (task.buter_id) {
    const [wallet] = await pool.query('SELECT * FROM wallets WHERE buter_id = ?', [task.buter_id]);
    if (wallet[0]) {
      const txHistory = wallet[0].transaction_history ? (typeof wallet[0].transaction_history === 'string' ? JSON.parse(wallet[0].transaction_history) : wallet[0].transaction_history) : [];
      txHistory.push({
        type: 'earning',
        amount: parseFloat(task.price),
        task_id: taskId,
        date: new Date().toISOString()
      });

      await pool.query(
        `UPDATE wallets SET balance = balance + ?, transaction_history = ? WHERE buter_id = ?`,
        [parseFloat(task.price), JSON.stringify(txHistory), task.buter_id]
      );

      // Update buter stats
      const buterDetail = typeof task.buter_snapshot === 'string' ? JSON.parse(task.buter_snapshot) : task.buter_snapshot;
      await pool.query(
        `UPDATE users SET buter_detail = JSON_SET(COALESCE(buter_detail, '{}'), '$.total_earnings', COALESCE(JSON_EXTRACT(buter_detail, '$.total_earnings'), 0) + ?, '$.total_tasks_completed', COALESCE(JSON_EXTRACT(buter_detail, '$.total_tasks_completed'), 0) + 1) WHERE id = ?`,
        [parseFloat(task.price), task.buter_id]
      );
    }
  }

  return getTaskById(taskId);
};

const cancelTask = async (taskId, reason) => {
  await pool.query(
    `UPDATE tasks SET status = 'cancelled' WHERE id = ?`,
    [taskId]
  );
  return getTaskById(taskId);
};

const addReview = async (taskId, { rating, comment }) => {
  const review = {
    rating: parseInt(rating),
    comment: comment || '',
    created_at: new Date().toISOString()
  };

  await pool.query(
    `UPDATE tasks SET review = ? WHERE id = ?`,
    [JSON.stringify(review), taskId]
  );

  // Update user stats (customer's avg_rating based on their reviews given)
  const task = await getTaskById(taskId);
  if (task) {
    const [customerTasks] = await pool.query(`SELECT review FROM tasks WHERE customer_id = ? AND review IS NOT NULL`, [task.customer_id]);
    let totalRating = 0, count = 0;
    customerTasks.forEach(t => {
      const r = typeof t.review === 'string' ? JSON.parse(t.review) : t.review;
      if (r && r.rating) { totalRating += r.rating; count++; }
    });
    const avg_rating = count > 0 ? (totalRating / count).toFixed(1) : 0;

    await pool.query(
      `UPDATE users SET stats = JSON_SET(COALESCE(stats, '{}'), '$.avg_rating', ?) WHERE id = ?`,
      [parseFloat(avg_rating), task.customer_id]
    );
  }

  return getTaskById(taskId);
};

const addTrackingPoint = async (taskId, { lat, lng, status: statusText }) => {
  const task = await getTaskById(taskId);
  if (!task) return null;

  const tracking_history = task.tracking_history ? (typeof task.tracking_history === 'string' ? JSON.parse(task.tracking_history) : task.tracking_history) : [];
  tracking_history.push({
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    status: statusText,
    time: new Date().toISOString()
  });

  await pool.query(
    `UPDATE tasks SET tracking_history = ? WHERE id = ?`,
    [JSON.stringify(tracking_history), taskId]
  );

  return getTaskById(taskId);
};

const getTrackingHistory = async (taskId) => {
  const task = await getTaskById(taskId);
  if (!task) return null;
  return task.tracking_history ? (typeof task.tracking_history === 'string' ? JSON.parse(task.tracking_history) : task.tracking_history) : [];
};

module.exports = {
  getTaskById,
  createTask,
  getTasks,
  getWaitingTasks,
  acceptTask,
  startTask,
  completeTask,
  cancelTask,
  addReview,
  addTrackingPoint,
  getTrackingHistory
};