# Mitabut API - User Credentials

## Overview

Mitabut has 3 user roles with different access levels:

| Role | Description | Access Level |
|------|-------------|--------------|
| **customer** | Posts errand tasks, pays for service, reviews buters | Basic |
| **buter** | Executes tasks, earns money, manages wallet withdrawals | Medium |
| **admin** | Oversees platform, resolves disputes, manages user verification | Full |

---

## Test Credentials

### 1. Customer Account
```
Email:    ahmad@customer.com
Password: password123
Role:     customer
```

**Capabilities:**
- Register & login
- Create tasks
- Browse all tasks
- Accept/cancel own tasks
- Submit reviews
- View own profile & notifications

---

### 2. Buter Account
```
Email:    diana@buter.com
Password: password123
Role:     buter
Status:   approved
Vehicle:  Motor
```

**Capabilities:**
- All customer capabilities
- Browse & accept waiting tasks
- Start/execute tasks
- Add GPS tracking points
- Complete tasks (triggers payment)
- View & manage wallet
- Request withdrawals

---

### 3. Admin Account
```
Email:    admin@mitabut.com
Password: password123
Role:     admin
```

**Capabilities:**
- All buter capabilities
- Approve/reject buter registrations
- View all withdrawals & process them
- View all disputes
- Resolve disputes
- Update dispute status
- View platform statistics (`GET /api/v1/admin/stats`)

---

## Login Example

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmad@customer.com","password":"password123"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "full_name": "Ahmad Rizki",
      "email": "ahmad@customer.com",
      "role": "customer",
      "is_verified": true
    }
  }
}
```

---

## Using the Token

Include the token in the `Authorization` header for protected endpoints:

```
Authorization: Bearer <your_token_here>
```

Example:
```bash
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

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

## Setup

1. Create database: `mysql -u root -p < skemadebe.sql`
2. Seed users: `npm run seed`
3. Start server: `npm start`
4. Base URL: `http://localhost:3000/api/v1`