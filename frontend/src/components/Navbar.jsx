import { Link, useNavigate } from 'react-router-dom';
import { Compass, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
          <Compass size={22} strokeWidth={2.25} className="text-pine" />
          Waypoint
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="text-ink-soft hover:text-pine transition-colors">
            Browse jobs
          </Link>

          {!user && (
            <>
              <Link to="/login" className="text-ink-soft hover:text-pine transition-colors">
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-pine text-white px-4 py-2 rounded-full hover:bg-pine-dark transition-colors"
              >
                Get started
              </Link>
            </>
          )}

          {user?.role === 'jobseeker' && (
            <Link to="/applications" className="text-ink-soft hover:text-pine transition-colors">
              My applications
            </Link>
          )}

          {user?.role === 'employer' && (
            <>
              <Link to="/employer/dashboard" className="text-ink-soft hover:text-pine transition-colors">
                Dashboard
              </Link>
              <Link
                to="/employer/post"
                className="bg-pine text-white px-4 py-2 rounded-full hover:bg-pine-dark transition-colors"
              >
                Post a job
              </Link>
            </>
          )}

          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-ink-soft hover:text-danger transition-colors"
              title="Log out"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
