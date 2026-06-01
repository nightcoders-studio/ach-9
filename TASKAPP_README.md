# TaskHub - Task Marketplace Platform

A full-stack task marketplace application built with Next.js, Prisma, and SQLite. Connect clients with skilled workers, post tasks, place bids, and build your professional reputation.

## Features

### 🎯 Core Features
- **User Authentication**: Simple email-based login/signup
- **Task Management**: Create, browse, and manage tasks
- **Bidding System**: Workers can bid on tasks with custom prices
- **Task Assignment**: Task owners accept bids and assign work
- **Direct Messaging**: Real-time chat between clients and workers
- **Rating System**: Build reputation through reviews
- **Profile Management**: Manage user profiles with ratings

### 📱 Pages

#### Authentication
- **`/login`** - Login/Sign up page
- **`/logout`** - Logout action

#### Task Management
- **`/`** - Home/landing page
- **`/tasks`** - Browse all tasks with filtering
- **`/tasks/create`** - Create a new task
- **`/tasks/[id]`** - View task details and manage bids

#### User Features
- **`/dashboard`** - User dashboard with overview
- **`/profile/[id]`** - View user profile and reviews
- **`/settings`** - Account settings
- **`/my-work`** - View assigned tasks
- **`/chats`** - Message center

## Project Structure

```
app/
├── api/                  # API routes
│   ├── auth/            # Authentication endpoints
│   ├── tasks/           # Task CRUD operations
│   ├── bids/            # Bid management
│   ├── categories/      # Task categories
│   ├── chats/           # Chat and messaging
│   ├── users/           # User profiles
│   ├── reviews/         # Rating and review system
│   └── proofs/          # Work proof uploads
├── components/          # Reusable components
│   └── Navbar.tsx       # Navigation component
├── (page routes)
│   ├── page.tsx         # Home page
│   ├── login/           # Auth pages
│   ├── dashboard/       # Dashboard
│   ├── tasks/           # Task pages
│   ├── profile/         # Profile pages
│   ├── settings/        # Settings
│   ├── chats/           # Messaging
│   └── my-work/         # Work assignments
├── globals.css          # Global styles
└── layout.tsx           # Root layout

prisma/
├── schema.prisma        # Database schema
└── migrations/          # Database migrations

public/                  # Static assets
```

## Database Schema

### Core Models

**User**
- Unique user profile with ratings and verification
- Tracks created tasks, bids, and reviews

**Task**
- Posted by users with budget range and deadline
- Status: OPEN → ASSIGNED → COMPLETED
- Supports categories and location

**Bid**
- Workers submit bids on tasks
- Status: PENDING → ACCEPTED/REJECTED

**TaskAssignment**
- Tracks which worker is assigned to a task
- Includes completion date

**Category**
- Task categories for filtering

**Chat & Message**
- Direct messaging between clients and workers
- Message types: TEXT, IMAGE, LOCATION

**Review**
- Rating system (1-5 stars)
- Reviews given and received

**TaskProof**
- Workers upload proof of completed work

## API Endpoints

### Authentication
- `POST /api/auth` - Login/Signup
- `GET /api/auth` - Get current user

### Tasks
- `GET /api/tasks` - List tasks (filterable)
- `POST /api/tasks` - Create task
- `GET /api/tasks/[id]` - Get task details
- `PUT /api/tasks/[id]` - Update task

### Bids
- `GET /api/bids` - List bids
- `POST /api/bids` - Create bid
- `PUT /api/bids/[id]` - Accept/reject bid

### Chats & Messages
- `GET /api/chats` - List user's chats
- `POST /api/chats` - Create/get chat
- `GET /api/chats/[id]/messages` - Get messages
- `POST /api/chats/[id]/messages` - Send message

### Users
- `GET /api/users/[id]` - Get user profile
- `PUT /api/users/[id]` - Update profile

### Reviews
- `GET /api/reviews` - List reviews
- `POST /api/reviews` - Create review

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category

## Getting Started

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Set up database**
```bash
npx prisma db push
npx prisma generate
```

3. **Run development server**
```bash
npm run dev
```

4. **Open browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Account
- Email: `user@example.com`
- The app uses localStorage for session management

## Usage Flow

### For Task Creators
1. **Sign up/Login** at `/login`
2. **Create a task** at `/tasks/create` with budget and description
3. **Review bids** on the task detail page
4. **Accept a bid** to assign work to a worker
5. **Chat with worker** to discuss details
6. **Review worker** after task completion

### For Workers
1. **Sign up/Login** at `/login`
2. **Browse tasks** at `/tasks`
3. **Place a bid** on tasks you're interested in
4. **Chat with client** to clarify details
5. **Complete assigned work** from `/my-work`
6. **Upload proof** of completion

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **API**: Next.js API Routes
- **Storage**: localStorage for sessions

## Features

✅ Complete user authentication system
✅ Task posting and management
✅ Bidding system with acceptance
✅ Real-time messaging
✅ User profiles with ratings
✅ Review and rating system
✅ Category filtering
✅ Responsive design
✅ Role-based access (client vs worker)

## Future Enhancements

- [ ] Wallet and payment integration
- [ ] Payment gateway (Stripe, PayPal)
- [ ] Admin dashboard
- [ ] Advanced search and filters
- [ ] Notification system
- [ ] Task disputes and resolution
- [ ] Portfolio/work samples
- [ ] Skill endorsements
- [ ] Task analytics
- [ ] Mobile app

## Development Notes

### Adding New Features
1. Update Prisma schema if needed: `prisma/schema.prisma`
2. Run `npx prisma db push`
3. Create API route in `app/api/`
4. Create or update React component/page
5. Test thoroughly

### Database Queries
All database operations use Prisma ORM. Examples:
```typescript
// Create
await prisma.task.create({ data: {...} })

// Read
await prisma.task.findUnique({ where: { id } })

// Update
await prisma.task.update({ where: { id }, data: {...} })

// Delete
await prisma.task.delete({ where: { id } })
```

### Authentication
Uses localStorage to store `userId` and user object. Add to headers:
```typescript
headers: {
  'x-user-id': userId
}
```

## Troubleshooting

**Database issues?**
```bash
npx prisma db push --force-reset
npx prisma generate
```

**Port already in use?**
```bash
npm run dev -- -p 3001
```

**Clear cache:**
```bash
rm -rf .next
npm run dev
```

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please contact the development team or create an issue in the repository.

---

**Made with ❤️ for the TaskHub community**
