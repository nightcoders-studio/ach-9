# MITABUT - API Endpoints Documentation

## Base URL
```
http://localhost:3000/api/v1
```

---

## Authentication

### POST /auth/register
Register a new user (customer or buter).

**Request Body:**
```json
{
  "full_name": "string (required, max 100)",
  "email": "string (required, unique)",
  "phone": "string (required, unique, max 15)",
  "password": "string (required, min 6 chars)",
  "role": "customer | buter (required)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 8,
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "081234567897",
    "role": "customer",
    "is_verified": false,
    "buter_detail": null,
    "stats": null,
    "created_at": "2026-06-01T12:00:00Z"
  }
}
```

**Errors:**
- `400` — Missing required fields
- `409` — Email or phone already exists

---

### POST /auth/login
Authenticate user and receive barrier token.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "a1b2c3d4e5f6g7h8...",
    "user": {
      "id": 1,
      "full_name": "Budi Santoso",
      "email": "budi@example.com",
      "role": "customer",
      "is_verified": true
    }
  }
}
```

**Errors:**
- `401` — Invalid credentials
- `404` — User not found

---

## Users

### GET /users/me
Get current authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "full_name": "Budi Santoso",
    "email": "budi@example.com",
    "phone": "081234567890",
    "role": "customer",
    "is_verified": true,
    "buter_detail": null,
    "stats": {
      "total_tasks": 3,
      "total_spent": 85000,
      "avg_rating": 4.5
    },
    "created_at": "2026-01-15T08:00:00Z",
    "updated_at": "2026-06-01T10:00:00Z"
  }
}
```

---

### PUT /users/me
Update current user's profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "full_name": "string (optional)",
  "phone": "string (optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { /* updated user object */ }
}
```

---

### PUT /users/me/password
Change current user's password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "current_password": "string (required)",
  "new_password": "string (required, min 6 chars)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### GET /users/:id
Get a specific user's public profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "full_name": "Siti Aminah",
    "role": "buter",
    "is_verified": true,
    "buter_detail": {
      "vehicle_type": "Motor",
      "approval_status": "approved",
      "total_earnings": 65000,
      "total_tasks_completed": 3
    },
    "stats": {
      "total_tasks": 3,
      "avg_rating": 4.7
    }
  }
}
```

---

## Buter Management

### POST /buters/register
Register as a buter (complete buter onboarding).

**Headers:** `Authorization: Bearer <token>` (must be existing user with `buter` role)

**Request Body:**
```json
{
  "vehicle_type": "string (required, e.g., 'Motor')",
  "id_card_photo": "string (file path or URL)",
  "skck_photo": "string (file path or URL)",
  "selfie_photo": "string (file path or URL)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Buter registration submitted for approval",
  "data": {
    "buter_detail": {
      "vehicle_type": "Motor",
      "id_card_photo": "/uploads/ktp_john.jpg",
      "skck_photo": "/uploads/skck_john.jpg",
      "selfie_photo": "/uploads/selfie_john.jpg",
      "approval_status": "pending",
      "total_earnings": 0,
      "total_tasks_completed": 0
    }
  }
}
```

---

### PUT /buters/:id/approve
Approve a buter's registration (admin only).

**Headers:** `Authorization: Bearer <token>` (admin role required)

**Request Body:**
```json
{
  "status": "approved | rejected",
  "notes": "string (optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Buter approval status updated"
}
```

---

