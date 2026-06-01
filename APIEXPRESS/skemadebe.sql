-- ============================================
-- DATABASE: mitabut_db (NON-RELATIONAL / DENORMALIZED)
-- MySQL Version - FIXED (tanpa DEFAULT value pada kolom JSON)
-- ============================================

-- Buat database
CREATE DATABASE IF NOT EXISTS mitabut_db;
USE mitabut_db;

-- ============================================
-- 1. Tabel users (tanpa DEFAULT pada kolom JSON)
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'buter', 'admin')),
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Data khusus buter (disimpan sebagai JSON, bisa NULL untuk customer)
    buter_detail JSON DEFAULT NULL,
    
    -- Statistik (tanpa DEFAULT value)
    stats JSON NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 2. Tabel tasks
-- ============================================
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- IDs untuk referensi (tanpa FK constraint)
    customer_id INT NOT NULL,
    buter_id INT NULL,
    
    -- Data customer & buter di-embed (denormalized)
    customer_snapshot JSON NOT NULL,
    buter_snapshot JSON NULL,
    
    -- Detail task
    description TEXT NOT NULL,
    pickup_location TEXT NOT NULL,
    dropoff_location TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'taken', 'on_progress', 'completed', 'dispute', 'cancelled')),
    
    -- Timeline (disimpan sebagai JSON)
    timeline JSON NULL,
    
    -- Payment data (embedded)
    payment JSON NULL,
    
    -- Review data (embedded)
    review JSON NULL,
    
    -- Tracking history (array of locations)
    tracking_history JSON NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 3. Tabel wallets
-- ============================================
CREATE TABLE wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    buter_id INT NOT NULL UNIQUE,
    balance DECIMAL(10,2) DEFAULT 0,
    pending_balance DECIMAL(10,2) DEFAULT 0,
    
    -- History transaksi (embedded)
    transaction_history JSON NULL,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 4. Tabel withdrawals
-- ============================================
CREATE TABLE withdrawals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    buter_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    bank_account VARCHAR(50) NOT NULL,
    bank_name VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    
    -- Detail buter saat withdraw (snapshot)
    buter_snapshot JSON NOT NULL,
    
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    notes TEXT
);

-- ============================================
-- 5. Tabel disputes
-- ============================================
CREATE TABLE disputes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    reported_by INT NOT NULL,
    
    -- Snapshot data pelapor
    reporter_snapshot JSON NOT NULL,
    
    -- Detail dispute
    reason TEXT NOT NULL,
    evidence TEXT,
    resolution TEXT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    
    -- Chat history (embedded)
    chat_history JSON NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 6. Tabel notifications
-- ============================================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    
    -- Snapshot user (nama, role)
    user_snapshot JSON NOT NULL,
    
    type VARCHAR(30) NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    related_task_id INT NULL,
    related_task_snapshot JSON NULL,
    
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. INDEXES (untuk performa)
-- ============================================

