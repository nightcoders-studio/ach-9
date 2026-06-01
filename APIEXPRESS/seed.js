require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mitabut_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function seed() {
  console.log('🌱 Seeding users...\n');

  const users = [
    {
      full_name: 'Ahmad Rizki',
      email: 'ahmad@customer.com',
      phone: '081311111111',
      password: 'password123',
      role: 'customer'
    },
    {
      full_name: 'Diana Putri',
      email: 'diana@buter.com',
      phone: '081322222222',
      password: 'password123',
      role: 'buter',
      buter_detail: {
        vehicle_type: 'Motor',
        id_card_photo: '/uploads/ktp_diana.jpg',
        skck_photo: '/uploads/skck_diana.jpg',
        selfie_photo: '/uploads/selfie_diana.jpg',
        approval_status: 'approved',
        total_earnings: 0,
        total_tasks_completed: 0
      }
    },
    {
      full_name: 'Admin Mitabut',
      email: 'admin@mitabut.com',
      phone: '081333333333',
      password: 'password123',
      role: 'admin'
    }
  ];

  for (const user of users) {
    const password_hash = await bcrypt.hash(user.password, 10);
    const buterDetail = user.buter_detail ? JSON.stringify(user.buter_detail) : null;
    const stats = JSON.stringify({ total_tasks: 0, total_spent: 0, avg_rating: 0 });

    try {
      const [result] = await pool.query(
        `INSERT INTO users (full_name, email, phone, password_hash, role, is_verified, buter_detail, stats)
         VALUES (?, ?, ?, ?, ?, TRUE, ?, ?)
         ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password_hash = VALUES(password_hash)`,
        [user.full_name, user.email, user.phone, password_hash, user.role, buterDetail, stats]
      );
      console.log(`✅ ${user.role}: ${user.email} / ${user.password}`);
    } catch (err) {
      console.log(`⚠️  ${user.email}: ${err.message}`);
    }

    // Create wallet for buter
    if (user.role === 'buter') {
      try {
        await pool.query(
          `INSERT INTO wallets (buter_id, balance, pending_balance, transaction_history)
           SELECT id, 0, 0, NULL FROM users WHERE email = ? AND role = 'buter'
           ON DUPLICATE KEY UPDATE balance = balance`,
          [user.email]
        );
        console.log(`   💰 Wallet created for ${user.email}`);
      } catch (err) {
        console.log(`   ⚠️  Wallet error: ${err.message}`);
      }
    }
  }

  console.log('\n✨ Done! You can login with any of the above credentials.\n');
  process.exit(0);
}

seed().catch(console.error);