### GET /buters
List all approved buters (available for task assignment).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (int, default: 1)
- `limit` (int, default: 10)
- `vehicle_type` (string, optional)
- `sort_by` (string, default: `avg_rating`) — `avg_rating`, `total_tasks_completed`, `created_at`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "buters": [
      {
        "id": 2,
        "full_name": "Siti Aminah",
        "buter_detail": {
          "vehicle_type": "Motor",
          "approval_status": "approved",
          "total_tasks_completed": 3
        },
        "stats": {
          "avg_rating": 4.7,
          "total_tasks": 3
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "total_pages": 1
    }
  }
}
```

---

## Tasks

### POST /tasks
Create a new task (customer only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "description": "string (required)",
  "pickup_location": "string (required)",
  "dropoff_location": "string (required)",
  "price": "number (required, decimal)",
  "payment_method": "gopay | qris | bank_transfer | dana (required)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 5,
    "customer_id": 1,
    "buter_id": null,
    "description": "Beli bawang merah 1kg di Pasar Senen",
    "pickup_location": "Pasar Senen, Jakarta Pusat",
    "dropoff_location": "Apartemen Green Pramuka, Jakarta Pusat",
    "price": 25000,
    "status": "waiting",
    "customer_snapshot": {
      "full_name": "Budi Santoso",
      "phone": "081234567890",
      "email": "budi@example.com"
    },
    "buter_snapshot": null,
    "timeline": {
      "created_at": "2026-06-01T12:00:00Z"
    },
    "payment": {
      "method": "gopay",
      "status": "pending",
      "amount": 25000
    },
    "review": null,
    "tracking_history": null,
    "created_at": "2026-06-01T12:00:00Z"
  }
}
```

---

### GET /tasks
List tasks with filters.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` — `waiting | taken | on_progress | completed | dispute | cancelled`
- `customer_id` — filter by customer
- `buter_id` — filter by assigned buter
- `min_price` — minimum price filter
- `max_price` — maximum price filter
- `page` (int, default: 1)
- `limit` (int, default: 10)
- `sort_by` — `created_at | price` (default: `created_at`)
- `sort_order` — `asc | desc` (default: `desc`)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tasks": [ /* task objects */ ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "total_pages": 2
    }
  }
}
```

---

### GET /tasks/waiting
List all waiting tasks (for buters to browse and accept).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`, `limit`
- `min_price`, `max_price`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": 2,
        "description": "Ambil STNK di Samsat dan antar ke rumah",
        "pickup_location": "Samsat Jakarta Selatan",
        "dropoff_location": "Jl. Fatmawati No. 10, Jakarta Selatan",
        "price": 50000,
        "status": "waiting",
        "customer_snapshot": {
          "full_name": "Andi Wijaya",
          "phone": "081234567893"
        },
        "created_at": "2026-06-01T10:00:00Z"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

---

### GET /tasks/:id
Get task details by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customer_id": 1,
    "buter_id": 2,
    "description": "Beli bawang merah 1kg dan bawang putih 1/2kg di Pasar Senen",
    "pickup_location": "Pasar Senen, Jakarta Pusat",
    "dropoff_location": "Apartemen Green Pramuka, Jakarta Pusat",
    "price": 25000,
    "status": "completed",
    "customer_snapshot": { /* ... */ },
    "buter_snapshot": { /* ... */ },
    "timeline": {
      "created_at": "2026-06-01T08:00:00Z",
      "taken_at": "2026-06-01T08:05:00Z",
      "started_at": "2026-06-01T08:10:00Z",
      "completed_at": "2026-06-01T09:00:00Z"
    },
    "payment": {
      "method": "gopay",
      "status": "paid",
      "paid_at": "2026-06-01T08:00:00Z",
      "amount": 25000,
      "transaction_id": "TRX001"
    },
    "review": {
      "rating": 5,
      "comment": "Cepat dan ramah, barang sampai dengan aman",
      "created_at": "2026-06-01T09:30:00Z"
    },
    "tracking_history": [
      { "lat": -6.1754, "lng": 106.8456, "time": "2026-06-01T08:10:00Z", "status": "menuju pasar" }
    ]
  }
}
```

---

### POST /tasks/:id/accept
Buter accepts a waiting task.

**Headers:** `Authorization: Bearer <token>` (buter role required)

