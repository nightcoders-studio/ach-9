# TaskHub - Quick Start Guide

## 🚀 Get Running in 2 Minutes

### Step 1: Setup Database
```bash
cd c:\Users\Gwirjayan\Desktop\mitabut
npx prisma db push
npx prisma generate
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open Application
Visit: **http://localhost:3000**

---

## 📋 First Time Usage

### Create Your Account
1. Click **"Login / Sign Up"** button
2. Enter your **email** and **name**
3. Click **"Login / Sign Up"**
4. You're logged in! ✅

### Try as Task Creator
1. Go to **Dashboard** or click **"Post a Task"**
2. Fill in task details:
   - Title: "Build a logo"
   - Description: "Modern logo design"
   - Budget: $100-500
   - Category: Design
3. Click **"Create Task"**
4. View your task and wait for bids

### Try as Worker
1. Go to **"Browse Tasks"**
2. Find an interesting task
3. Click on it and scroll to **"Place a Bid"** section
4. Enter your bid price (within budget range)
5. Add a message about why you're a good fit
6. Click **"Place Bid"**
7. You can now see it in **Dashboard** under "My Bids"

### Accept a Bid (as Task Creator)
1. View your posted task
2. Scroll to **"Bids"** section
3. Click **"Accept Bid"** on your preferred bid
4. Task is now **ASSIGNED**
5. Chat with the worker

### Message a Worker
1. Go to **Messages** in navbar
2. Select a conversation
3. Type and send messages
4. See real-time chat updates

### View/Edit Profile
1. Click on a username or go to **Settings**
2. Update name, phone, or avatar
3. Click **"Save Changes"**

---

## 🎯 Complete User Journey (5 minutes)

### As Client:
1. ✅ Login
2. ✅ Create a task
3. ✅ Browse your posted task
4. ✅ See incoming bids
5. ✅ Accept a bid
6. ✅ Message with worker
7. ✅ View worker profile

### As Worker:
1. ✅ Login (new account)
2. ✅ Browse available tasks
3. ✅ View task details
4. ✅ Place a bid
5. ✅ See bid in dashboard
6. ✅ Wait for acceptance
7. ✅ Chat with client

---

## 📱 Main Navigation

### Top Navbar (Always Available)
- **TaskHub** Logo (home link)
- **Browse Tasks** - View all tasks
- **Dashboard** - Your overview
- **Messages** - Chat center (if logged in)
- **Your Name** - Profile link
- **Logout** - Exit session

---

## 🎨 Available Categories

When creating a task, choose from:
- Design
- Development
- Writing
- Marketing
- Business
- Other

(Add more in database as needed)

---

## 💡 Pro Tips

### For Task Creators
- ✅ Post clear, detailed descriptions
- ✅ Set reasonable budgets
- ✅ Respond quickly to bids
- ✅ Leave honest reviews after completion

### For Workers
- ✅ Bid competitively but fairly
- ✅ Include a message with your bid
- ✅ Communicate clearly
- ✅ Deliver quality work on time

---

## 🔗 Useful Links

| Link | Purpose |
|------|---------|
| http://localhost:3000 | Home page |
| http://localhost:3000/login | Login/Signup |
| http://localhost:3000/tasks | Browse all tasks |
| http://localhost:3000/tasks/create | Create new task |
| http://localhost:3000/dashboard | Your dashboard |
| http://localhost:3000/chats | Messages |
| http://localhost:3000/settings | Account settings |

---

## 🐛 Troubleshooting

**Problem**: Page shows "Unauthorized"
**Solution**: Make sure you're logged in. Visit `/login` first.

**Problem**: Tasks not appearing
**Solution**: Refresh the page. Check browser console for errors.

**Problem**: Can't place bid
**Solution**: Make sure you're logged in and the task is still OPEN status.

**Problem**: Changes not saved
**Solution**: Check your internet connection. Try again.

---

## 🎓 Feature Overview

### ✅ Fully Implemented
- User accounts and profiles
- Task creation and management
- Bidding system
- Direct messaging
- Rating system
- Task status tracking
- Category filtering
- Responsive design

### 🚀 Ready to Extend
- Payment integration
- Email notifications
- File uploads
- Advanced search
- Admin dashboard
- Mobile app

---

## 📊 Database Info

- **Database**: SQLite (stored locally)
- **Location**: `c:\Users\Gwirjayan\Desktop\mitabut`
- **File**: `prisma/dev.db` (created after first run)

To reset database:
```bash
npx prisma db push --force-reset
```

---

## 🤝 Support

For questions or issues:
1. Check the database is running: `npx prisma db push`
2. Restart dev server: Stop and run `npm run dev`
3. Clear browser cache: Ctrl+Shift+Delete
4. Check console for errors: F12 → Console tab

---

## ✨ What's Next?

After you're comfortable with the app:

1. **Add sample categories**: See `/api/categories` docs
2. **Add sample tasks**: Create via UI or database
3. **Test all workflows**: Login as different users
4. **Customize design**: Edit Tailwind classes
5. **Add features**: Payment, notifications, etc.

---

**Start building your marketplace today! 🚀**
