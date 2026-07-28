import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Briefcase, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = (n) => (n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`);
  if (min && max) return `${fmt(min)} – ${fmt(max)} / year`;
  return `${fmt(min || max)} / year`;
}

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/jobs/${id}`)
      .then((res) => setJob(res.data.job))
      .catch(() => setError('Job not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleApply(e) {
    e.preventDefault();
    setError('');
    setApplying(true);
    try {
      await api.post('/applications', { jobId: id, coverLetter });
      setApplied(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit your application.');
    } finally {
      setApplying(false);
    }
  }

  if (loading) return <div className="max-w-3xl mx-auto px-6 py-16 text-muted font-mono text-sm">loading…</div>;
  if (!job) return <div className="max-w-3xl mx-auto px-6 py-16">{error}</div>;

  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-pine mb-8">
        <ArrowLeft size={16} /> Back to listings
      </Link>

      <p className="font-mono text-xs uppercase tracking-wide text-pine mb-2">{job.company}</p>
      <h1 className="font-display text-4xl font-semibold text-ink leading-tight">{job.title}</h1>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm text-ink-soft">
        <span className="flex items-center gap-1.5">
          <MapPin size={16} /> {job.location}
        </span>
        {salary && (
          <span className="flex items-center gap-1.5 font-mono text-pine-dark">
            <Briefcase size={16} /> {salary}
          </span>
        )}
        <span className="text-xs font-mono uppercase tracking-wide bg-amber/20 text-amber-dark px-2.5 py-1 rounded-full">
          {job.type}
        </span>
      </div>

      {job.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-5">
          {job.tags.map((tag) => (
            <span key={tag} className="text-xs font-mono bg-paper-raised border border-border rounded px-2.5 py-1 text-ink-soft">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="prose prose-sm max-w-none mt-8 text-ink-soft whitespace-pre-line leading-relaxed">
        {job.description}
      </div>

      <div className="mt-12 border-t border-border pt-8">
        {!user && (
          <div className="bg-paper-raised border border-border rounded-2xl p-6 text-center">
            <p className="text-ink-soft mb-4">Log in as a job seeker to apply for this role.</p>
            <Link to="/login" className="inline-block bg-pine text-white px-5 py-2.5 rounded-full font-medium hover:bg-pine-dark transition-colors">
              Log in to apply
            </Link>
          </div>
        )}

        {user?.role === 'employer' && (
          <p className="text-sm text-muted italic">Employer accounts can't apply to jobs.</p>
        )}

        {user?.role === 'jobseeker' && applied && (
          <div className="flex items-center gap-2 bg-pine/10 border border-pine/30 text-pine-dark rounded-2xl p-6">
            <CheckCircle2 size={20} />
            <span>Application sent. You can track its status from "My applications".</span>
          </div>
        )}

        {user?.role === 'jobseeker' && !applied && (
          <form onSubmit={handleApply} className="bg-paper-raised border border-border rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold mb-3">Apply for this role</h3>
            {error && <p className="text-danger text-sm mb-3">{error}</p>}
            <textarea
              required
              minLength={10}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell them why you're a great fit…"
              rows={5}
              className="w-full border border-border rounded-xl p-3 text-sm outline-none focus:border-pine transition-colors"
            />
            <button
              disabled={applying}
              className="mt-3 bg-pine text-white px-5 py-2.5 rounded-full font-medium hover:bg-pine-dark transition-colors disabled:opacity-60"
            >
              {applying ? 'Sending…' : 'Submit application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