**Response (200):**
```json
{
  "success": true,
  "message": "Task accepted successfully",
  "data": {
    "id": 2,
    "status": "taken",
    "buter_id": 2,
    "buter_snapshot": {
      "full_name": "Siti Aminah",
      "phone": "081234567891",
      "vehicle_type": "Motor"
    },
    "timeline": {
      "created_at": "2026-06-01T10:00:00Z",
      "taken_at": "2026-06-01T10:05:00Z"
    }
  }
}
```

**Errors:**
- `400` — Task is not in `waiting` status
- `409` — Task already taken by another buter

---

### PUT /tasks/:id/start
Buter starts executing the task (picked up from pickup location).

**Headers:** `Authorization: Bearer <token>` (assigned buter only)

**Response (200):**
```json
{
  "success": true,
  "message": "Task started",
  "data": {
    "id": 2,
    "status": "on_progress",
    "timeline": {
      "created_at": "2026-06-01T10:00:00Z",
      "taken_at": "2026-06-01T10:05:00Z",
      "started_at": "2026-06-01T10:10:00Z"
    }
  }
}
```

---

### PUT /tasks/:id/complete
Mark task as completed (buter confirms delivery).

**Headers:** `Authorization: Bearer <token>` (assigned buter only)

**Response (200):**
```json
{
  "success": true,
  "message": "Task completed successfully",
  "data": {
    "id": 2,
    "status": "completed",
    "timeline": {
      "completed_at": "2026-06-01T11:00:00Z"
    }
  }
}
```

---

### PUT /tasks/:id/cancel
Cancel a task.

**Headers:** `Authorization: Bearer <token>` (task owner or admin only)

**Request Body:**
```json
{
  "reason": "string (optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task cancelled",
  "data": {
    "id": 2,
    "status": "cancelled"
  }
}
```

---

### POST /tasks/:id/review
Customer submits review for completed task.

**Headers:** `Authorization: Bearer <token>` (task customer only)

**Request Body:**
```json
{
  "rating": "number (required, 1-5)",
  "comment": "string (optional, max 500)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Review submitted",
  "data": {
    "id": 1,
    "review": {
      "rating": 5,
      "comment": "Cepat dan ramah, barang sampai dengan aman",
      "created_at": "2026-06-01T12:00:00Z"
    }
  }
}
```

---

## Task Tracking

### POST /tasks/:id/tracking
Add a GPS tracking point to task.

**Headers:** `Authorization: Bearer <token>` (assigned buter only)

**Request Body:**
```json
{
  "lat": "number (required)",
  "lng": "number (required)",
  "status": "string (required, e.g., 'menuju pasar', 'di pasar', 'menuju tujuan')"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Tracking point added",
  "data": {
    "tracking_history": [
      { "lat": -6.1754, "lng": 106.8456, "time": "2026-06-01T08:10:00Z", "status": "menuju pasar" }
    ]
  }
}
```

---

### GET /tasks/:id/tracking
Get all tracking history for a task.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tracking_history": [
      { "lat": -6.1754, "lng": 106.8456, "time": "2026-06-01T08:10:00Z", "status": "menuju pasar" },
      { "lat": -6.1854, "lng": 106.8556, "time": "2026-06-01T08:30:00Z", "status": "di pasar" }
    ]
  }
}
```

---

## Wallets

### GET /wallets/me
Get current buter's wallet.

**Headers:** `Authorization: Bearer <token>` (buter role required)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "buter_id": 2,
    "balance": 65000,
    "pending_balance": 0,
    "transaction_history": [
      { "type": "earning", "amount": 25000, "task_id": 1, "date": "2026-06-01T09:00:00Z" },
      { "type": "withdrawal", "amount": -50000, "date": "2026-06-01T10:00:00Z", "status": "processed" },
      { "type": "earning", "amount": 15000, "task_id": 4, "date": "2026-06-01T13:30:00Z" }
    ]
  }
}
```

