import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-card card-glass animate-scale-in">
        <div className="auth-header">
          <Link to="/" className="auth-logo">🌿 AgriDiag</Link>
          <h1>Welcome back</h1>
          <p>Sign in to continue diagnosing your plants</p>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{ marginTop: 'var(--sp-2)', padding: '0.85rem' }}
            disabled={loading}
            id="login-submit"
          >
            {loading ? <><span className="spinner spinner-sm" /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <div className="divider-text" style={{ margin: 'var(--sp-6) 0' }}>
          New to AgriDiag?
        </div>
        <Link to="/register" className="btn btn-outline w-full" style={{ justifyContent: 'center' }}>
          Create an account
        </Link>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--sp-8) var(--sp-4);
          position: relative;
          overflow: hidden;
        }
        .auth-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .auth-orb-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(34,197,94,0.1), transparent);
          top: -100px; left: -100px;
        }
        .auth-orb-2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(245,158,11,0.08), transparent);
          bottom: -60px; right: -60px;
        }
        .auth-card {
          width: 100%;
          max-width: 440px;
          padding: var(--sp-10);
          position: relative;
          z-index: 1;
        }
        .auth-header { text-align: center; margin-bottom: var(--sp-8); }
        .auth-logo {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--color-primary);
          display: block;
          margin-bottom: var(--sp-5);
        }
        .auth-header h1 { font-size: 1.8rem; margin-bottom: var(--sp-2); }
        .auth-header p { color: var(--text-muted); font-size: 0.92rem; }
      `}</style>
    </div>
  );
}
