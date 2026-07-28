const express = require('express');
const { v4: uuid } = require('uuid');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const STATUSES = ['Applied', 'Reviewed', 'Interview', 'Offer', 'Rejected'];

function parseJob(row) {
  if (!row) return null;
  return { ...row, tags: JSON.parse(row.tags || '[]') };
}

// POST /api/applications - jobseeker applies to a job
router.post(
  '/',
  requireAuth,
  requireRole('jobseeker'),
  [
    body('jobId').notEmpty().withMessage('Job id is required.'),
    body('coverLetter').trim().isLength({ min: 10 }).withMessage('Cover letter should be at least 10 characters.'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { jobId, coverLetter } = req.body;
    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    if (job.status !== 'open') return res.status(400).json({ message: 'This job is no longer accepting applications.' });

    const already = db.prepare('SELECT id FROM applications WHERE jobId = ? AND jobseekerId = ?').get(jobId, req.user.id);
    if (already) return res.status(409).json({ message: 'You already applied to this job.' });

    const application = {
      id: uuid(),
      jobId,
      jobseekerId: req.user.id,
      applicantName: req.user.name,
      applicantEmail: req.user.email,
      coverLetter: coverLetter.trim(),
      status: 'Applied',
      createdAt: new Date().toISOString(),
    };

    db.prepare(
      `INSERT INTO applications (id, jobId, jobseekerId, applicantName, applicantEmail, coverLetter, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      application.id,
      application.jobId,
      application.jobseekerId,
      application.applicantName,
      application.applicantEmail,
      application.coverLetter,
      application.status,
      application.createdAt
    );

    res.status(201).json({ application });
  }
);

// GET /api/applications/mine - jobseeker's own applications, joined with job info
router.get('/mine', requireAuth, requireRole('jobseeker'), (req, res) => {
  const rows = db
    .prepare('SELECT * FROM applications WHERE jobseekerId = ? ORDER BY createdAt DESC')
    .all(req.user.id);

  const withJob = rows.map((a) => ({
    ...a,
    job: parseJob(db.prepare('SELECT * FROM jobs WHERE id = ?').get(a.jobId)),
  }));

  res.json({ applications: withJob });
});

// GET /api/applications/job/:jobId - employer views applicants for their job
router.get('/job/:jobId', requireAuth, requireRole('employer'), (req, res) => {
  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.jobId);
  if (!job) return res.status(404).json({ message: 'Job not found.' });
  if (job.employerId !== req.user.id) {
    return res.status(403).json({ message: 'You can only view applicants for your own jobs.' });
  }

  const applications = db
    .prepare('SELECT * FROM applications WHERE jobId = ? ORDER BY createdAt DESC')
    .all(req.params.jobId);

  res.json({ applications, job: parseJob(job) });
});

// PATCH /api/applications/:id/status - employer updates applicant status
router.patch('/:id/status', requireAuth, requireRole('employer'), (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${STATUSES.join(', ')}` });
  }

  const application = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
  if (!application) return res.status(404).json({ message: 'Application not found.' });

  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(application.jobId);
  if (!job || job.employerId !== req.user.id) {
    return res.status(403).json({ message: 'You can only manage applicants for your own jobs.' });
  }

  db.prepare('UPDATE applications SET status = ? WHERE id = ?').run(status, req.params.id);
  const updated = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
  res.json({ application: updated });
});

module.exports = router;
