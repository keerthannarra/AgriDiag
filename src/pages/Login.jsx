import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-visual" aria-label="AgriDiag plant health">
        <img
          className="auth-visual-image"
          src="https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1400&q=85"
          alt="Sunlight falling across healthy green leaves"
        />
        <div className="auth-visual-shade" />
        <Link to="/" className="auth-brand" aria-label="AgriDiag home">
          <span className="auth-brand-mark" aria-hidden="true">✿</span>
          <span>Agri<span>Diag</span></span>
        </Link>
        <div className="auth-visual-copy">
          <span className="auth-eyebrow">A CLOSER LOOK AT PLANT HEALTH</span>
          <h1>Good growing starts with noticing.</h1>
          <p>Get a clearer view of your plants and keep your growing notes together.</p>
        </div>
        <span className="auth-visual-caption">AGRICULTURE / OBSERVATION / CARE</span>
      </section>

      <section className="auth-form-side">
        <div className="auth-form-card">
          <div className="auth-form-heading">
            <span className="auth-eyebrow">WELCOME BACK</span>
            <h2>Sign in to AgriDiag</h2>
            <p>Pick up where you left off with your plants.</p>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              <span aria-hidden="true">!</span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
                required
                autoComplete="email"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={event => setForm(current => ({ ...current, password: event.target.value }))}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading} id="login-submit">
              {loading ? <><span className="spinner spinner-sm" /> Signing in…</> : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch">
            New to AgriDiag? <Link to="/register">Create an account</Link>
          </p>
          <p className="auth-privacy-note">Your growing records stay connected to your account.</p>
        </div>
      </section>
    </div>
  );
}
