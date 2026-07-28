require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const db = require('./db');

db.exec('DELETE FROM applications; DELETE FROM jobs; DELETE FROM users;');

const employer = {
  id: uuid(),
  name: 'Priya Sharma',
  email: 'employer@demo.com',
  passwordHash: bcrypt.hashSync('password123', 10),
  role: 'employer',
  company: 'Nimbus Technologies',
  createdAt: new Date().toISOString(),
};

const jobseeker = {
  id: uuid(),
  name: 'Arjun Mehta',
  email: 'jobseeker@demo.com',
  passwordHash: bcrypt.hashSync('password123', 10),
  role: 'jobseeker',
  company: null,
  createdAt: new Date().toISOString(),
};

const insertUser = db.prepare(
  `INSERT INTO users (id, name, email, passwordHash, role, company, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`
);
insertUser.run(employer.id, employer.name, employer.email, employer.passwordHash, employer.role, employer.company, employer.createdAt);
insertUser.run(jobseeker.id, jobseeker.name, jobseeker.email, jobseeker.passwordHash, jobseeker.role, jobseeker.company, jobseeker.createdAt);

const jobs = [
  {
    id: uuid(),
    employerId: employer.id,
    company: 'Nimbus Technologies',
    title: 'Frontend Developer (React)',
    description:
      'We are looking for a Frontend Developer to build delightful, accessible interfaces for our SaaS product. You will work closely with design and backend teams to ship features end to end.',
    location: 'Jaipur, Rajasthan',
    type: 'Full-time',
    salaryMin: 600000,
    salaryMax: 1000000,
    tags: JSON.stringify(['React', 'JavaScript', 'CSS', 'Tailwind']),
    status: 'open',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: uuid(),
    employerId: employer.id,
    company: 'Nimbus Technologies',
    title: 'Backend Engineer (Node.js)',
    description:
      'Design and maintain REST APIs powering our platform. Experience with Express, databases, and authentication systems required. You will own services from design through deployment.',
    location: 'Remote',
    type: 'Remote',
    salaryMin: 800000,
    salaryMax: 1400000,
    tags: JSON.stringify(['Node.js', 'Express', 'SQL', 'API Design']),
    status: 'open',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: uuid(),
    employerId: employer.id,
    company: 'Nimbus Technologies',
    title: 'Product Design Intern',
    description:
      'Join our design team for a 6-month internship. You will assist with user research, wireframing, and prototyping for our core products under mentorship of senior designers.',
    location: 'Bengaluru, Karnataka',
    type: 'Internship',
    salaryMin: 15000,
    salaryMax: 25000,
    tags: JSON.stringify(['Figma', 'UX Research', 'Prototyping']),
    status: 'open',
    createdAt: new Date().toISOString(),
  },
];

const insertJob = db.prepare(
  `INSERT INTO jobs (id, employerId, company, title, description, location, type, salaryMin, salaryMax, tags, status, createdAt)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);
for (const job of jobs) {
  insertJob.run(
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
}

console.log('Seeded SQLite database (backend/data/waypoint.db) with:');
console.log('  Employer login:  employer@demo.com / password123');
console.log('  Jobseeker login: jobseeker@demo.com / password123');
console.log(`  ${jobs.length} demo jobs created.`);
