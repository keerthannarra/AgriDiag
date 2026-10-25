import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFriendlyErrorMessage, getValidationFieldErrors } from '../services/errors';
import { validateLogin, isFormValid } from '../services/formValidation';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(() => {
    const notice = sessionStorage.getItem('agridiag_auth_notice');
    sessionStorage.removeItem('agridiag_auth_notice');
    return notice || '';
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async event => {
    event.preventDefault();
    if (loading) return;

    const validation = validateLogin(form);
    if (!isFormValid(validation)) {
      setFieldErrors(validation);
      return;
    }

    setError('');
    setFieldErrors({});
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (requestError) {
      setError(getFriendlyErrorMessage(requestError, 'login'));
      setFieldErrors(getValidationFieldErrors(requestError));
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
                onChange={event => {
                  setForm(current => ({ ...current, email: event.target.value }));
                  setFieldErrors(current => ({ ...current, email: '' }));
                }}
                required
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
              />
              {fieldErrors.email && <span className="auth-field-error" id="login-email-error">{fieldErrors.email}</span>}
            </div>
            <div className="auth-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={event => {
                  setForm(current => ({ ...current, password: event.target.value }));
                  setFieldErrors(current => ({ ...current, password: '' }));
                }}
                required
                autoComplete="current-password"
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
              />
              {fieldErrors.password && <span className="auth-field-error" id="login-password-error">{fieldErrors.password}</span>}
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
