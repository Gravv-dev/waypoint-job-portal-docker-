const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, 'waypoint.db'));

// Enforce referential integrity at the SQLite level.
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('jobseeker', 'employer')),
    company TEXT,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    employerId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL,
    salaryMin INTEGER,
    salaryMax INTEGER,
    tags TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    jobId TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    jobseekerId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    applicantName TEXT NOT NULL,
    applicantEmail TEXT NOT NULL,
    coverLetter TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Applied',
    createdAt TEXT NOT NULL,
    UNIQUE (jobId, jobseekerId)
  );

  CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
  CREATE INDEX IF NOT EXISTS idx_jobs_employer ON jobs(employerId);
  CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(jobId);
  CREATE INDEX IF NOT EXISTS idx_applications_jobseeker ON applications(jobseekerId);
`);

module.exports = db;
