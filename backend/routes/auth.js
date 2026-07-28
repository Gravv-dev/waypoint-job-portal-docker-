const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function publicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters.'),
    body('email').isEmail().withMessage('Enter a valid email address.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    body('role').isIn(['jobseeker', 'employer']).withMessage('Role must be jobseeker or employer.'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, email, password, role, company } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    if (role === 'employer' && !company) {
      return res.status(400).json({ message: 'Company name is required for employer accounts.' });
    }

    const user = {
      id: uuid(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: bcrypt.hashSync(password, 10),
      role,
      company: role === 'employer' ? company.trim() : null,
      createdAt: new Date().toISOString(),
    };

    db.prepare(
      `INSERT INTO users (id, name, email, passwordHash, role, company, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(user.id, user.name, user.email, user.passwordHash, user.role, user.company, user.createdAt);

    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email address.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  }
);

router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ user: publicUser(user) });
});

module.exports = router;
