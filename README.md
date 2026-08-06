# Group2-FES

# Faculty Evaluation System — Backend

REST API for the Faculty Evaluation System built with **Node.js**, **Express**, and **MySQL**.

---

## Tech Stack

| Layer       | Technology                     |
|-------------|-------------------------------|
| Runtime     | Node.js                        |
| Framework   | Express 5                      |
| Database    | MySQL 8 via `mysql2`           |
| Auth        | JWT (`jsonwebtoken`) + `bcryptjs` |
| Environment | `dotenv`                       |
| Dev tool    | `nodemon`                      |

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                  # MySQL connection pool
│   ├── controller/
│   │   ├── authController.js      # Admin login & registration
│   │   ├── evaluationController.js
│   │   ├── facultyController.js
│   │   ├── schoolHeadController.js
│   │   ├── semesterController.js
│   │   ├── studentController.js
│   │   └── surveyQuestionController.js
│   ├── middleware/
│   │   ├── errorHandler.js        # Global error handler
│   │   └── verifyToken.js         # JWT auth middleware
│   ├── routes/
│   │   ├── auth.js
│   │   ├── evaluations.js
│   │   ├── faculty.js
│   │   ├── schoolHeads.js
│   │   ├── semesters.js
│   │   ├── students.js
│   │   └── surveyQuestions.js
│   └── seed/
│       └── adminSeed.js           # Seeds the default admin account
├── mysql/
│   └── database.sql               # Full DB schema dump
├── .env                           # Environment variables (not committed)
├── server.js                      # App entry point
└── package.json
```

---

## Getting Started

### 1. Prerequisites

- Node.js 18+
- MySQL 8

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=faculty_evaluation
JWT_SECRET=your_jwt_secret
```

### 4. Set up the database

Import the schema into MySQL:

```bash
mysql -u root -p faculty_evaluation < mysql/database.sql
```

### 5. Seed the admin account

```bash
npm run seed
```

### 6. Start the server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server runs on the port defined in `.env` (default: `5000`).

---

## API Endpoints

All routes are prefixed with `/api`.

| Method | Endpoint                    | Description                        | Auth Required |
|--------|-----------------------------|------------------------------------|---------------|
| POST   | `/api/auth/login`           | Admin login                        | No            |
| POST   | `/api/auth/register-admin`  | Register a new admin               | No            |
| GET    | `/api/school-heads`         | List all school heads              | Yes           |
| POST   | `/api/school-heads`         | Create a school head account       | Yes           |
| PUT    | `/api/school-heads/:id`     | Update a school head               | Yes           |
| DELETE | `/api/school-heads/:id`     | Delete a school head               | Yes           |
| GET    | `/api/students`             | List all students                  | Yes           |
| POST   | `/api/students`             | Create a student account           | Yes           |
| PUT    | `/api/students/:id`         | Update a student                   | Yes           |
| DELETE | `/api/students/:id`         | Delete a student                   | Yes           |
| GET    | `/api/faculty`              | List all faculty                   | Yes           |
| POST   | `/api/faculty`              | Add a faculty member               | Yes           |
| PUT    | `/api/faculty/:id`          | Update a faculty member            | Yes           |
| DELETE | `/api/faculty/:id`          | Delete a faculty member            | Yes           |
| GET    | `/api/evaluations`          | List evaluation submissions        | Yes           |
| POST   | `/api/evaluations`          | Submit an evaluation               | No            |
| GET    | `/api/survey-questions`     | List survey questions              | Yes           |
| POST   | `/api/survey-questions`     | Create a survey question           | Yes           |
| PUT    | `/api/survey-questions/:id` | Update a survey question           | Yes           |
| DELETE | `/api/survey-questions/:id` | Delete a survey question           | Yes           |
| GET    | `/api/semesters`            | List semesters                     | Yes           |
| POST   | `/api/semesters`            | Create a semester                  | Yes           |
| PUT    | `/api/semesters/:id`        | Update a semester                  | Yes           |
| DELETE | `/api/semesters/:id`        | Delete a semester                  | Yes           |

Protected routes require a `Bearer` token in the `Authorization` header.

---

## Database Schema

Key tables in `faculty_evaluation`:

| Table                    | Description                                          |
|--------------------------|------------------------------------------------------|
| `admins`                 | Admin accounts                                       |
| `school_heads`           | School head / coordinator accounts                  |
| `students`               | Student accounts (elementary to college)             |
| `faculty`                | Faculty members available for evaluation             |
| `semesters`              | School year terms and active subjects                |
| `survey_questions`       | Configurable evaluation questionnaire                |
| `evaluation_submissions` | Submitted evaluations from students and school heads |

---

## Git Workflow

```bash
# Create your feature branch
git checkout -b your-branch-name

# Stage and commit
git add .
git commit -m "your message"

# Push to remote
git push -u origin your-branch-name

# Pull latest changes
git pull origin main
```
