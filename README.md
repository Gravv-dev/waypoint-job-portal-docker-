# 🧭 Waypoint — Full-Stack Job Portal

A real, working job portal where job seekers search & apply for jobs, and employers post listings and manage applicants through a hiring pipeline — **Applied → Reviewed → Interview → Offer**.

Built as a genuine full-stack app: JWT authentication, a real SQL database, role-based access control, and a fully containerized Docker setup.

---

## ✨ Features

**Job seekers**
- 🔍 Search & filter jobs by keyword, location, and job type
- 📄 View full job details
- ✉️ Apply with a cover letter
- 📊 Track every application's status on a visual pipeline

**Employers**
- 🏢 Register a company account
- 📝 Post new job listings
- 👥 View all applicants per job with their cover letters
- 🔄 Move applicants through hiring stages (Applied, Reviewed, Interview, Offer, Rejected)
- ⏸️ Close/reopen listings from a dashboard

**Security**
- JWT-based sessions (7-day expiry)
- Passwords hashed with bcrypt
- Role-based route protection on both frontend and backend
- Server-side input validation on every endpoint

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend runtime | Node.js 22 |
| Backend framework | Express 5 |
| Database | **SQLite** (via Node's built-in `node:sqlite`) — real relational DB, no external DB server needed |
| Auth | JWT (`jsonwebtoken`) + bcrypt |
| Validation | `express-validator` |
| Frontend | React 19 + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS v4 |
| HTTP client | Axios |
| Production serving | **nginx** (reverse-proxies API requests to the backend) |
| Containerization | Docker + Docker Compose |

---

## 🚀 Quick Start with Docker (recommended)

The whole app — frontend, backend, and database — runs with one command.

```bash
git clone https://github.com/Gravv-dev/waypoint-job-portal.git
cd waypoint-job-portal

cp .env.example .env       # then open .env and set a real JWT_SECRET
docker compose up --build
```

Once it's up:
- App (nginx): **http://localhost**
- Backend API directly: **http://localhost:4000/api** *(for debugging only)*

The database auto-seeds with demo data the first time it runs. Your data persists across restarts in a Docker volume — to reset everything, run `docker compose down -v`.

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Job seeker | `jobseeker@demo.com` | `password123` |
| Employer | `employer@demo.com` | `password123` |

---

## 🧑‍💻 Running locally without Docker

**Backend**
```bash
cd backend
npm install
npm run seed      # creates demo accounts + sample jobs
npm start          # http://localhost:4000
```

**Frontend** (in a second terminal)
```bash
cd frontend
npm install
npm run dev         # http://localhost:5173
```

> Requires Node.js **22.5+** (ideally 22.13+) since the database uses Node's built-in, still-experimental `node:sqlite` module. You may see a one-line `ExperimentalWarning` in the console — that's expected and harmless.

---

## 📁 Project Structure

```
waypoint-job-portal/
├── backend/
│   ├── server.js          # Express app entry point
│   ├── db.js              # SQLite schema & connection
│   ├── seed.js            # Demo data seeder
│   ├── routes/            # auth, jobs, applications
│   ├── middleware/         # JWT auth & role guards
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/          # Home, JobDetail, Login, Register, dashboards…
│   │   ├── components/      # Navbar, JobCard, WaypointRail…
│   │   └── context/          # AuthContext
│   ├── nginx.conf            # SPA routing + API reverse proxy
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## 🗄️ Database

Data lives in `backend/data/waypoint.db` — a real SQLite file with three tables (`users`, `jobs`, `applications`) linked by foreign keys, with `ON DELETE CASCADE` and unique constraints (e.g. you can't apply to the same job twice). Inspect it anytime with any SQLite browser (e.g. DB Browser for SQLite).

---

## 🌱 Future improvements

- Swap SQLite for Postgres if scaling to multiple backend instances
- Resume file uploads (currently cover letters are plain text)
- Email notifications on status changes
- Admin role for platform moderation

---

## 📄 License

This project is open for learning and personal use.
