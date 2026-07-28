const express = require('express');
const { v4: uuid } = require('uuid');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

function parseJob(row) {
  if (!row) return row;
  return { ...row, tags: JSON.parse(row.tags || '[]') };
}

// GET /api/jobs - public, supports search & filters
router.get('/', (req, res) => {
  const { q, location, type, minSalary } = req.query;

  let sql = 'SELECT * FROM jobs WHERE status = ?';
  const params = ['open'];

  if (location) {
    sql += ' AND location LIKE ?';
    params.push(`%${location}%`);
  }
  if (type) {
    sql += ' AND type = ?';
    params.push(type);
  }
  if (minSalary) {
    sql += ' AND salaryMax >= ?';
    params.push(Number(minSalary));
  }

  let jobs = db.prepare(sql).all(...params).map(parseJob);

  if (q) {
    const term = q.toLowerCase();
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(term) ||
        j.company.toLowerCase().includes(term) ||
        j.tags.some((t) => t.toLowerCase().includes(term))
    );
  }

  jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ jobs, count: jobs.length });
});

// GET /api/jobs/mine - employer's own postings (with applicant counts)
router.get('/mine', requireAuth, requireRole('employer'), (req, res) => {
  const jobs = db
    .prepare(
      `SELECT j.*, (SELECT COUNT(*) FROM applications a WHERE a.jobId = j.id) AS applicantCount
       FROM jobs j WHERE j.employerId = ?
       ORDER BY j.createdAt DESC`
    )
    .all(req.user.id)
    .map(parseJob);

  res.json({ jobs });
});

// GET /api/jobs/:id - public
router.get('/:id', (req, res) => {
  const job = parseJob(db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id));
  if (!job) return res.status(404).json({ message: 'Job not found.' });
  res.json({ job });
});

// POST /api/jobs - employer only
router.post(
  '/',
  requireAuth,
  requireRole('employer'),
  [
    body('title').trim().isLength({ min: 2 }).withMessage('Title is required.'),
    body('description').trim().isLength({ min: 20 }).withMessage('Description should be at least 20 characters.'),
    body('location').trim().notEmpty().withMessage('Location is required.'),
    body('type').isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote']).withMessage('Invalid job type.'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const { title, description, location, type, salaryMin, salaryMax, tags } = req.body;

    const job = {
      id: uuid(),
      employerId: req.user.id,
      company: user.company || user.name,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      type,
      salaryMin: salaryMin ? Number(salaryMin) : null,
      salaryMax: salaryMax ? Number(salaryMax) : null,
      tags: JSON.stringify(Array.isArray(tags) ? tags.map((t) => t.trim()).filter(Boolean) : []),
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    db.prepare(
      `INSERT INTO jobs (id, employerId, company, title, description, location, type, salaryMin, salaryMax, tags, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      job.id,
      job.employerId,
      job.company,
      job.title,
      job.description,
      job.location,
      job.type,
      job.salaryMin,
      job.salaryMax,
      job.tags,
      job.status,
      job.createdAt
    );

    res.status(201).json({ job: parseJob(job) });
  }
);

// PATCH /api/jobs/:id - employer owner only (edit or close)
router.patch('/:id', requireAuth, requireRole('employer'), (req, res) => {
  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found.' });
  if (job.employerId !== req.user.id) {
    return res.status(403).json({ message: 'You can only edit your own job postings.' });
  }

  const allowed = ['title', 'description', 'location', 'type', 'salaryMin', 'salaryMax', 'tags', 'status'];
  const sets = [];
  const params = [];

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      sets.push(`${key} = ?`);
      params.push(key === 'tags' ? JSON.stringify(req.body[key]) : req.body[key]);
    }
  }

  if (sets.length > 0) {
    params.push(req.params.id);
    db.prepare(`UPDATE jobs SET ${sets.join(', ')} WHERE id = ?`).run(...params);
  }

  const updated = parseJob(db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id));
  res.json({ job: updated });
});

// DELETE /api/jobs/:id - employer owner only
router.delete('/:id', requireAuth, requireRole('employer'), (req, res) => {
  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found.' });
  if (job.employerId !== req.user.id) {
    return res.status(403).json({ message: 'You can only delete your own job postings.' });
  }

  // Foreign key ON DELETE CASCADE also removes related applications.
  db.prepare('DELETE FROM jobs WHERE id = ?').run(req.params.id);
  res.json({ message: 'Job deleted.' });
});

module.exports = router;
