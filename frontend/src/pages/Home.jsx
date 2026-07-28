import { useEffect, useState, useCallback } from 'react';
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import api from '../lib/api';
import JobCard from '../components/JobCard';

const TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [error, setError] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (q) params.q = q;
      if (location) params.location = location;
      if (type) params.type = type;
      const res = await api.get('/jobs', { params });
      setJobs(res.data.jobs);
    } catch (err) {
      setError('Could not load jobs. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [q, location, type]);

  useEffect(() => {
    const t = setTimeout(fetchJobs, 300);
    return () => clearTimeout(t);
  }, [fetchJobs]);

  return (
    <div>
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-pine mb-4">Your next role, plotted</p>
          <h1 className="font-display text-5xl sm:text-6xl font-semibold leading-[1.05] max-w-2xl text-ink">
            Find where you're headed.
          </h1>
          <p className="text-ink-soft mt-5 max-w-lg text-lg">
            Real listings from real companies. Search, apply, and track every application from first click to offer.
          </p>

          <div className="mt-10 bg-paper-raised border border-border rounded-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-3xl shadow-sm">
            <div className="flex items-center gap-2 flex-1 px-3">
              <Search size={18} className="text-muted shrink-0" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Job title, skill, or company"
                className="w-full py-2.5 bg-transparent outline-none text-sm"
              />
            </div>
            <div className="hidden sm:block w-px bg-border" />
            <div className="flex items-center gap-2 flex-1 px-3">
              <MapPin size={18} className="text-muted shrink-0" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="w-full py-2.5 bg-transparent outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <SlidersHorizontal size={14} className="text-muted" />
            <button
              onClick={() => setType('')}
              className={`text-xs font-mono uppercase tracking-wide px-3 py-1.5 rounded-full border transition-colors ${
                type === '' ? 'bg-ink text-white border-ink' : 'border-border text-ink-soft hover:border-pine'
              }`}
            >
              All types
            </button>
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t === type ? '' : t)}
                className={`text-xs font-mono uppercase tracking-wide px-3 py-1.5 rounded-full border transition-colors ${
                  type === t ? 'bg-ink text-white border-ink' : 'border-border text-ink-soft hover:border-pine'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold text-ink">
            {loading ? 'Searching…' : `${jobs.length} open ${jobs.length === 1 ? 'role' : 'roles'}`}
          </h2>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl p-4 text-sm mb-6">{error}</div>
        )}

        {!loading && jobs.length === 0 && !error && (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl">
            <p className="font-display text-xl text-ink mb-2">No roles match yet.</p>
            <p className="text-muted text-sm">Try a different keyword or clear your filters.</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </div>
  );
}