---

### GET /wallets/me/transactions
Get wallet transaction history.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `type` — `earning | withdrawal | refund`
- `page`, `limit`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transactions": [ /* transaction objects */ ],
    "pagination": { /* ... */ }
  }
}
```

---

## Withdrawals

### POST /withdrawals
Request a withdrawal (buter only).

**Headers:** `Authorization: Bearer <token>` (buter role required)

**Request Body:**
```json
{
  "amount": "number (required, must be <= balance)",
  "bank_account": "string (required, max 50)",
  "bank_name": "string (optional, max 50)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Withdrawal requested successfully",
  "data": {
    "id": 3,
    "buter_id": 2,
    "amount": 30000,
    "bank_account": "1234567890",
    "bank_name": "BCA",
    "status": "pending",
    "buter_snapshot": {
      "full_name": "Siti Aminah",
      "phone": "081234567891",
      "email": "siti@example.com"
    },
    "requested_at": "2026-06-01T14:00:00Z"
  }
}
```

**Errors:**
- `400` — Insufficient balance
- `400` — Invalid amount

---

### GET /withdrawals
List withdrawals (admin: all, buter: own only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` — `pending | processed | rejected`
- `buter_id` — filter by buter (admin only)
- `page`, `limit`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "withdrawals": [
      {
        "id": 1,
        "buter_id": 2,
        "amount": 50000,
        "bank_account": "1234567890",
        "bank_name": "BCA",
        "status": "processed",
        "buter_snapshot": { /* ... */ },
        "requested_at": "2026-06-01T09:00:00Z",
        "processed_at": "2026-06-01T10:30:00Z"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

---

### PUT /withdrawals/:id/process
Process a withdrawal request (admin only).

**Headers:** `Authorization: Bearer <token>` (admin role required)

**Request Body:**
```json
{
  "status": "processed | rejected",
  "notes": "string (optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Withdrawal processed",
  "data": {
    "id": 2,
    "status": "processed",
    "processed_at": "2026-06-01T15:00:00Z",
    "notes": "Transfer berhasil"
  }
}
```

---

## Disputes

### POST /disputes
Create a dispute for a task.

**Headers:** `Authorization: Bearer <token>` (task customer or buter)

**Request Body:**
```json
{
  "task_id": "number (required)",
  "reason": "string (required)",
  "evidence": "string (optional, file path to evidence)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Dispute created",
  "data": {
    "id": 2,
    "task_id": 1,
    "reported_by": 1,
    "reason": "Barang datang terlambat 15 menit",
    "evidence": "/uploads/evidence_chat.jpg",
    "status": "open",
    "reporter_snapshot": {
      "full_name": "Budi Santoso",
      "phone": "081234567890",
      "role": "customer"
    },
    "chat_history": [],
    "created_at": "2026-06-01T12:00:00Z"
  }
}
```

---

### GET /disputes
List disputes (admin: all, others: own only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` — `open | investigating | resolved | closed`
- `task_id` — filter by task
- `page`, `limit`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "disputes": [ /* dispute objects */ ],
    "pagination": { /* ... */ }
  }
}
```

---

### GET /disputes/:id
Get dispute details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "task_id": 1,
    "reported_by": 1,
    "reason": "Barang datang terlambat 15 menit",
    "evidence": "/uploads/evidence_chat.jpg",
    "resolution": "Sudah diklarifikasi karena macet",
    "status": "resolved",
    "reporter_snapshot": { /* ... */ },
    "chat_history": [
      { "sender": "customer", "message": "Barang telat 15 menit", "time": "2026-06-01T09:05:00Z" },
      { "sender": "admin", "message": "Sudah diklarifikasi karena macet", "time": "2026-06-01T10:00:00Z" }
    ],
    "created_at": "2026-06-01T09:00:00Z",
    "updated_at": "2026-06-01T10:00:00Z"
  }
}
```

---

### PUT /disputes/:id/chat
Send a chat message in dispute mediation.

**Headers:** `Authorization: Bearer <token>` (dispute participant only)

**Request Body:**
```json
{
  "message": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Message sent",
  "data": {
    "chat_history": [
      { "sender": "customer", "message": "Barang telat 15 menit", "time": "2026-06-01T09:05:00Z" },
      { "sender": "admin", "message": "Sudah diklarifikasi", "time": "2026-06-01T10:00:00Z" },
      { "sender": "customer", "message": "Baik, terima kasih", "time": "2026-06-01T10:05:00Z" }
    ]
  }
}
```

---

### PUT /disputes/:id/resolve
Resolve a dispute (admin only).

**Headers:** `Authorization: Bearer <token>` (admin role required)

**Request Body:**
```json
{
  "resolution": "string (required)",
  "status": "resolved | closed (optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Dispute resolved",
  "data": {
    "id": 1,
    "status": "resolved",
    "resolution": "Sudah diklarifikasi karena macet"
  }
}
```

---

### PUT /disputes/:id/status
Update dispute status (admin only).

**Headers:** `Authorization: Bearer <token>` (admin role required)

**Request Body:**
```json
{
  "status": "open | investigating | resolved | closed (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Dispute status updated",
  "data": { /* updated dispute object */ }
}
```

---

## Notifications

### GET /notifications
Get current user's notifications.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `is_read` — `true | false` (optional)
- `type` — notification type (optional)
- `page`, `limit`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "task_completed",
        "title": "Tugas selesai",
        "message": "Tugas belanja Anda telah selesai",
        "related_task_id": 1,
        "related_task_snapshot": {
          "description": "Beli bawang merah",
          "price": 25000
        },
        "is_read": false,
        "created_at": "2026-06-01T09:30:00Z"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

---

### PUT /notifications/:id/read
Mark a notification as read.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": 1,
    "is_read": true
  }
}
```

---

### PUT /notifications/read-all
Mark all notifications as read.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "count": 5
  }
}
```

---

### GET /notifications/unread-count
Get count of unread notifications.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "unread_count": 3
  }
}
```

