# Waypoint — Full-Stack Job Portal

A real, working job portal: job seekers search and apply to jobs; employers post
jobs and manage applicants through a status pipeline (Applied → Reviewed →
Interview → Offer / Rejected).

## Stack

- **Backend:** Node.js, Express, JWT auth, bcrypt password hashing, **SQLite**
  (via Node's built-in `node:sqlite` module — a real relational database with
  tables, foreign keys, and indexes, and no separate database server to install)
- **Frontend:** React 19, Vite, React Router, Tailwind CSS v4, Axios

> **Requires Node.js 22.5+** (ideally 22.13+, so SQLite works without any flags).
> `node -v` to check. `node:sqlite` is still an experimental API in Node — you'll
> see a one-line `ExperimentalWarning` in the console, which is expected and
> harmless.

## Project structure

```
job-portal/
  backend/     Express API (port 4000)
  frontend/    React app (port 5173 in dev)
```

## 1. Run the backend

```bash
cd backend
npm install
npm run seed     # creates demo accounts + sample jobs (safe to re-run, resets data)
npm start         # starts the API on http://localhost:4000
```

Demo accounts (created by the seed script):

| Role       | Email                | Password      |
|------------|-----------------------|---------------|
| Job seeker | jobseeker@demo.com    | password123   |
| Employer   | employer@demo.com     | password123   |

Data is stored in `backend/data/waypoint.db`, a real SQLite database file with
three tables (`users`, `jobs`, `applications`) linked by foreign keys. Delete
that file (or re-run `npm run seed`) to reset everything. You can also open it
directly with any SQLite browser (e.g. `sqlite3 backend/data/waypoint.db` or
the "DB Browser for SQLite" app) to inspect the data.

## 2. Run the frontend

In a **second terminal**:

```bash
cd frontend
npm install
npm run dev       # starts the app on http://localhost:5173
```

Open http://localhost:5173 in your browser. The frontend is already configured
(via `frontend/.env`) to talk to the backend at `http://localhost:4000/api`.

## Features

**Job seekers**
- Browse and search jobs by keyword, location, and job type
- View full job details
- Apply with a cover letter
- Track every application's status on a visual pipeline ("My applications")

**Employers**
- Register a company account
- Post new job listings
- View all applicants per job, with cover letters
- Move applicants through statuses (Applied, Reviewed, Interview, Offer, Rejected)
- Close/reopen or manage listings from a dashboard

**Auth & security**
- JWT-based sessions (7-day expiry)
- Passwords hashed with bcrypt
- Role-based route protection on both frontend and backend
- Server-side validation on all inputs

## Notes on going to production

This is a fully functional local dev setup with a real SQL database. Before
deploying publicly you'd want to:
- Move to a hosted database (Postgres via a service like Supabase/Neon/RDS) if
  you need multiple app servers writing concurrently — SQLite is a single file
  and is best suited to a single backend process, which is exactly this setup
- Set a strong, secret `JWT_SECRET` in `backend/.env`
- Add file uploads for resumes (currently applications use a text cover letter)
- Add HTTPS, rate limiting, and CORS restricted to your real frontend domain
- Host the frontend build (`npm run build` → `frontend/dist`) on a static host
  (Vercel/Netlify) and the backend on a Node host (Render/Railway/Fly.io)
