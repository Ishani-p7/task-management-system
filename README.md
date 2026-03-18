# TaskFlow — Task Management System

A full-stack task management system built with **Node.js + TypeScript** (backend) and **Next.js + TypeScript** (frontend). Track A submission.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT (Access + Refresh tokens), bcrypt |
| Frontend | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios (with auto-refresh interceptor) |

---

## Project Structure

```
taskmanager/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # DB schema (User, Task, RefreshToken)
│   └── src/
│       ├── index.ts               # Express app entry point
│       ├── lib/
│       │   ├── prisma.ts          # Prisma client singleton
│       │   └── jwt.ts             # JWT utilities
│       ├── middleware/
│       │   ├── auth.middleware.ts # JWT authentication guard
│       │   ├── error.middleware.ts
│       │   ├── notFound.middleware.ts
│       │   └── validate.middleware.ts
│       ├── controllers/
│       │   ├── auth.controller.ts
│       │   └── tasks.controller.ts
│       ├── services/
│       │   ├── auth.service.ts    # Register, login, refresh, logout
│       │   └── task.service.ts    # CRUD + toggle + stats + pagination
│       ├── routes/
│       │   ├── auth.routes.ts     # /auth/*
│       │   └── tasks.routes.ts    # /tasks/*
│       └── utils/
│           ├── errors.ts          # Custom error classes
│           ├── response.utils.ts  # Standardised API responses
│           └── date.utils.ts
│
└── frontend/
    └── src/
        ├── app/
        │   ├── layout.tsx         # Root layout with providers
        │   ├── page.tsx           # Root redirect
        │   ├── globals.css
        │   ├── (auth)/
        │   │   ├── login/page.tsx
        │   │   └── register/page.tsx
        │   └── (dashboard)/
        │       ├── layout.tsx     # Sidebar + auth guard
        │       └── dashboard/page.tsx
        ├── components/
        │   ├── dashboard/
        │   │   ├── StatsCards.tsx
        │   │   ├── TaskFiltersBar.tsx
        │   │   └── TaskList.tsx
        │   └── tasks/
        │       ├── TaskCard.tsx
        │       ├── TaskModal.tsx  # Create & edit
        │       └── DeleteConfirmModal.tsx
        ├── context/
        │   └── AuthContext.tsx    # Auth state + session restore
        ├── lib/
        │   ├── api.ts             # Axios instance + auto-refresh interceptor
        │   ├── auth.api.ts
        │   ├── tasks.api.ts
        │   └── utils.ts
        └── types/
            └── index.ts           # Shared TypeScript types
```

---

## Setup & Running

### Prerequisites
- Node.js 18+
- npm or yarn

---

### Backend

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env if needed (defaults work for local dev)

# 3. Set up the database
npx prisma generate
npx prisma db push

# 4. Start development server
npm run dev
# → Server running at http://localhost:4000
```

---

### Frontend

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Set up environment variables
# .env.local already exists with NEXT_PUBLIC_API_URL=http://localhost:4000

# 3. Start development server
npm run dev
# → App running at http://localhost:3000
```

---

## API Endpoints

### Auth — `/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login, returns access token + sets refresh cookie |
| POST | `/auth/refresh` | ❌ | Refresh access token using HttpOnly cookie |
| POST | `/auth/logout` | ✅ | Revoke refresh token |
| GET | `/auth/me` | ✅ | Get current user |

### Tasks — `/tasks`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/tasks` | ✅ | List tasks (paginated, filtered, searchable) |
| POST | `/tasks` | ✅ | Create a task |
| GET | `/tasks/stats` | ✅ | Get task counts by status |
| GET | `/tasks/:id` | ✅ | Get a single task |
| PATCH | `/tasks/:id` | ✅ | Update a task |
| DELETE | `/tasks/:id` | ✅ | Delete a task |
| POST | `/tasks/:id/toggle` | ✅ | Cycle status: PENDING → IN_PROGRESS → COMPLETED → PENDING |

### GET /tasks query parameters

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 50) |
| `status` | string | Filter by `PENDING`, `IN_PROGRESS`, `COMPLETED` |
| `priority` | string | Filter by `LOW`, `MEDIUM`, `HIGH` |
| `search` | string | Search by title or description |
| `sortBy` | string | `createdAt`, `updatedAt`, `dueDate`, `title`, `priority` |
| `sortOrder` | string | `asc` or `desc` |

---

## Security Design

- **Passwords** hashed with bcrypt (12 salt rounds)
- **Access tokens**: Short-lived JWT (15 min), verified on every protected route
- **Refresh tokens**: UUID stored in DB, set as `HttpOnly; Secure; SameSite=Strict` cookie — not accessible to JavaScript
- **Token rotation**: On every refresh, old token is revoked and a new one is issued (prevents replay attacks)
- **Rate limiting**: 100 req/15min globally; 10 req/15min on auth routes
- **Helmet**: Sets secure HTTP headers
- **Input validation**: `express-validator` on all endpoints with structured error responses
- **Ownership checks**: Every task mutation verifies the task belongs to the requesting user
- **User enumeration prevention**: Login returns the same error for wrong email and wrong password

---

## Frontend Features

- ✅ Login & Register with full client-side + server-side validation
- ✅ Persistent sessions via refresh token (auto-restored on page reload)
- ✅ Auto token refresh via Axios interceptor — seamless UX
- ✅ Dashboard with live stats (total / pending / in-progress / completed)
- ✅ Task list with pagination (smart page range display)
- ✅ Search with 400ms debounce
- ✅ Filter by status and priority
- ✅ Sort by any field, ascending or descending
- ✅ Create / Edit tasks via modal (pre-filled when editing)
- ✅ Toggle task status with one click (cycles through all states)
- ✅ Delete with confirmation dialog
- ✅ Toast notifications for all actions
- ✅ Overdue task highlighting
- ✅ Responsive layout (sidebar collapses on mobile)
- ✅ Loading skeletons while fetching
- ✅ Empty states with contextual actions

---

## Production Deployment Notes

1. Switch `DATABASE_URL` to a PostgreSQL connection string and update `prisma/schema.prisma` provider to `"postgresql"`
2. Set strong, random `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
3. Set `NODE_ENV=production`
4. Set `CORS_ORIGIN` to your frontend domain
5. Run `npx prisma migrate deploy` instead of `db push`
6. Build frontend: `npm run build && npm start`
