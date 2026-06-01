# Laporan Progres - Mitabut API

**Tanggal:** 2026-06-01
**Project:** Mitabut - P2P Errand & Delivery Service API
**Teknologi:** Express.js + MySQL2 (pooling, no Prisma)

---

## 1. Status Implementasi

### ✅ Completed Features

| Modul | Endpoint | Status |
|-------|----------|--------|
| **Auth** | POST /auth/register | ✅ |
| | POST /auth/login | ✅ |
| **Users** | GET /users/me | ✅ |
| | PUT /users/me | ✅ |
| | PUT /users/me/password | ✅ |
| | GET /users/:id | ✅ |
| **Buters** | POST /buters/register | ✅ |
| | PUT /buters/:id/approve | ✅ |
| | GET /buters | ✅ |
| **Tasks** | POST /tasks | ✅ |
| | GET /tasks | ✅ |
| | GET /tasks/waiting | ✅ |
| | GET /tasks/:id | ✅ |
| | POST /tasks/:id/accept | ✅ |
| | PUT /tasks/:id/start | ✅ |
| | PUT /tasks/:id/complete | ✅ |
| | PUT /tasks/:id/cancel | ✅ |
| | POST /tasks/:id/review | ✅ |
| | POST /tasks/:id/tracking | ✅ |
| | GET /tasks/:id/tracking | ✅ |
| **Wallets** | GET /wallets/me | ✅ |
| | GET /wallets/me/transactions | ✅ |
| **Withdrawals** | POST /withdrawals | ✅ |
| | GET /withdrawals | ✅ |
| | PUT /withdrawals/:id/process | ✅ |
| **Disputes** | POST /disputes | ✅ |
| | GET /disputes | ✅ |
| | GET /disputes/:id | ✅ |
| | PUT /disputes/:id/chat | ✅ |
| | PUT /disputes/:id/resolve | ✅ |
| | PUT /disputes/:id/status | ✅ |
| **Notifications** | GET /notifications | ✅ |
| | GET /notifications/unread-count | ✅ |
| | PUT /notifications/:id/read | ✅ |
| | PUT /notifications/read-all | ✅ |
| **Admin** | GET /admin/stats | ✅ |

---

## 2. User Credentials (3 Level Akses)

### Customer
```
Email:    ahmad@customer.com
Password: password123
Role:     customer
```

### Buter
```
Email:    diana@buter.com
Password: password123
Role:     buter
Status:   approved
Vehicle:  Motor
```

### Admin
```
Email:    admin@mitabut.com
Password: password123
Role:     admin
```

---

## 3. Test Results

### Auth Tests
| Test | Result |
|------|--------|
| Customer login | ✅ Berhasil |
| Buter login | ✅ Berhasil |
| Admin login | ✅ Berhasil |

### Customer Flow Tests
| Test | Result |
|------|--------|
| Create task | ✅ Berhasil - Task ID 5 created |
| Submit review | ✅ Berhasil - Rating 5 submitted |
| Get notifications | ✅ Berhasil - 1 notification |
| Get unread count | ✅ Berhasil - 1 unread |

### Buter Flow Tests
| Test | Result |
|------|--------|
| Accept task (task 5) | ✅ Berhasil - Status changed to 'taken' |
| Start task | ✅ Berhasil - Status changed to 'on_progress' |
| Add tracking point | ✅ Berhasil - GPS waypoint added |
| Complete task | ✅ Berhasil - Status changed to 'completed', payment marked 'paid' |
| Check wallet | ✅ Berhasil - Balance Rp 25.000 |
| Get transactions | ✅ Berhasil - 1 earning transaction |
| Request withdrawal | ✅ Berhasil - Withdrawal ID 3 created |

### Admin Flow Tests
| Test | Result |
|------|--------|
| Get platform stats | ✅ Berhasil |
| Get all withdrawals (pending) | ✅ Berhasil - 2 withdrawals shown |
| Process withdrawal | ✅ Berhasil - Status changed to 'processed' |
| Get disputes (status=open) | ✅ Berhasil |
| Create dispute | ✅ Berhasil - Dispute ID 2 created |

### Dispute Flow Tests
| Test | Result |
|------|--------|
| Customer create dispute | ✅ Berhasil |

---

## 4. Bug Fixes Applied

| Bug | Fix |
|-----|-----|
| MySQL datetime format error | Changed `new Date().toISOString()` to MySQL-compatible format `YYYY-MM-DD HH:MM:SS` for `processed_at` column |
| mysql2 pool query destructuring | Fixed `await pool.query()` to properly destructure `[rows]` instead of treating as nested array |

---

## 5. Database Schema

**Tables Created:**
- `users` - 7 users (seeded) + 3 test users
- `tasks` - 5 tasks
- `wallets` - 4 wallets
- `withdrawals` - 3 withdrawals
- `disputes` - 2 disputes
- `notifications` - 3 notifications

**Denormalized Columns (JSON):**
- `buter_detail`, `stats`, `customer_snapshot`, `buter_snapshot`
- `timeline`, `payment`, `review`, `tracking_history`
- `transaction_history`, `chat_history`, `related_task_snapshot`

---

## 6. Project Structure

```
mitabut-express/
├── src/
│   ├── index.js                 # Express app entry point
│   ├── config/
│   │   └── database.js          # MySQL2 connection pool
│   ├── middleware/
│   │   └── auth.js              # JWT auth + role middleware
│   ├── utils/
│   │   └── response.js          # Standardized response helpers
│   ├── models/
│   │   ├── userModel.js
│   │   ├── taskModel.js
│   │   ├── walletModel.js
│   │   ├── withdrawalModel.js
│   │   ├── disputeModel.js
│   │   └── notificationModel.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── buterController.js
│   │   ├── taskController.js
│   │   ├── walletController.js
│   │   ├── withdrawalController.js
│   │   ├── disputeController.js
│   │   ├── notificationController.js
│   │   └── adminController.js
│   └── routes/
│       ├── auth.js
│       ├── users.js
│       ├── buters.js
│       ├── tasks.js
│       ├── wallets.js
│       ├── withdrawals.js
│       ├── disputes.js
│       ├── notifications.js
│       └── admin.js
├── package.json
├── .env / .env.example
├── seed.js                      # Seed 3 test users
├── creden.md                    # Credentials documentation
├── skemadebe.sql               # Database schema + seed
└── laporanprogres.md           # This file
```

---

## 7. API Base URL

```
http://localhost:3000/api/v1
```

---

## 8. Notes

- MySQL2 connection pooling (no Prisma)
- JWT authentication with 7-day expiry
- Role-based access control (customer, buter, admin)
- Denormalized database design with JSON columns for snapshots
- All timestamps stored in ISO 8601 format except MySQL TIMESTAMP columns