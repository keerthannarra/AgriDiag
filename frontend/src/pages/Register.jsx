import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'FARMER', label: '🌾 Farmer', desc: 'Identify and treat plant diseases on your farm.' },
  { value: 'SCIENTIST', label: '🔬 Agricultural Scientist', desc: 'Research diseases and analyze agricultural data.' },
  { value: 'AGRICULTURIST', label: '🌱 Agriculturist', desc: 'Provide expert recommendations and consultations.' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'FARMER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-card card-glass animate-scale-in" style={{ maxWidth: 520 }}>
        <div className="auth-header">
          <Link to="/" className="auth-logo">🌿 AgriDiag</Link>
          <h1>Create your account</h1>
          <p>Start diagnosing plant diseases with AI</p>
        </div>

        {error && <div className="alert alert-error mb-4"><span>⚠️</span> {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full name</label>
            <input id="reg-name" type="text" className="form-input" placeholder="John Doe"
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email address</label>
            <input id="reg-email" type="email" className="form-input" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input id="reg-password" type="password" className="form-input" placeholder="Min. 6 characters"
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
          </div>

          {/* Role selection */}
          <div className="form-group">
            <label className="form-label">I am a…</label>
            <div className="role-grid">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  className={`role-card ${form.role === r.value ? 'selected' : ''}`}
                  onClick={() => setForm(p => ({ ...p, role: r.value }))}
                >
                  <span className="role-label">{r.label}</span>
                  <span className="role-desc">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full"
            style={{ padding: '0.85rem' }} disabled={loading} id="register-submit">
            {loading ? <><span className="spinner spinner-sm" /> Creating account…</> : 'Create Account'}
          </button>
        </form>

        <div className="divider-text" style={{ margin: 'var(--sp-6) 0' }}>Already have an account?</div>
        <Link to="/login" className="btn btn-outline w-full" style={{ justifyContent: 'center' }}>Sign In</Link>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: var(--sp-8) var(--sp-4);
          position: relative; overflow: hidden;
        }
        .auth-orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
        .auth-orb-1 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(34,197,94,0.1), transparent); top: -100px; left: -100px; }
        .auth-orb-2 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(245,158,11,0.08), transparent); bottom: -60px; right: -60px; }
        .auth-card { width: 100%; max-width: 440px; padding: var(--sp-10); position: relative; z-index: 1; }
        .auth-header { text-align: center; margin-bottom: var(--sp-8); }
        .auth-logo { font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: var(--color-primary); display: block; margin-bottom: var(--sp-5); }
        .auth-header h1 { font-size: 1.8rem; margin-bottom: var(--sp-2); }
        .auth-header p { color: var(--text-muted); font-size: 0.92rem; }
        .role-grid { display: flex; flex-direction: column; gap: var(--sp-2); }
        .role-card {
          text-align: left;
          padding: var(--sp-3) var(--sp-4);
          border: 1.5px solid var(--border);
          border-radius: var(--r-md);
          background: var(--bg-input);
          cursor: pointer;
          transition: all var(--t-fast);
          display: flex; flex-direction: column; gap: 2px;
        }
        .role-card:hover { border-color: var(--border-hover); }
        .role-card.selected { border-color: var(--color-primary); background: rgba(34,197,94,0.08); box-shadow: 0 0 12px rgba(34,197,94,0.15); }
        .role-label { font-weight: 700; font-size: 0.92rem; color: var(--text-primary); }
        .role-desc { font-size: 0.78rem; color: var(--text-muted); }
      `}</style>
    </div>
  );
}
