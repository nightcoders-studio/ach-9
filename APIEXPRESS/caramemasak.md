# Mitabut API Documentation

**Base URL:** `https://mitabut.biocircular.id/api/v1`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Buters](#buters)
4. [Tasks](#tasks)
5. [Wallets](#wallets)
6. [Withdrawals](#withdrawals)
7. [Disputes](#disputes)
8. [Notifications](#notifications)
9. [Admin](#admin)

---

## Authentication

### Register User
```
POST /auth/register
```

**Request:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "081234567890",
  "password": "password123",
  "role": "customer"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| full_name | string | Yes | Max 100 chars |
| email | string | Yes | Unique |
| phone | string | Yes | Max 15 chars, unique |
| password | string | Yes | Min 6 chars |
| role | string | Yes | `customer` or `buter` |

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 8,
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "081234567890",
    "role": "customer",
    "is_verified": false,
    "buter_detail": null,
    "stats": null,
    "created_at": "2026-06-01T12:00:00Z"
  }
}
```

**Errors:**
- `400` - Missing required fields
- `409` - Email or phone already exists

---

### Login
```
POST /auth/login
```

**Request:**
```json
{
  "email": "ahmad@customer.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 8,
      "full_name": "Ahmad Rizki",
      "email": "ahmad@customer.com",
      "role": "customer",
      "is_verified": true
    }
  }
}
```

---

## Users

### Get My Profile
```
GET /users/me
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 8,
    "full_name": "Ahmad Rizki",
    "email": "ahmad@customer.com",
    "phone": "081311111111",
    "role": "customer",
    "is_verified": true,
    "buter_detail": null,
    "stats": {
      "total_tasks": 1,
      "total_spent": 25000,
      "avg_rating": 5
    },
    "created_at": "2026-01-15T08:00:00Z"
  }
}
```

---

### Update Profile
```
PUT /users/me
Headers: Authorization: Bearer <token>
```

**Request:**
```json
{
  "full_name": "Ahmad Rizki Updated",
  "phone": "081311111112"
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

### Change Password
```
PUT /users/me/password
Headers: Authorization: Bearer <token>
```

**Request:**
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword123"
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

### Get Public Profile
```
GET /users/:id
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 9,
    "full_name": "Diana Putri",
    "role": "buter",
    "is_verified": true,
    "buter_detail": {
      "vehicle_type": "Motor",
      "approval_status": "approved",
      "total_earnings": 25000,
      "total_tasks_completed": 1
    },
    "stats": {
      "total_tasks": 1,
      "avg_rating": 0
    }
  }
}
```

---

## Buters

### Register as Buter
```
POST /buters/register
Headers: Authorization: Bearer <token> (must be buter role)
```

**Request:**
```json
{
  "vehicle_type": "Motor",
  "id_card_photo": "/uploads/ktp.jpg",
  "skck_photo": "/uploads/skck.jpg",
  "selfie_photo": "/uploads/selfie.jpg"
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
      "id_card_photo": "/uploads/ktp.jpg",
      "skck_photo": "/uploads/skck.jpg",
      "selfie_photo": "/uploads/selfie.jpg",
      "approval_status": "pending",
      "total_earnings": 0,
      "total_tasks_completed": 0
    }
  }
}
```

---

### Approve/Reject Buter (Admin Only)
```
PUT /buters/:id/approve
Headers: Authorization: Bearer <token> (admin only)
```

**Request:**
```json
{
  "status": "approved",
  "notes": "Dokumen lengkap dan valid"
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

### List Buters
```
GET /buters
Headers: Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | int | 1 | Page number |
| limit | int | 10 | Items per page |
| vehicle_type | string | - | Filter by vehicle |
| sort_by | string | avg_rating | Sort field |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "buters": [
      {
        "id": 9,
        "full_name": "Diana Putri",
        "buter_detail": {
          "vehicle_type": "Motor",
          "approval_status": "approved",
          "total_tasks_completed": 1
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

### Create Task (Customer Only)
```
POST /tasks
Headers: Authorization: Bearer <token> (customer only)
```

**Request:**
```json
{
  "description": "Beli kopi di Starbucks Grand Indonesia",
  "pickup_location": "Starbucks Grand Indonesia, Jakarta",
  "dropoff_location": "Apartemen Sudirman Tower, Jakarta",
  "price": 25000,
  "payment_method": "gopay"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| description | string | Yes | Task description |
| pickup_location | string | Yes | Where buter picks up |
| dropoff_location | string | Yes | Delivery destination |
| price | number | Yes | Task price |
| payment_method | string | Yes | `gopay`, `qris`, `bank_transfer`, `dana` |

**Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 5,
    "customer_id": 8,
    "buter_id": null,
    "description": "Beli kopi di Starbucks Grand Indonesia",
    "pickup_location": "Starbucks Grand Indonesia, Jakarta",
    "dropoff_location": "Apartemen Sudirman Tower, Jakarta",
    "price": "25000.00",
    "status": "waiting",
    "customer_snapshot": {
      "full_name": "Ahmad Rizki",
      "phone": "081311111111",
      "email": "ahmad@customer.com"
    },
    "timeline": {
      "created_at": "2026-06-01T12:00:00Z"
    },
    "payment": {
      "method": "gopay",
      "status": "pending",
      "amount": 25000
    }
  }
}
```

---

### List Tasks
```
GET /tasks
Headers: Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | Filter by status |
| customer_id | int | Filter by customer |
| buter_id | int | Filter by buter |
| min_price | number | Minimum price |
| max_price | number | Maximum price |
| page | int | Page number (default: 1) |
| limit | int | Items per page (default: 10) |
| sort_by | string | `created_at` or `price` |
| sort_order | string | `asc` or `desc` |

---

### List Waiting Tasks
```
GET /tasks/waiting
Headers: Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| min_price | number | Minimum price |
| max_price | number | Maximum price |
| page | int | Page number |
| limit | int | Items per page |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": 2,
        "description": "Ambil STNK di Samsat",
        "pickup_location": "Samsat Jakarta Selatan",
        "dropoff_location": "Jl. Fatmawati No. 10",
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

### Get Task Details
```
GET /tasks/:id
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "customer_id": 8,
    "buter_id": 9,
    "description": "Beli kopi di Starbucks Grand Indonesia",
    "pickup_location": "Starbucks Grand Indonesia",
    "dropoff_location": "Apartemen Sudirman Tower",
    "price": "25000.00",
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
      "comment": "Kopi enak, sampai cepat!",
      "created_at": "2026-06-01T09:30:00Z"
    },
    "tracking_history": [
      { "lat": -6.1754, "lng": 106.8456, "time": "2026-06-01T08:10:00Z", "status": "menuju lokasi" }
    ]
  }
}
```

---

### Accept Task (Buter Only)
```
POST /tasks/:id/accept
Headers: Authorization: Bearer <token> (buter only)
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task accepted successfully",
  "data": {
    "id": 5,
    "status": "taken",
    "buter_id": 9,
    "buter_snapshot": {
      "full_name": "Diana Putri",
      "phone": "081322222222",
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
- `400` - Task not in waiting status
- `409` - Task already taken

---

### Start Task (Buter Only)
```
PUT /tasks/:id/start
Headers: Authorization: Bearer <token> (assigned buter only)
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task started",
  "data": {
    "id": 5,
    "status": "on_progress",
    "timeline": {
      "started_at": "2026-06-01T10:10:00Z"
    }
  }
}
```

---

### Complete Task (Buter Only)
```
PUT /tasks/:id/complete
Headers: Authorization: Bearer <token> (assigned buter only)
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task completed successfully",
  "data": {
    "id": 5,
    "status": "completed",
    "timeline": {
      "completed_at": "2026-06-01T11:00:00Z"
    }
  }
}
```

---

### Cancel Task
```
PUT /tasks/:id/cancel
Headers: Authorization: Bearer <token> (customer or admin)
```

**Request:**
```json
{
  "reason": "Tidak jadi"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task cancelled",
  "data": {
    "id": 5,
    "status": "cancelled"
  }
}
```

---

### Submit Review (Customer Only)
```
POST /tasks/:id/review
Headers: Authorization: Bearer <token> (customer only)
```

**Request:**
```json
{
  "rating": 5,
  "comment": "Kopi nya enak, sampai dengan cepat!"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rating | int | Yes | 1-5 |
| comment | string | No | Max 500 chars |

**Response (200):**
```json
{
  "success": true,
  "message": "Review submitted",
  "data": {
    "id": 5,
    "review": {
      "rating": 5,
      "comment": "Kopi nya enak, sampai dengan cepat!",
      "created_at": "2026-06-01T12:00:00Z"
    }
  }
}
```

---

### Add Tracking Point (Buter Only)
```
POST /tasks/:id/tracking
Headers: Authorization: Bearer <token> (assigned buter only)
```

**Request:**
```json
{
  "lat": -6.1754,
  "lng": 106.8456,
  "status": "menuju lokasi"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Tracking point added",
  "data": {
    "tracking_history": [
      { "lat": -6.1754, "lng": 106.8456, "time": "2026-06-01T08:10:00Z", "status": "menuju lokasi" }
    ]
  }
}
```

---

### Get Tracking History
```
GET /tasks/:id/tracking
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tracking_history": [
      { "lat": -6.1754, "lng": 106.8456, "time": "2026-06-01T08:10:00Z", "status": "menuju lokasi" },
      { "lat": -6.1854, "lng": 106.8556, "time": "2026-06-01T08:30:00Z", "status": "di pasar" }
    ]
  }
}
```

---

## Wallets

### Get My Wallet (Buter Only)
```
GET /wallets/me
Headers: Authorization: Bearer <token> (buter only)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "buter_id": 9,
    "balance": "25000.00",
    "pending_balance": "0.00",
    "transaction_history": [
      { "type": "earning", "amount": 25000, "task_id": 5, "date": "2026-06-01T12:06:53Z" }
    ]
  }
}
```

---

### Get Transactions
```
GET /wallets/me/transactions
Headers: Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| type | string | `earning`, `withdrawal`, `refund` |
| page | int | Page number |
| limit | int | Items per page |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      { "type": "earning", "amount": 25000, "task_id": 5, "date": "2026-06-01T12:06:53Z" }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 1, "total_pages": 1 }
  }
}
```

---

## Withdrawals

### Request Withdrawal (Buter Only)
```
POST /withdrawals
Headers: Authorization: Bearer <token> (buter only)
```

**Request:**
```json
{
  "amount": 10000,
  "bank_account": "9876543210",
  "bank_name": "BCA"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Withdrawal requested successfully",
  "data": {
    "id": 3,
    "buter_id": 9,
    "amount": "10000.00",
    "bank_account": "9876543210",
    "bank_name": "BCA",
    "status": "pending",
    "buter_snapshot": {
      "full_name": "Diana Putri",
      "phone": "081322222222",
      "email": "diana@buter.com"
    },
    "requested_at": "2026-06-01T14:00:00Z"
  }
}
```

**Errors:**
- `400` - Insufficient balance
- `400` - Invalid amount

---

### List Withdrawals
```
GET /withdrawals
Headers: Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | `pending`, `processed`, `rejected` |
| buter_id | int | Filter by buter (admin only) |
| page | int | Page number |
| limit | int | Items per page |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "withdrawals": [ /* withdrawal objects */ ],
    "pagination": { "page": 1, "limit": 10, "total": 2, "total_pages": 1 }
  }
}
```

---

### Process Withdrawal (Admin Only)
```
PUT /withdrawals/:id/process
Headers: Authorization: Bearer <token> (admin only)
```

**Request:**
```json
{
  "status": "processed",
  "notes": "Transfer berhasil"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Withdrawal processed",
  "data": {
    "id": 3,
    "status": "processed",
    "processed_at": "2026-06-01T15:00:00Z",
    "notes": "Transfer berhasil"
  }
}
```

---

## Disputes

### Create Dispute
```
POST /disputes
Headers: Authorization: Bearer <token>
```

**Request:**
```json
{
  "task_id": 1,
  "reason": "Barang tidak sesuai pesanan",
  "evidence": "/uploads/evidence.jpg"
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
    "reported_by": 8,
    "reason": "Barang tidak sesuai pesanan",
    "evidence": "/uploads/evidence.jpg",
    "status": "open",
    "reporter_snapshot": {
      "full_name": "Ahmad Rizki",
      "phone": "081311111111",
      "role": "customer"
    },
    "chat_history": [],
    "created_at": "2026-06-01T12:00:00Z"
  }
}
```

---

### List Disputes
```
GET /disputes
Headers: Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | `open`, `investigating`, `resolved`, `closed` |
| task_id | int | Filter by task |
| page | int | Page number |
| limit | int | Items per page |

---

### Get Dispute Details
```
GET /disputes/:id
Headers: Authorization: Bearer <token>
```

---

### Send Chat Message
```
PUT /disputes/:id/chat
Headers: Authorization: Bearer <token>
```

**Request:**
```json
{
  "message": "Saya sudah bicara dengan buter"
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
      { "sender": "customer", "message": "Saya sudah bicara dengan buter", "time": "2026-06-01T10:05:00Z" }
    ]
  }
}
```

---

### Resolve Dispute (Admin Only)
```
PUT /disputes/:id/resolve
Headers: Authorization: Bearer <token> (admin only)
```

**Request:**
```json
{
  "resolution": "Sudah diklarifikasi karena macet",
  "status": "resolved"
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

### Update Dispute Status (Admin Only)
```
PUT /disputes/:id/status
Headers: Authorization: Bearer <token> (admin only)
```

**Request:**
```json
{
  "status": "investigating"
}
```

---

## Notifications

### List Notifications
```
GET /notifications
Headers: Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| is_read | boolean | Filter by read status |
| type | string | Filter by type |
| page | int | Page number |
| limit | int | Items per page |

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
        "related_task_id": 5,
        "related_task_snapshot": {
          "description": "Beli kopi di Starbucks",
          "price": 25000
        },
        "is_read": false,
        "created_at": "2026-06-01T09:30:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 1, "total_pages": 1 }
  }
}
```

---

### Get Unread Count
```
GET /notifications/unread-count
Headers: Authorization: Bearer <token>
```

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

### Mark as Read
```
PUT /notifications/:id/read
Headers: Authorization: Bearer <token>
```

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

### Mark All as Read
```
PUT /notifications/read-all
Headers: Authorization: Bearer <token>
```

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

## Admin

### Get Platform Statistics (Admin Only)
```
GET /admin/stats
Headers: Authorization: Bearer <token> (admin only)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_users": 7,
    "total_buters": 3,
    "total_customers": 3,
    "total_tasks": 5,
    "pending_tasks": 1,
    "completed_tasks": 2,
    "total_disputes": 2,
    "open_disputes": 1,
    "total_wallets": 3,
    "total_withdrawals": 3
  }
}
```

---

## Error Response Format

All errors return this format:

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
| `CONFLICT` | 409 | Resource conflict |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Role-Based Access Summary

| Endpoint Category | customer | buter | admin |
|-------------------|:--------:|:-----:|:-----:|
| Auth (register/login) | ✅ | ✅ | ✅ |
| Users (own profile) | ✅ | ✅ | ✅ |
| Users (public) | ✅ | ✅ | ✅ |
| Buter management | - | ✅ | ✅ |
| Tasks (create) | ✅ | - | ✅ |
| Tasks (browse) | ✅ | ✅ | ✅ |
| Tasks (accept/start/complete) | - | ✅ | - |
| Wallet (own) | - | ✅ | - |
| Withdrawals (create) | - | ✅ | - |
| Withdrawals (process) | - | - | ✅ |
| Disputes (create) | ✅ | ✅ | ✅ |
| Disputes (resolve) | - | - | ✅ |
| Notifications (own) | ✅ | ✅ | ✅ |
| Admin stats | - | - | ✅ |

---

## Task Status Flow

```
waiting → taken → on_progress → completed
                        ↓
                   dispute → cancelled
```

| Status | Description |
|--------|-------------|
| `waiting` | Task posted, no buter assigned |
| `taken` | Buter accepted, en route to pickup |
| `on_progress` | Buter picked up, heading to dropoff |
| `completed` | Task successfully completed |
| `dispute` | Issue raised, under review |
| `cancelled` | Task cancelled |

---

## Payment Methods

- `gopay` - GoPay e-wallet
- `qris` - QR code payment
- `bank_transfer` - Direct bank transfer
- `dana` - DANA e-wallet

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Customer | ahmad@customer.com | password123 |
| Buter | diana@buter.com | password123 |
| Admin | admin@mitabut.com | password123 |