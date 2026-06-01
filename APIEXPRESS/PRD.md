# MITABUT - Product Requirements Document

## 1. Concept & Vision

**Mitabut** is a peer-to-peer errand and delivery service platform connecting customers who need tasks completed with "buters" (independent delivery runners) who can execute those tasks. The platform handles task matching, real-time tracking, secure payments, and dispute resolution.

**Core Flow**: Customer posts a task (e.g., "Buy 1kg garlic at Senen Market, deliver to my apartment") → Buter accepts → Buter executes → Customer receives → Payment releases → Review submitted.

---

## 2. User Roles

| Role | Description |
|------|-------------|
| **customer** | Posts errand tasks, pays for service, reviews buters |
| **buter** | Executes tasks, earns money, manages wallet withdrawals |
| **admin** | Oversees platform, resolves disputes, manages user verification |

---

## 3. Core Entities

### 3.1 Users Table (`users`)

**Fields:**
- `id`, `full_name`, `email`, `phone`, `password_hash`
- `role` — `customer` | `buter` | `admin`
- `is_verified` — email/phone verification flag

**Buter-specific detail** (`buter_detail` JSON):
- `vehicle_type` — e.g., "Motor" (motorcycle)
- `id_card_photo`, `skck_photo`, `selfie_photo` — verification documents
- `approval_status` — `approved` | `pending`
- `total_earnings`, `total_tasks_completed`

**Stats** (`stats` JSON): `total_tasks`, `total_spent`, `avg_rating`

### 3.2 Tasks Table (`tasks`)

The central entity. **Denormalized** — customer and buter data are embedded as snapshots at task creation time to preserve historical accuracy.

**Task Status Flow:**
```
waiting → taken → on_progress → completed
                        ↓
                   dispute → cancelled
```

**Status meanings:**
| Status | Description |
|--------|-------------|
| `waiting` | Task posted, no buter assigned yet |
| `taken` | Buter accepted, en route to pickup |
| `on_progress` | Buter has picked up item, heading to dropoff |
| `completed` | Task successfully completed |
| `dispute` | Issue raised, under review |
| `cancelled` | Task cancelled |

**Embedded Data:**
- `customer_snapshot` — customer name, phone, email at time of task
- `buter_snapshot` — buter name, phone, vehicle at time of acceptance
- `timeline` — timestamps for each status transition
- `payment` — method (`gopay`, `qris`, `bank_transfer`, `dana`), status, transaction_id, amount
- `review` — rating (1-5), comment
- `tracking_history` — array of `{lat, lng, time, status}` waypoints

### 3.3 Wallets Table (`wallets`)

Buter earnings management. One wallet per buter (`buter_id` is UNIQUE).

- `balance` — available funds
- `pending_balance` — funds not yet cleared
- `transaction_history` — array of `{type, amount, task_id, date, status}`

Transaction types: `earning`, `withdrawal`, `refund`

### 3.4 Withdrawals Table (`withdrawals`)

Buter → bank transfers.

- `amount`, `bank_account`, `bank_name`
- `status` — `pending` | `processed` | `rejected`
- `buter_snapshot` — embedded for historical accuracy
- `requested_at`, `processed_at`, `notes`

### 3.5 Disputes Table (`disputes`)

Formal complaints on tasks.

- `reason` — text description
- `evidence` — file path to supporting media
- `resolution` — admin's resolution notes
- `status` — `open` | `investigating` | `resolved` | `closed`
- `chat_history` — array of `{sender, message, time}` for mediation chat

### 3.6 Notifications Table (`notifications`)

User-facing alerts.

- `type` — e.g., `task_completed`, `payment_received`, `dispute_update`
- `title`, `message`
- `related_task_id` with `related_task_snapshot`
- `is_read` flag

---

## 4. Architecture Notes

### 4.1 Denormalization Strategy

This database uses **denormalization** as a performance and historical accuracy choice:
- When a task is created/accepted, the current user data is snapshotted into the task record
- If a user changes their phone or name later, past tasks still reflect the correct information
- No foreign key constraints — IDs are stored as references only
- JSON columns hold semi-structured data that changes frequently or doesn't need querying

### 4.2 JSON Column Usage

| Column | Data Type | Purpose |
|--------|-----------|---------|
| `buter_detail` | JSON | Variable buter verification data |
| `stats` | JSON | User statistics that evolve over time |
| `customer_snapshot` | JSON | Frozen copy of customer at task time |
| `buter_snapshot` | JSON | Frozen copy of buter at task time |
| `timeline` | JSON | Status transition timestamps |
| `payment` | JSON | Payment method and transaction details |
| `review` | JSON | Rating and feedback |
| `tracking_history` | JSON | GPS waypoint array |
| `transaction_history` | JSON | Wallet transaction ledger |
| `chat_history` | JSON | Dispute mediation messages |

### 4.3 Indexing

Indexes are applied on:
- All foreign key columns (`customer_id`, `buter_id`, `user_id`, `task_id`)
- `status` columns for filtering
- `created_at` for chronological queries
- `balance` for sorting/filtering wallets

---

## 5. Seed Data Domains

### 5.1 Users
- 7 users across all roles
- 3 buters (2 approved, 1 pending)
- 3 customers
- 1 admin
- Phone format: Indonesian format (`0812...`)

### 5.2 Task Examples
- Market errands (buy groceries)
- Document delivery (STNK)
- Bill payment (electricity, internet)
- Price range: Rp15,000 – Rp50,000

### 5.3 Payment Methods Observed
- `gopay` — e-wallet
- `qris` — QR code payment
- `bank_transfer` — direct bank transfer
- `dana` — e-wallet

### 5.4 Vehicle Types
- `Motor` — motorcycle (the only type in seed)

---

## 6. Implementation Priorities

1. **Authentication & Users** — Register, login, role-based access
2. **Task Lifecycle** — Create → Browse → Accept → Complete
3. **Real-time Tracking** — GPS waypoint recording, status updates
4. **Wallet System** — Balance tracking, earnings, withdrawals
5. **Notifications** — Event-driven alerts for task/status changes
6. **Disputes** — Filing, chat-based mediation, resolution

---

## 7. Technology Stack

- **Database**: MySQL (non-relational/denormalized approach)
- **Backend**: Express.js (inferred from project name "express" in path)
- **API**: RESTful JSON endpoints