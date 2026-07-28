import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('jobseeker');
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' });
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
      const user = await register({ ...form, role });
      navigate(user.role === 'employer' ? '/employer/dashboard' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">Create your account</h1>
      <p className="text-muted text-sm mb-8">Choose how you'll use Waypoint.</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setRole('jobseeker')}
          className={`rounded-xl p-4 text-left border transition-colors ${
            role === 'jobseeker' ? 'border-pine bg-pine/5' : 'border-border'
          }`}
        >
          <p className="font-semibold text-sm">I'm job hunting</p>
          <p className="text-xs text-muted mt-1">Search and apply to roles</p>
        </button>
        <button
          type="button"
          onClick={() => setRole('employer')}
          className={`rounded-xl p-4 text-left border transition-colors ${
            role === 'employer' ? 'border-pine bg-pine/5' : 'border-border'
          }`}
        >
          <p className="font-semibold text-sm">I'm hiring</p>
          <p className="text-xs text-muted mt-1">Post jobs, review applicants</p>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-danger text-sm">{error}</p>}
        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-muted">Full name</label>
          <input
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full mt-1 border border-border rounded-xl p-3 text-sm outline-none focus:border-pine transition-colors"
          />
        </div>
        {role === 'employer' && (
          <div>
            <label className="text-xs font-mono uppercase tracking-wide text-muted">Company name</label>
            <input
              required
              value={form.company}
              onChange={(e) => update('company', e.target.value)}
              className="w-full mt-1 border border-border rounded-xl p-3 text-sm outline-none focus:border-pine transition-colors"
            />
          </div>
        )}
        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-muted">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="w-full mt-1 border border-border rounded-xl p-3 text-sm outline-none focus:border-pine transition-colors"
          />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-muted">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            className="w-full mt-1 border border-border rounded-xl p-3 text-sm outline-none focus:border-pine transition-colors"
          />
        </div>
        <button
          disabled={loading}
          className="w-full bg-pine text-white py-3 rounded-full font-medium hover:bg-pine-dark transition-colors disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-muted mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-pine-dark font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}
