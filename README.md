# Nexora — Employee Attendance & Task Management System

A production-ready, full-stack MERN application for managing employee attendance, work timers, tasks, holidays/leaves, reports, and more — with role-based access control for **Admin** and **Employee** users.

- **Frontend:** React 18 + Vite + Tailwind CSS + React Router + Recharts
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (JSON Web Tokens) + bcrypt password hashing

---

## 1. Features

### Admin
- Employee CRUD (create, edit, activate/deactivate, delete) with search/filter/sort/pagination
- Real-time dashboard: attendance overview, weekly trend chart, today's employee activity table
- Attendance history with filters + CSV export
- Task creation & assignment to employees, progress tracking
- Leave approval/rejection workflow (auto-updates attendance to "On Leave")
- Company holiday calendar management
- Attendance & Task reports with CSV export
- Notifications, Audit Logs (tracks every admin action), Application Settings

### Employee
- Personal dashboard with today's stats
- Work timer: Start / Pause (Break) / Resume / Stop — **calculated server-side**, survives page refresh
- Daily task creation, time logging, status updates (Pending/In Progress/Completed)
- Attendance history
- Apply for leave, view approval status
- Profile & password management

### Cross-cutting
- JWT auth with role-based route protection (frontend + backend)
- Inactive accounts are blocked from logging in immediately
- Loading skeletons, empty states, error states, toast notifications, confirmation modals everywhere
- Fully responsive: sidebar (desktop/tablet, collapsible) + bottom nav (mobile)

---

## 2. Project Structure

```
attendance-app/
├── backend/
│   ├── config/db.js
│   ├── models/            # Mongoose schemas
│   ├── controllers/       # Business logic
│   ├── routes/            # Express routers
│   ├── middleware/        # auth, RBAC, error handling, validation
│   ├── utils/             # helpers (JWT, dates, notifications, async wrapper)
│   ├── seed/seed.js        # Demo data seeder
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/            # Axios service layer (one file per resource)
    │   ├── context/AuthContext.jsx
    │   ├── components/
    │   │   ├── common/     # StatCard, Modal, Badge, Pagination, etc.
    │   │   └── layout/     # Sidebar, Header, MobileNav, DashboardLayout
    │   ├── pages/
    │   │   ├── auth/       # Login, AdminSignup, ForgotPassword
    │   │   ├── admin/      # 13 admin pages
    │   │   └── employee/   # 9 employee pages
    │   ├── utils/          # formatting, CSV download helper
    │   └── App.jsx          # All routes + RBAC guards
    └── package.json
```

---

## 3. Prerequisites

- Node.js 18+ and npm
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string

---

## 4. Setup Instructions

### 4.1 Backend (Server)

```bash
cd server
npm install
# Edit .env if needed: set MONGO_URI and JWT_SECRET
npm run seed     # populates demo data (admin, employees, attendance, tasks, leaves, holidays)
npm run dev      # starts on http://localhost:5000
```

**.env variables**
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/attendance_app
JWT_SECRET=change_this_super_secret_key_in_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

#### 4.2 Frontend (Client)

```bash
cd client
npm install
npm run dev      # starts on http://localhost:5173
```

**.env variables**
```
VITE_API_URL=http://localhost:5000/api
```

### 4.3 Demo credentials (after running `npm run seed`)

| Role     | Login              | Password       |
|----------|---------------------|----------------|
| Admin    | admin@company.com   | Admin@123      |
| Employee | rahul@company.com   | Employee@123   |
| Employee (inactive, blocked) | karan@company.com | Employee@123 |

If you don't run the seeder, visit `/admin-signup` on first launch to create the initial admin account (this route is disabled automatically once an admin exists).

---

## 5. Core Business Rules Implemented

1. One attendance record per employee per calendar date (`Attendance` has a unique compound index on `employee + date`).
2. Working duration is **always computed on the backend** from timestamps (`WorkSession` / `BreakSession` documents) — the frontend timer only displays a live-ticking estimate that re-syncs with the server every 60s and on every action, so refreshing the page never loses time.
3. Starting work twice, or stopping without starting, are rejected with clear error messages.
4. Deactivating an employee immediately blocks their next login attempt (checked in the `protect` middleware on every request, not just at login).
5. Role and status are **never trusted from the frontend** — every request re-reads `req.user` from the database via the JWT-verified `_id`.
6. Approving a leave automatically creates/updates `Attendance` records with `status: on_leave` for each date in range.
7. All destructive/sensitive admin actions (create/update/activate/deactivate/delete employee, password reset, settings change) are written to the `AuditLog` collection.

---

## 6. REST API Overview

Base URL: `http://localhost:5000/api`

