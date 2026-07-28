import { Link } from 'react-router-dom';
import { MapPin, Briefcase } from 'lucide-react';

function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = (n) => (n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  return fmt(min || max);
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function JobCard({ job }) {
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group block bg-paper-raised border border-border rounded-2xl p-6 hover:border-pine hover:shadow-[0_4px_0_0_var(--color-pine)] transition-all duration-150"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-muted mb-1">{job.company}</p>
          <h3 className="font-display text-xl font-semibold text-ink group-hover:text-pine transition-colors">
            {job.title}
          </h3>
        </div>
        <span className="shrink-0 text-xs font-mono uppercase tracking-wide bg-amber/20 text-amber-dark px-2.5 py-1 rounded-full">
          {job.type}
        </span>
      </div>

      <p className="text-sm text-ink-soft mt-3 line-clamp-2">{job.description}</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm text-muted">
        <span className="flex items-center gap-1">
          <MapPin size={14} /> {job.location}
        </span>
        {salary && (
          <span className="flex items-center gap-1 font-mono text-xs text-pine-dark">
            <Briefcase size={14} /> {salary}
          </span>
        )}
        <span className="ml-auto text-xs">{timeAgo(job.createdAt)}</span>
      </div>

      {job.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {job.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-[11px] font-mono bg-paper border border-border rounded px-2 py-0.5 text-ink-soft">
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