---

## Admin

### GET /admin/stats
Get platform statistics (admin only).

**Headers:** `Authorization: Bearer <token>` (admin role required)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_users": 7,
    "total_buters": 3,
    "total_customers": 3,
    "total_tasks": 4,
    "pending_tasks": 1,
    "completed_tasks": 2,
    "total_disputes": 1,
    "open_disputes": 0,
    "total_wallets": 3,
    "total_withdrawals": 2
  }
}
```

---

## Common Error Response Format

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

**Common Error Codes:**
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (e.g., email exists) |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Pagination Response Format

All list endpoints return pagination metadata:

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

---

## Authentication

All protected endpoints require:
```
Authorization: Bearer <barrier_token>
```

Barrier token is a random 32-character hex string generated server-side and stored in the user's session.

Token is tied to user_id and role, stored server-side (session/Redis/database).

---

## Role-Based Access Summary

| Endpoint Category | customer | buter | admin |
|-------------------|----------|-------|-------|
| Auth | ✓ | ✓ | ✓ |
| Users (own) | ✓ | ✓ | ✓ |
| Users (public) | ✓ | ✓ | ✓ |
| Buter management | - | ✓ | ✓ |
| Tasks (create) | ✓ | - | ✓ |
| Tasks (browse) | ✓ | ✓ | ✓ |
| Tasks (accept/start/complete) | - | ✓ | - |
| Wallet (own) | - | ✓ | - |
| Withdrawals (create) | - | ✓ | - |
| Withdrawals (process) | - | - | ✓ |
| Disputes (create) | ✓ | ✓ | ✓ |
| Disputes (resolve) | - | - | ✓ |
| Notifications (own) | ✓ | ✓ | ✓ |
| Admin stats | - | - | ✓ |