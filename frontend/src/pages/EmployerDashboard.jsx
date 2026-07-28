import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, MapPin, Plus, Ban, RotateCcw } from 'lucide-react';
import api from '../lib/api';

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchJobs() {
    setLoading(true);
    try {
      const res = await api.get('/jobs/mine');
      setJobs(res.data.jobs);
    } catch (err) {
      setError('Could not load your job postings.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  async function toggleStatus(job) {
    const newStatus = job.status === 'open' ? 'closed' : 'open';
    await api.patch(`/jobs/${job.id}`, { status: newStatus });
    fetchJobs();
  }

  if (loading) return <div className="max-w-5xl mx-auto px-6 py-16 text-muted font-mono text-sm">loading…</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Your postings</h1>
          <p className="text-muted text-sm mt-1">{jobs.length} total roles</p>
        </div>
        <Link
          to="/employer/post"
          className="flex items-center gap-1.5 bg-pine text-white px-4 py-2.5 rounded-full font-medium hover:bg-pine-dark transition-colors"
        >
          <Plus size={16} /> Post a job
        </Link>
      </div>

      {error && <p className="text-danger text-sm mb-4">{error}</p>}

      {jobs.length === 0 && !error && (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl">
          <p className="font-display text-xl text-ink mb-2">No jobs posted yet.</p>
          <p className="text-muted text-sm">Post your first role to start receiving applications.</p>
        </div>
      )}

      <div className="space-y-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-paper-raised border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-semibold text-ink">{job.title}</h3>
                <span
                  className={`text-[10px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-full ${
                    job.status === 'open' ? 'bg-pine/15 text-pine-dark' : 'bg-ink/10 text-muted'
                  }`}
                >
                  {job.status}
                </span>
              </div>
              <p className="flex items-center gap-1 text-sm text-muted mt-1">
                <MapPin size={13} /> {job.location} · {job.type}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={`/employer/jobs/${job.id}/applicants`}
                className="flex items-center gap-1.5 text-sm font-medium text-pine-dark hover:text-pine border border-pine/30 rounded-full px-4 py-2 hover:bg-pine/5 transition-colors"
              >
                <Users size={15} /> {job.applicantCount} applicant{job.applicantCount === 1 ? '' : 's'}
              </Link>
              <button
                onClick={() => toggleStatus(job)}
                title={job.status === 'open' ? 'Close listing' : 'Reopen listing'}
                className="flex items-center gap-1.5 text-sm text-muted hover:text-ink border border-border rounded-full px-3 py-2 transition-colors"
              >
                {job.status === 'open' ? <Ban size={15} /> : <RotateCcw size={15} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
