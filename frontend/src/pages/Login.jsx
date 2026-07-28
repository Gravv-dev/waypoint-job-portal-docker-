import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'employer' ? '/employer/dashboard' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not log in.');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(role) {
    setEmail(role === 'employer' ? 'employer@demo.com' : 'jobseeker@demo.com');
    setPassword('password123');
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">Welcome back</h1>
      <p className="text-muted text-sm mb-8">Log in to continue your search.</p>

      <div className="bg-amber/10 border border-amber/30 rounded-xl p-3 mb-6 text-xs text-ink-soft">
        Demo accounts:{' '}
        <button type="button" onClick={() => fillDemo('jobseeker')} className="underline font-medium text-pine-dark">
          job seeker
        </button>{' '}
        ·{' '}
        <button type="button" onClick={() => fillDemo('employer')} className="underline font-medium text-pine-dark">
          employer
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-danger text-sm">{error}</p>}
        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-muted">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 border border-border rounded-xl p-3 text-sm outline-none focus:border-pine transition-colors"
          />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-muted">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 border border-border rounded-xl p-3 text-sm outline-none focus:border-pine transition-colors"
          />
        </div>
        <button
          disabled={loading}
          className="w-full bg-pine text-white py-3 rounded-full font-medium hover:bg-pine-dark transition-colors disabled:opacity-60"
        >
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="text-sm text-muted mt-6">
        New here?{' '}
        <Link to="/register" className="text-pine-dark font-medium">
          Create an account
        </Link>
      </p>
    </div>
  );
}
