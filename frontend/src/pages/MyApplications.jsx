import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import api from '../lib/api';
import WaypointRail from '../components/WaypointRail';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/applications/mine')
      .then((res) => setApplications(res.data.applications))
      .catch(() => setError('Could not load your applications.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-3xl mx-auto px-6 py-16 text-muted font-mono text-sm">loading…</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-semibold text-ink">My applications</h1>
      <p className="text-muted text-sm mt-1">Track where each application stands.</p>

      {error && <p className="text-danger text-sm mt-4">{error}</p>}

      {applications.length === 0 && !error && (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl mt-8">
          <p className="font-display text-xl text-ink mb-2">No applications yet.</p>
          <p className="text-muted text-sm mb-4">Browse open roles and send your first application.</p>
          <Link to="/" className="inline-block bg-pine text-white px-5 py-2.5 rounded-full font-medium hover:bg-pine-dark transition-colors">
            Browse jobs
          </Link>
        </div>
      )}

      <div className="space-y-5 mt-8">
        {applications.map((app) => (
          <div key={app.id} className="bg-paper-raised border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-wide text-muted">{app.job?.company}</p>
                <Link to={`/jobs/${app.jobId}`} className="font-display text-lg font-semibold text-ink hover:text-pine transition-colors">
                  {app.job?.title || 'Job posting removed'}
                </Link>
                {app.job?.location && (
                  <p className="flex items-center gap-1 text-xs text-muted mt-1">
                    <MapPin size={12} /> {app.job.location}
                  </p>
                )}
              </div>
              <span className="text-xs font-mono text-muted shrink-0">
                {new Date(app.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="mt-5">
              <WaypointRail status={app.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
