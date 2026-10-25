import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFriendlyErrorMessage, getValidationFieldErrors } from '../services/errors';
import './Auth.css';

const ROLES = [
  { value: 'FARMER', label: 'Farmer', mark: 'F', desc: 'Identify and treat plant diseases on your farm.' },
  { value: 'SCIENTIST', label: 'Agricultural Scientist', mark: 'S', desc: 'Research diseases and analyze agricultural data.' },
  { value: 'AGRICULTURIST', label: 'Agriculturist', mark: 'A', desc: 'Provide expert recommendations and consultations.' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'FARMER' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const updateForm = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
    setFieldErrors(current => ({ ...current, [field]: '' }));
    if (error) setError('');
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      setFieldErrors({ password: 'Use at least 6 characters.' });
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (requestError) {
      setError(getFriendlyErrorMessage(requestError, 'register'));
      setFieldErrors(getValidationFieldErrors(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--register">
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
          <span className="auth-eyebrow">GROW WITH MORE CONFIDENCE</span>
          <h1>Make every observation count.</h1>
          <p>Create your space to check plant health and keep your field notes close.</p>
        </div>
        <span className="auth-visual-caption">AGRICULTURE / OBSERVATION / CARE</span>
      </section>

      <section className="auth-form-side">
        <div className="auth-form-card auth-form-card--register">
          <div className="auth-form-heading">
            <span className="auth-eyebrow">GET STARTED</span>
            <h2>Create your account</h2>
            <p>Tell us a little about yourself to get set up.</p>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              <span aria-hidden="true">!</span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="reg-name">Full name</label>
              <input
                id="reg-name"
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={event => updateForm('name', event.target.value)}
                required
                autoComplete="name"
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? 'reg-name-error' : undefined}
              />
              {fieldErrors.name && <span className="auth-field-error" id="reg-name-error">{fieldErrors.name}</span>}
            </div>
            <div className="auth-field">
              <label htmlFor="reg-email">Email address</label>
              <input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={event => updateForm('email', event.target.value)}
                required
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'reg-email-error' : undefined}
              />
              {fieldErrors.email && <span className="auth-field-error" id="reg-email-error">{fieldErrors.email}</span>}
            </div>
            <div className="auth-field">
              <label htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={event => updateForm('password', event.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'reg-password-error' : 'reg-password-hint'}
              />
              {fieldErrors.password ? (
                <span className="auth-field-error" id="reg-password-error">{fieldErrors.password}</span>
              ) : (
                <span className="auth-field-hint" id="reg-password-hint">Use at least 6 characters.</span>
              )}
            </div>

            <fieldset className="auth-role-fieldset">
              <legend>Which best describes you?</legend>
              <div className="auth-role-grid">
                {ROLES.map(role => (
                  <button
                    key={role.value}
                    type="button"
                    className={`auth-role-card ${form.role === role.value ? 'is-selected' : ''}`}
                    onClick={() => updateForm('role', role.value)}
                    aria-pressed={form.role === role.value}
                  >
                    <span className="auth-role-mark" aria-hidden="true">{role.mark}</span>
                    <span className="auth-role-copy">
                      <strong>{role.label}</strong>
                      <small>{role.desc}</small>
                    </span>
                    <span className="auth-role-check" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </fieldset>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading} id="register-submit">
              {loading ? <><span className="spinner spinner-sm" /> Creating account…</> : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