| Resource | Routes |
|---|---|
| Auth | `POST /auth/signup`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`, `POST /auth/forgot-password`, `PUT /auth/change-password` |
| Employees (admin only) | `GET/POST /employees`, `GET/PUT/DELETE /employees/:id`, `PATCH /employees/:id/status`, `PATCH /employees/:id/reset-password` |
| Attendance | `POST /attendance/start`, `/stop`, `/break/start`, `/break/end`, `GET /attendance/today`, `/history`, (admin) `/all-today`, `/history-admin` |
| Tasks | `GET/POST /tasks`, `GET/PUT/DELETE /tasks/:id`, `PATCH /tasks/:id/status`, `POST /tasks/:id/time-log` |
| Leaves | `GET/POST /leaves`, `PATCH /leaves/:id/approve`, `PATCH /leaves/:id/reject` |
| Holidays | `GET/POST /holidays`, `PUT/DELETE /holidays/:id` |
| Dashboard | `GET /dashboard/admin`, `GET /dashboard/employee` |
| Reports | `GET /reports/attendance`, `GET /reports/tasks` (add `?format=csv` to download) |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` |
| Audit Logs (admin) | `GET /audit-logs` |
| Settings | `GET /settings`, `PUT /settings` (admin) |
| Departments | `GET/POST /departments`, `DELETE /departments/:id` |

All protected routes require `Authorization: Bearer <token>`.

---

## 7. Security Notes

- Passwords hashed with bcrypt (10 salt rounds), never stored or returned in plaintext.
- JWT-based auth; tokens expire after 7 days by default.
- `helmet`, `express-mongo-sanitize`, and rate limiting (`express-rate-limit`) applied globally; stricter limits on `/api/auth/*`.
- Role-based middleware (`authorize('admin')`) guards every admin-only route on the backend — the frontend's `ProtectedRoute` is a UX convenience, not the security boundary.
- Server never trusts a status/role value sent from the client; it's always re-derived from the authenticated user document.

---

## 8. Production Deployment

### Backend
1. Set `NODE_ENV=production` and a strong, unique `JWT_SECRET`.
2. Point `MONGO_URI` at a managed MongoDB instance (e.g., MongoDB Atlas).
3. Set `CLIENT_URL` to your deployed frontend origin (for CORS).
4. Deploy to any Node host (Render, Railway, Fly.io, AWS EC2/ECS, DigitalOcean App Platform). Example with PM2:
   ```bash
   npm install --production
   pm2 start server.js --name attendance-api
   ```
5. Put the API behind HTTPS (via the platform's load balancer or a reverse proxy like Nginx + Let's Encrypt).

### Frontend
1. Set `VITE_API_URL` to your production API URL.
2. Build: `npm run build` → outputs static files to `frontend/dist`.
3. Deploy `dist/` to any static host (Vercel, Netlify, Cloudflare Pages, S3+CloudFront, or served via Nginx).

### Mobile (APK)
The UI is fully responsive and touch-friendly (bottom navigation on mobile, no overflow issues) so it works well inside a WebView wrapper (e.g., Capacitor or a TWA) if a quick APK is needed. For a native experience, the same design system (colors, spacing, components) and REST API described above can be reused to build a React Native + Expo app that talks to the same backend without any API changes.

---

## 9. Testing the Core Flow

1. `npm run seed` (backend) → creates admin + 8 employees + attendance/tasks/leaves/holidays.
2. Log in as admin → Dashboard shows live stats and charts.
3. Admin → Employees → Add Employee (or use seeded ones).
4. Log in as an employee (in a separate browser/incognito window).
5. Employee → My Timer → Start Work → wait a few seconds → Pause (Break) → Resume → Stop Work. Refresh mid-session to confirm the timer re-syncs correctly.
6. Employee → My Tasks → Add Task → open it → Log Time → mark Completed.
7. Employee → My Holidays → Apply for Leave.
8. Admin → Holidays & Leaves → approve the pending request → confirm the employee's attendance for those dates now shows "On Leave".
9. Admin → Reports → generate & export an Attendance/Task CSV report.
10. Admin → Audit Logs → confirm the employee-creation and leave-approval actions were recorded.

---

## 10. Notes & Limitations

- CSV export is implemented for Attendance and Task reports (Excel/PDF export can be added the same way using `exceljs` / `pdfkit` if needed).
- Forgot Password currently returns a generic confirmation message without actually emailing a reset link (no email provider configured) — wire up a provider like SendGrid/Postmark and a reset-token flow for production use.
- IP/device metadata is captured on attendance start for basic audit purposes; add stronger device fingerprinting if required by your compliance needs.