-- Users indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Tasks indexes
CREATE INDEX idx_tasks_customer_id ON tasks(customer_id);
CREATE INDEX idx_tasks_buter_id ON tasks(buter_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_price ON tasks(price);

-- Wallets indexes
CREATE INDEX idx_wallets_buter_id ON wallets(buter_id);
CREATE INDEX idx_wallets_balance ON wallets(balance);

-- Withdrawals indexes
CREATE INDEX idx_withdrawals_buter_id ON withdrawals(buter_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_withdrawals_requested_at ON withdrawals(requested_at);

-- Disputes indexes
CREATE INDEX idx_disputes_task_id ON disputes(task_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_reported_by ON disputes(reported_by);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_type ON notifications(type);

-- ============================================
-- 8. SEED DATA (Contoh Data)
-- ============================================

-- Insert users (dengan buter_detail embedded)
INSERT INTO users (full_name, email, phone, password_hash, role, is_verified, buter_detail, stats) VALUES
(
    'Budi Santoso', 'budi@example.com', '081234567890', 'hash_budi', 'customer', TRUE,
    NULL,
    JSON_OBJECT('total_tasks', 3, 'total_spent', 85000, 'avg_rating', 4.5)
),
(
    'Siti Aminah', 'siti@example.com', '081234567891', 'hash_siti', 'buter', TRUE,
    JSON_OBJECT(
        'vehicle_type', 'Motor',
        'id_card_photo', '/uploads/ktp_siti.jpg',
        'skck_photo', '/uploads/skck_siti.jpg',
        'selfie_photo', '/uploads/selfie_siti.jpg',
        'approval_status', 'approved',
        'total_earnings', 65000,
        'total_tasks_completed', 3
    ),
    JSON_OBJECT('total_tasks', 3, 'total_spent', 0, 'avg_rating', 4.7)
),
(
    'Admin Mitabut', 'admin@mitabut.com', '081234567892', 'hash_admin', 'admin', TRUE,
    NULL,
    JSON_OBJECT('total_tasks', 0, 'total_spent', 0, 'avg_rating', 0)
),
(
    'Andi Wijaya', 'andi@example.com', '081234567893', 'hash_andi', 'customer', TRUE,
    NULL,
    JSON_OBJECT('total_tasks', 2, 'total_spent', 90000, 'avg_rating', 0)
),
(
    'Rina Febrianti', 'rina@example.com', '081234567894', 'hash_rina', 'buter', TRUE,
    JSON_OBJECT(
        'vehicle_type', 'Motor',
        'id_card_photo', '/uploads/ktp_rina.jpg',
        'skck_photo', '/uploads/skck_rina.jpg',
        'selfie_photo', '/uploads/selfie_rina.jpg',
        'approval_status', 'approved',
        'total_earnings', 35000,
        'total_tasks_completed', 1
    ),
    JSON_OBJECT('total_tasks', 1, 'total_spent', 0, 'avg_rating', 0)
),
(
    'Joko Susilo', 'joko@example.com', '081234567895', 'hash_joko', 'buter', FALSE,
    JSON_OBJECT(
        'vehicle_type', 'Motor',
        'id_card_photo', '/uploads/ktp_joko.jpg',
        'skck_photo', '/uploads/skck_joko.jpg',
        'selfie_photo', '/uploads/selfie_joko.jpg',
        'approval_status', 'pending',
        'total_earnings', 0,
        'total_tasks_completed', 0
    ),
    JSON_OBJECT('total_tasks', 0, 'total_spent', 0, 'avg_rating', 0)
),
(
    'Dewi Kartika', 'dewi@example.com', '081234567896', 'hash_dewi', 'customer', TRUE,
    NULL,
    JSON_OBJECT('total_tasks', 0, 'total_spent', 0, 'avg_rating', 0)
);

-- Insert tasks
INSERT INTO tasks (
    customer_id, buter_id, customer_snapshot, buter_snapshot,
    description, pickup_location, dropoff_location, price, status,
    timeline, payment, review, tracking_history
) VALUES 
(
    1, 2,
    JSON_OBJECT('full_name', 'Budi Santoso', 'phone', '081234567890', 'email', 'budi@example.com'),
    JSON_OBJECT('full_name', 'Siti Aminah', 'phone', '081234567891', 'vehicle_type', 'Motor'),
    'Beli bawang merah 1kg dan bawang putih 1/2kg di Pasar Senen, antar ke apartemen',
    'Pasar Senen, Jakarta Pusat', 'Apartemen Green Pramuka, Jakarta Pusat',
    25000, 'completed',
    JSON_OBJECT(
        'created_at', '2026-06-01T08:00:00Z',
        'taken_at', '2026-06-01T08:05:00Z',
        'started_at', '2026-06-01T08:10:00Z',
        'completed_at', '2026-06-01T09:00:00Z'
    ),
    JSON_OBJECT(
        'method', 'gopay',
        'status', 'paid',
        'paid_at', '2026-06-01T08:00:00Z',
        'amount', 25000,
        'transaction_id', 'TRX001'
    ),
    JSON_OBJECT(
        'rating', 5,
        'comment', 'Cepat dan ramah, barang sampai dengan aman',
        'created_at', '2026-06-01T09:30:00Z'
    ),
    JSON_ARRAY(
        JSON_OBJECT('lat', -6.1754, 'lng', 106.8456, 'time', '2026-06-01T08:10:00Z', 'status', 'menuju pasar'),
        JSON_OBJECT('lat', -6.1854, 'lng', 106.8556, 'time', '2026-06-01T08:30:00Z', 'status', 'di pasar'),
        JSON_OBJECT('lat', -6.1954, 'lng', 106.8656, 'time', '2026-06-01T08:50:00Z', 'status', 'menuju tujuan'),
        JSON_OBJECT('lat', -6.1854, 'lng', 106.8556, 'time', '2026-06-01T09:00:00Z', 'status', 'selesai')
    )
),
(
    4, NULL,
    JSON_OBJECT('full_name', 'Andi Wijaya', 'phone', '081234567893', 'email', 'andi@example.com'),
    NULL,
    'Ambil STNK di Samsat dan antar ke rumah',
    'Samsat Jakarta Selatan', 'Jl. Fatmawati No. 10, Jakarta Selatan',
    50000, 'waiting',
    JSON_OBJECT('created_at', '2026-06-01T10:00:00Z'),
    JSON_OBJECT('method', 'qris', 'status', 'pending', 'amount', 50000),
    NULL,
    NULL
),
(
    1, 5,
    JSON_OBJECT('full_name', 'Budi Santoso', 'phone', '081234567890', 'email', 'budi@example.com'),
    JSON_OBJECT('full_name', 'Rina Febrianti', 'phone', '081234567894', 'vehicle_type', 'Motor'),
    'Antar dokumen penting ke kantor klien',
    'Kantor Budi di Kuningan', 'Gedung Sudirman Place, Jl. Jend. Sudirman',
    35000, 'taken',
    JSON_OBJECT(
        'created_at', '2026-06-01T11:00:00Z',
        'taken_at', '2026-06-01T11:05:00Z'
    ),
    JSON_OBJECT(
        'method', 'bank_transfer',
        'status', 'paid',
        'paid_at', '2026-06-01T11:00:00Z',
        'amount', 35000
    ),
    NULL,
    JSON_ARRAY(
        JSON_OBJECT('lat', -6.2154, 'lng', 106.8156, 'time', '2026-06-01T11:10:00Z', 'status', 'menuju lokasi')
    )
),
(
    7, 2,
    JSON_OBJECT('full_name', 'Dewi Kartika', 'phone', '081234567896', 'email', 'dewi@example.com'),
    JSON_OBJECT('full_name', 'Siti Aminah', 'phone', '081234567891', 'vehicle_type', 'Motor'),
    'Bayar tagihan listrik dan internet di convenience store terdekat',
    'Indomaret Fatmawati', '-',
    15000, 'completed',
    JSON_OBJECT(
        'created_at', '2026-06-01T13:00:00Z',
        'taken_at', '2026-06-01T13:05:00Z',
        'completed_at', '2026-06-01T13:30:00Z'
    ),
    JSON_OBJECT(
        'method', 'dana',
        'status', 'paid',
        'paid_at', '2026-06-01T13:00:00Z',
        'amount', 15000
    ),
    JSON_OBJECT(
        'rating', 4,
        'comment', 'Membantu banget',
        'created_at', '2026-06-01T14:00:00Z'
    ),
    NULL
);

-- Insert wallets
INSERT INTO wallets (buter_id, balance, pending_balance, transaction_history) VALUES
(
    2, 65000, 0,
    JSON_ARRAY(
        JSON_OBJECT('type', 'earning', 'amount', 25000, 'task_id', 1, 'date', '2026-06-01T09:00:00Z'),
        JSON_OBJECT('type', 'withdrawal', 'amount', -50000, 'date', '2026-06-01T10:00:00Z', 'status', 'processed'),
        JSON_OBJECT('type', 'earning', 'amount', 15000, 'task_id', 4, 'date', '2026-06-01T13:30:00Z')
    )
),
(
    5, 35000, 0,
    JSON_ARRAY(
        JSON_OBJECT('type', 'earning', 'amount', 35000, 'task_id', 3, 'date', '2026-06-01T11:00:00Z')
    )
),
(
    6, 0, 0,
    NULL
);

-- Insert withdrawals
INSERT INTO withdrawals (buter_id, amount, bank_account, bank_name, status, buter_snapshot, processed_at) VALUES
(
    2, 50000, '1234567890', 'BCA', 'processed',
    JSON_OBJECT('full_name', 'Siti Aminah', 'phone', '081234567891', 'email', 'siti@example.com'),
    '2026-06-01 10:30:00'
),
(
    5, 20000, '0987654321', 'Mandiri', 'pending',
    JSON_OBJECT('full_name', 'Rina Febrianti', 'phone', '081234567894', 'email', 'rina@example.com'),
    NULL
);

-- Insert disputes
INSERT INTO disputes (task_id, reported_by, reporter_snapshot, reason, evidence, status, chat_history) VALUES
(
    1, 1,
    JSON_OBJECT('full_name', 'Budi Santoso', 'phone', '081234567890', 'role', 'customer'),
    'Barang datang terlambat 15 menit',
    '/uploads/evidence_chat.jpg',
    'resolved',
    JSON_ARRAY(
        JSON_OBJECT('sender', 'customer', 'message', 'Barang telat 15 menit', 'time', '2026-06-01T09:05:00Z'),
        JSON_OBJECT('sender', 'admin', 'message', 'Sudah diklarifikasi karena macet', 'time', '2026-06-01T10:00:00Z')
    )
);

-- Insert notifications
INSERT INTO notifications (user_id, user_snapshot, type, title, message, related_task_id, related_task_snapshot) VALUES
(
    1,
    JSON_OBJECT('full_name', 'Budi Santoso', 'role', 'customer'),
    'task_completed',
    'Tugas selesai',
    'Tugas belanja Anda telah selesai',
    1,
    JSON_OBJECT('description', 'Beli bawang merah', 'price', 25000)
),
(
    2,
    JSON_OBJECT('full_name', 'Siti Aminah', 'role', 'buter'),
    'payment_received',
    'Pembayaran masuk',
    'Anda menerima pembayaran Rp15.000 untuk tugas #4',
    4,
    JSON_OBJECT('description', 'Bayar tagihan', 'price', 15000)
),
(
    7,
    JSON_OBJECT('full_name', 'Dewi Kartika', 'role', 'customer'),
    'task_completed',
    'Tugas selesai',
    'Tugas bayar tagihan Anda telah selesai',
    4,
    JSON_OBJECT('description', 'Bayar tagihan', 'price', 15000)
);

-- ============================================
-- 9. VERIFIKASI DATA
-- ============================================

-- Cek semua tabel sudah terisi
SELECT 'users' as table_name, COUNT(*) as total_rows FROM users
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'wallets', COUNT(*) FROM wallets
UNION ALL
SELECT 'withdrawals', COUNT(*) FROM withdrawals
UNION ALL
SELECT 'disputes', COUNT(*) FROM disputes
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;

-- Tampilkan sample data
SELECT id, full_name, role FROM users LIMIT 5;
SELECT id, description, price, status FROM tasks LIMIT 5;
SELECT * FROM wallets;

-- ============================================
-- SELESAI
-- ============================================