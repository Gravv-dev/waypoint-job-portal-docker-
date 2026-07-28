import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    type: 'Full-time',
    salaryMin: '',
    salaryMax: '',
    tags: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      const res = await api.post('/jobs', payload);
      navigate(`/jobs/${res.data.job.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post this job.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">Post a job</h1>
      <p className="text-muted text-sm mb-8">This listing goes live immediately for job seekers to find.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <p className="text-danger text-sm">{error}</p>}

        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-muted">Job title</label>
          <input
            required
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="e.g. Senior Backend Engineer"
            className="w-full mt-1 border border-border rounded-xl p-3 text-sm outline-none focus:border-pine transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-muted">Description</label>
          <textarea
            required
            minLength={20}
            rows={6}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Responsibilities, requirements, and what makes this role great…"
            className="w-full mt-1 border border-border rounded-xl p-3 text-sm outline-none focus:border-pine transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wide text-muted">Location</label>
            <input
              required
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="City, or Remote"
              className="w-full mt-1 border border-border rounded-xl p-3 text-sm outline-none focus:border-pine transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wide text-muted">Job type</label>
            <select
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
              className="w-full mt-1 border border-border rounded-xl p-3 text-sm outline-none focus:border-pine transition-colors bg-white"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wide text-muted">Min salary (₹/yr)</label>
            <input
              type="number"
              min="0"
              value={form.salaryMin}
              onChange={(e) => update('salaryMin', e.target.value)}
              className="w-full mt-1 border border-border rounded-xl p-3 text-sm outline-none focus:border-pine transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wide text-muted">Max salary (₹/yr)</label>
            <input
              type="number"
              min="0"
              value={form.salaryMax}
              onChange={(e) => update('salaryMax', e.target.value)}
              className="w-full mt-1 border border-border rounded-xl p-3 text-sm outline-none focus:border-pine transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-muted">Skills / tags</label>
          <input
            value={form.tags}
            onChange={(e) => update('tags', e.target.value)}
            placeholder="React, TypeScript, GraphQL (comma separated)"
            className="w-full mt-1 border border-border rounded-xl p-3 text-sm outline-none focus:border-pine transition-colors"
          />
        </div>

        <button
          disabled={loading}
          className="bg-pine text-white px-6 py-3 rounded-full font-medium hover:bg-pine-dark transition-colors disabled:opacity-60"
        >
          {loading ? 'Publishing…' : 'Publish job'}
        </button>
      </form>
    </div>
  );
}
