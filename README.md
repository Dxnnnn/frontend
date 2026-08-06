# Faculty Evaluation System — Frontend

Next.js web application for the Faculty Evaluation System. Students, School Heads, and Admins each have their own portal with role-based access control.

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | Next.js 16 (App Router)             |
| Language    | TypeScript                          |
| Styling     | Tailwind CSS v4                     |
| UI          | NextUI                              |
| PDF Export  | jsPDF                               |
| Auth        | Cookie-based sessions (middleware)  |

---

## Project Structure

```
app/
├── admin/
│   ├── (auth)/login/          # Admin login page
│   └── (dashboard)/
│       ├── page.tsx           # Dashboard
│       ├── accounts/          # Student & school head accounts
│       ├── faculty/           # Faculty management
│       ├── evaluations/       # Survey question management
│       ├── evaluation-status/ # Submission status overview
│       ├── semester/          # Semester management
│       └── reports/           # Evaluation reports per faculty
├── faculty/                   # School head / coordinator portal
├── user/                      # Student portal
├── api/                       # Next.js API routes (proxy to backend)
└── (start)/                   # Landing / login selection page

components/
├── admin/                     # Admin dashboard components
├── faculty-portal/            # School head portal components
├── user/                      # Student portal components
└── auth/                      # Login forms

lib/
├── admin/                     # Admin nav and helpers
├── faculty-portal/            # Coordinator nav and helpers
├── faculty/                   # Faculty data utilities
├── evaluations/               # Evaluation storage helpers
├── semester/                  # Semester storage helpers
└── types/                     # Shared TypeScript types
```

---

## Getting Started

### 1. Prerequisites

- Node.js 18+
- Backend API running (see `../Backend/README.md`)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app redirects to the login selection page.

### Other scripts

```bash
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
```

---

## User Roles & Portals

| Role        | Login URL       | Portal URL  | Description                                  |
|-------------|-----------------|-------------|----------------------------------------------|
| Admin       | `/admin/login`  | `/admin`    | Full system management                       |
| School Head | `/login`        | `/faculty`  | Evaluate faculty and view reports            |
| Student     | `/login`        | `/user`     | Submit faculty evaluations                   |

### Demo Accounts

| Role        | Username / ID  | Password      |
|-------------|----------------|---------------|
| Admin       | `admin@bc.com` | `admin123`    |

Student and school head accounts are created by the admin through the Accounts page.

---

## Portal Navigation

### Admin (`/admin`)

| Page              | Description                                          |
|-------------------|------------------------------------------------------|
| Dashboard         | Overview and recent evaluation activity              |
| Accounts          | Create and manage student and school head accounts   |
| Faculty           | Add, edit, and deactivate faculty members            |
| Evaluations       | Build and publish the evaluation questionnaire       |
| Evaluation Status | Monitor who has and hasn't submitted evaluations     |
| Semester          | Manage school year terms and active subjects         |
| Reports           | View per-faculty evaluation results and export PDF   |

### School Head / Coordinator (`/faculty`)

| Page            | Description                                    |
|-----------------|------------------------------------------------|
| Dashboard       | Summary of evaluation activity                 |
| Evaluation Form | Submit evaluations for faculty members         |
| Teachers        | View faculty list filtered by department       |
| Reports         | View submitted evaluation results              |

### Student (`/user`)

| Page            | Description                              |
|-----------------|------------------------------------------|
| Dashboard       | Overview and pending evaluations         |
| Evaluation Form | Submit faculty evaluations               |

---

## Authentication & Route Protection

Middleware in `proxy.ts` / `middleware.ts` guards all portal routes using an `eval_session` cookie. Unauthenticated users are redirected to the appropriate login page, and authenticated users are redirected away from login pages they have already passed.

---

## Git Workflow

```bash
# Create your feature branch
git checkout -b your-branch-name

# Stage and commit
git add .
git commit -m "describe your change"

# Push to remote
git push -u origin your-branch-name

# Pull latest changes from main
git pull origin main
```
