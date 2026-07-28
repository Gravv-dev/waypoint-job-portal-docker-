const STOPS = ['Applied', 'Reviewed', 'Interview', 'Offer'];

export default function WaypointRail({ status }) {
  if (status === 'Rejected') {
    return (
      <div className="flex items-center gap-2">
        <span className="waypoint-dot filled" style={{ background: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} />
        <span className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--color-danger)' }}>
          Not moving forward
        </span>
      </div>
    );
  }

  const currentIndex = STOPS.indexOf(status);

  return (
    <div className="w-full">
      <div className="waypoint-rail">
        {STOPS.map((stop, i) => (
          <div key={stop} className="flex items-center flex-1 last:flex-initial">
            <div
              className={`waypoint-dot ${i < currentIndex ? 'filled' : ''} ${i === currentIndex ? 'current' : ''}`}
              title={stop}
            />
            {i < STOPS.length - 1 && <div className={`waypoint-line ${i < currentIndex ? 'filled' : ''}`} />}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 font-mono text-[10px] uppercase tracking-wide text-muted">
        {STOPS.map((stop) => (
          <span key={stop} className={stop === status ? 'text-ink font-semibold' : ''}>
            {stop}
          </span>
        ))}
      </div>
    </div>
  );
}
