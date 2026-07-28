import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import api from '../lib/api';

const STATUSES = ['Applied', 'Reviewed', 'Interview', 'Offer', 'Rejected'];

export default function JobApplicants() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchData() {
    setLoading(true);
    try {
      const res = await api.get(`/applications/job/${jobId}`);
      setApplications(res.data.applications);
      setJob(res.data.job);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load applicants.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  async function updateStatus(appId, status) {
    setApplications((apps) => apps.map((a) => (a.id === appId ? { ...a, status } : a)));
    try {
      await api.patch(`/applications/${appId}/status`, { status });
    } catch (err) {
      fetchData();
    }
  }

  if (loading) return <div className="max-w-4xl mx-auto px-6 py-16 text-muted font-mono text-sm">loading…</div>;
  if (error) return <div className="max-w-4xl mx-auto px-6 py-16 text-danger">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link to="/employer/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-pine mb-6">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      <h1 className="font-display text-3xl font-semibold text-ink">{job?.title}</h1>
      <p className="text-muted text-sm mt-1">
        {applications.length} applicant{applications.length === 1 ? '' : 's'}
      </p>

      {applications.length === 0 && (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl mt-8">
          <p className="text-ink-soft">No applicants yet. Check back soon.</p>
        </div>
      )}

      <div className="space-y-4 mt-8">
        {applications.map((app) => (
          <div key={app.id} className="bg-paper-raised border border-border rounded-2xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">{app.applicantName}</h3>
                <p className="flex items-center gap-1.5 text-sm text-muted mt-0.5">
                  <Mail size={13} /> {app.applicantEmail}
                </p>
              </div>
              <select
                value={app.status}
                onChange={(e) => updateStatus(app.id, e.target.value)}
                className="text-xs font-mono uppercase tracking-wide border border-border rounded-full px-3 py-1.5 bg-white outline-none focus:border-pine"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-sm text-ink-soft mt-3 whitespace-pre-line">{app.coverLetter}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
